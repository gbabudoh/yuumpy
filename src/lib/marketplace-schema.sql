-- Yuumpy Marketplace Schema (PostgreSQL)
-- Multi-vendor marketplace extension tables

-- Sellers table
CREATE TABLE IF NOT EXISTS sellers (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  store_name VARCHAR(255) NOT NULL,
  store_slug VARCHAR(255) UNIQUE NOT NULL,
  business_name VARCHAR(255),
  description TEXT,
  logo_url VARCHAR(500),
  banner_url VARCHAR(500),
  phone VARCHAR(20),
  website VARCHAR(500),
  address_line1 VARCHAR(255),
  address_line2 VARCHAR(255),
  city VARCHAR(100),
  state_province VARCHAR(100),
  postal_code VARCHAR(20),
  country VARCHAR(100) DEFAULT 'United States',
  stripe_connect_id VARCHAR(255),
  stripe_onboarding_complete BOOLEAN DEFAULT FALSE,
  commission_rate DECIMAL(5, 2) DEFAULT 12.00,
  status VARCHAR(15) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'suspended', 'rejected')),
  is_featured BOOLEAN DEFAULT FALSE,
  is_verified BOOLEAN DEFAULT FALSE,
  total_sales DECIMAL(12, 2) DEFAULT 0.00,
  total_orders INT DEFAULT 0,
  average_rating DECIMAL(3, 2) DEFAULT 0.00,
  total_reviews INT DEFAULT 0,
  email_verified BOOLEAN DEFAULT FALSE,
  last_login TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seller sessions
CREATE TABLE IF NOT EXISTS seller_sessions (
  id SERIAL PRIMARY KEY,
  seller_id INT NOT NULL,
  token VARCHAR(500) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (seller_id) REFERENCES sellers(id) ON DELETE CASCADE
);

-- Seller settings (per-seller configuration)
CREATE TABLE IF NOT EXISTS seller_settings (
  id SERIAL PRIMARY KEY,
  seller_id INT UNIQUE NOT NULL,
  shipping_policy TEXT,
  free_shipping_threshold DECIMAL(10, 2) DEFAULT NULL,
  flat_rate_shipping DECIMAL(10, 2) DEFAULT 5.99,
  processing_time VARCHAR(50) DEFAULT '1-3 business days',
  return_policy TEXT,
  return_window_days INT DEFAULT 30,
  accepts_returns BOOLEAN DEFAULT TRUE,
  payout_schedule VARCHAR(10) DEFAULT 'weekly' CHECK (payout_schedule IN ('daily', 'weekly', 'biweekly', 'monthly')),
  minimum_payout DECIMAL(10, 2) DEFAULT 25.00,
  email_on_new_order BOOLEAN DEFAULT TRUE,
  email_on_dispute BOOLEAN DEFAULT TRUE,
  email_on_review BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (seller_id) REFERENCES sellers(id) ON DELETE CASCADE
);

-- Seller reviews (buyer → seller trust ratings)
CREATE TABLE IF NOT EXISTS seller_reviews (
  id SERIAL PRIMARY KEY,
  seller_id INT NOT NULL,
  customer_id INT NOT NULL,
  order_id INT NOT NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(255),
  review_text TEXT,
  is_verified_purchase BOOLEAN DEFAULT TRUE,
  is_visible BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (seller_id) REFERENCES sellers(id) ON DELETE CASCADE,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  UNIQUE (customer_id, order_id)
);

-- Escrow transactions
CREATE TABLE IF NOT EXISTS escrow_transactions (
  id SERIAL PRIMARY KEY,
  order_id INT NOT NULL,
  seller_id INT NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  commission_amount DECIMAL(10, 2) NOT NULL,
  seller_payout_amount DECIMAL(10, 2) NOT NULL,
  status VARCHAR(25) DEFAULT 'held' CHECK (status IN ('held', 'released', 'refunded', 'disputed', 'partially_refunded')),
  hold_until TIMESTAMP NULL,
  released_at TIMESTAMP NULL,
  refunded_at TIMESTAMP NULL,
  stripe_transfer_id VARCHAR(255),
  admin_notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (seller_id) REFERENCES sellers(id) ON DELETE CASCADE
);

-- Disputes
CREATE TABLE IF NOT EXISTS disputes (
  id SERIAL PRIMARY KEY,
  order_id INT NOT NULL,
  customer_id INT NOT NULL,
  seller_id INT NOT NULL,
  escrow_id INT,
  reason VARCHAR(30) NOT NULL CHECK (reason IN ('item_not_received', 'item_not_as_described', 'defective_item', 'wrong_item', 'seller_unresponsive', 'other')),
  description TEXT NOT NULL,
  evidence_urls JSONB,
  status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'seller_responded', 'under_review', 'resolved_buyer', 'resolved_seller', 'resolved_split', 'closed')),
  resolution_notes TEXT,
  refund_amount DECIMAL(10, 2),
  resolved_by INT,
  resolved_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
  FOREIGN KEY (seller_id) REFERENCES sellers(id) ON DELETE CASCADE,
  FOREIGN KEY (escrow_id) REFERENCES escrow_transactions(id) ON DELETE SET NULL
);

-- Dispute messages (conversation thread)
CREATE TABLE IF NOT EXISTS dispute_messages (
  id SERIAL PRIMARY KEY,
  dispute_id INT NOT NULL,
  sender_type VARCHAR(10) NOT NULL CHECK (sender_type IN ('customer', 'seller', 'admin')),
  sender_id INT NOT NULL,
  message TEXT NOT NULL,
  attachment_urls JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (dispute_id) REFERENCES disputes(id) ON DELETE CASCADE
);

-- Commission configuration (admin-managed)
CREATE TABLE IF NOT EXISTS commission_config (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(10) NOT NULL CHECK (type IN ('global', 'category', 'seller')),
  target_id INT DEFAULT NULL,
  rate DECIMAL(5, 2) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO commission_config (name, type, rate, is_active) VALUES
('Default Platform Commission', 'global', 12.00, TRUE)
ON CONFLICT DO NOTHING;

-- Modifications to existing tables
ALTER TABLE products ADD COLUMN IF NOT EXISTS seller_id INT DEFAULT NULL;
ALTER TABLE products ADD COLUMN IF NOT EXISTS seller_approved BOOLEAN DEFAULT FALSE;

ALTER TABLE orders ADD COLUMN IF NOT EXISTS seller_id INT DEFAULT NULL;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS escrow_status VARCHAR(10) CHECK (escrow_status IN ('held', 'released', 'refunded', 'disputed'));
ALTER TABLE orders ADD COLUMN IF NOT EXISTS commission_amount DECIMAL(10, 2) DEFAULT 0.00;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS seller_payout_amount DECIMAL(10, 2) DEFAULT 0.00;

ALTER TABLE order_items ADD COLUMN IF NOT EXISTS seller_id INT DEFAULT NULL;

CREATE INDEX IF NOT EXISTS idx_sellers_store_slug ON sellers(store_slug);
CREATE INDEX IF NOT EXISTS idx_sellers_status ON sellers(status);
CREATE INDEX IF NOT EXISTS idx_seller_sessions_token ON seller_sessions(token);
CREATE INDEX IF NOT EXISTS idx_escrow_status ON escrow_transactions(status);
CREATE INDEX IF NOT EXISTS idx_escrow_seller ON escrow_transactions(seller_id);
CREATE INDEX IF NOT EXISTS idx_disputes_status ON disputes(status);
CREATE INDEX IF NOT EXISTS idx_disputes_seller ON disputes(seller_id);
CREATE INDEX IF NOT EXISTS idx_disputes_customer ON disputes(customer_id);
CREATE INDEX IF NOT EXISTS idx_products_seller ON products(seller_id);
CREATE INDEX IF NOT EXISTS idx_seller_reviews_seller ON seller_reviews(seller_id);
