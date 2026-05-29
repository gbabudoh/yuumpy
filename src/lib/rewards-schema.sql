-- Rewards System Schema (PostgreSQL)

CREATE TABLE IF NOT EXISTS customer_rewards (
  id SERIAL PRIMARY KEY,
  customer_id INT NOT NULL UNIQUE,
  points_balance INT DEFAULT 0,
  lifetime_points_earned INT DEFAULT 0,
  lifetime_points_redeemed INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS rewards_history (
  id SERIAL PRIMARY KEY,
  customer_id INT NOT NULL,
  points INT NOT NULL,
  transaction_type VARCHAR(10) DEFAULT 'earned' CHECK (transaction_type IN ('earned', 'redeemed', 'expired', 'adjusted')),
  description VARCHAR(500),
  order_id INT NULL,
  order_number VARCHAR(50) NULL,
  expires_at DATE NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_rewards_history_customer_id ON rewards_history(customer_id);
CREATE INDEX IF NOT EXISTS idx_rewards_history_created_at ON rewards_history(created_at);
CREATE INDEX IF NOT EXISTS idx_rewards_history_order_id ON rewards_history(order_id);
