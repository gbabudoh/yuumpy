-- Yuumpy Database Schema (PostgreSQL)

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  image_url VARCHAR(500),
  parent_id INT NULL,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- Brands table
CREATE TABLE IF NOT EXISTS brands (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  logo_url VARCHAR(500),
  website_url VARCHAR(500),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  short_description VARCHAR(500),
  price DECIMAL(10, 2) NOT NULL,
  original_price DECIMAL(10, 2),
  affiliate_url VARCHAR(1000) NOT NULL,
  purchase_type VARCHAR(20) DEFAULT 'affiliate' CHECK (purchase_type IN ('affiliate', 'direct')),
  product_condition VARCHAR(100) DEFAULT 'Handcrafted',
  stock_quantity INT DEFAULT NULL,
  image_url TEXT,
  gallery JSONB,
  category_id INT,
  brand_id INT,
  is_featured BOOLEAN DEFAULT FALSE,
  is_bestseller BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  meta_title VARCHAR(255),
  meta_description TEXT,
  banner_ad_title VARCHAR(255),
  banner_ad_description TEXT,
  banner_ad_image_url VARCHAR(1000),
  banner_ad_link_url VARCHAR(1000),
  banner_ad_duration VARCHAR(20) DEFAULT '1_week' CHECK (banner_ad_duration IN ('1_week', '2_weeks', '3_weeks', '4_weeks', '6_months')),
  banner_ad_is_repeating BOOLEAN DEFAULT FALSE,
  banner_ad_start_date TIMESTAMP,
  banner_ad_end_date TIMESTAMP,
  banner_ad_is_active BOOLEAN DEFAULT FALSE,
  colors JSONB DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
  FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE SET NULL
);

-- Banner ads table
CREATE TABLE IF NOT EXISTS banner_ads (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  image_url VARCHAR(500) NOT NULL,
  link_url VARCHAR(1000),
  position VARCHAR(10) DEFAULT 'top' CHECK (position IN ('top', 'middle', 'bottom')),
  is_active BOOLEAN DEFAULT TRUE,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Analytics table
CREATE TABLE IF NOT EXISTS analytics (
  id SERIAL PRIMARY KEY,
  event_type VARCHAR(20) NOT NULL CHECK (event_type IN ('page_view', 'product_view', 'click', 'purchase', 'add_to_cart', 'email_signup', 'banner_click')),
  product_id INT,
  category_id INT,
  user_ip VARCHAR(45),
  user_agent TEXT,
  referrer VARCHAR(500),
  page_url VARCHAR(500),
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- Analytics settings table
CREATE TABLE IF NOT EXISTS analytics_settings (
  id SERIAL PRIMARY KEY,
  google_analytics_enabled BOOLEAN DEFAULT FALSE,
  google_analytics_tracking_id VARCHAR(50),
  matomo_enabled BOOLEAN DEFAULT FALSE,
  matomo_url VARCHAR(500),
  matomo_site_id VARCHAR(10),
  custom_events_config JSONB,
  privacy_settings JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Payment transactions table
CREATE TABLE IF NOT EXISTS payments (
  id SERIAL PRIMARY KEY,
  stripe_payment_intent_id VARCHAR(255) UNIQUE NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'GBP',
  status VARCHAR(10) DEFAULT 'pending' CHECK (status IN ('pending', 'succeeded', 'failed', 'canceled')),
  customer_email VARCHAR(255),
  banner_ad_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (banner_ad_id) REFERENCES banner_ads(id) ON DELETE SET NULL
);

-- Trigger function to auto-update updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Seed data: main categories
INSERT INTO categories (name, slug, description, sort_order) VALUES
('Fashion', 'fashion', 'Clothing, shoes, bags, accessories, jewelry', 1),
('Electronics', 'electronics', 'Smartphones, laptops, wearables, audio, cameras, gaming', 2),
('Household', 'household', 'Kitchen, furniture, bedding, cleaning, home improvement', 3),
('Cosmetics', 'cosmetics', 'Skincare, makeup, hair care, fragrances, grooming', 4),
('Digital', 'digital', 'Web hosting, software, courses, streaming, AI tools, apps', 5)
ON CONFLICT (slug) DO NOTHING;

-- Sub-categories for Fashion
INSERT INTO categories (name, slug, description, parent_id, sort_order) VALUES
('Men''s Clothing', 'mens-clothing', 'Men''s shirts, pants, suits, casual wear', 1, 1),
('Women''s Clothing', 'womens-clothing', 'Women''s dresses, tops, pants, formal wear', 1, 2),
('Shoes', 'shoes', 'Men''s and women''s shoes, sneakers, boots', 1, 3),
('Accessories', 'accessories', 'Bags, watches, jewelry, sunglasses', 1, 4)
ON CONFLICT (slug) DO NOTHING;

-- Sub-categories for Electronics
INSERT INTO categories (name, slug, description, parent_id, sort_order) VALUES
('Smartphones', 'smartphones', 'Mobile phones, cases, accessories', 2, 1),
('Laptops & Computers', 'laptops-computers', 'Laptops, desktops, tablets, accessories', 2, 2),
('Audio & Headphones', 'audio-headphones', 'Headphones, speakers, earbuds, audio equipment', 2, 3),
('Gaming', 'gaming', 'Gaming consoles, games, accessories', 2, 4)
ON CONFLICT (slug) DO NOTHING;

-- Sub-categories for Household
INSERT INTO categories (name, slug, description, parent_id, sort_order) VALUES
('Kitchen & Dining', 'kitchen-dining', 'Cookware, appliances, dining sets', 3, 1),
('Furniture', 'furniture', 'Living room, bedroom, office furniture', 3, 2),
('Home Decor', 'home-decor', 'Wall art, lighting, decorative items', 3, 3),
('Cleaning & Organization', 'cleaning-organization', 'Cleaning supplies, storage, organization', 3, 4)
ON CONFLICT (slug) DO NOTHING;

-- Sub-categories for Cosmetics
INSERT INTO categories (name, slug, description, parent_id, sort_order) VALUES
('Skincare', 'skincare', 'Face creams, serums, cleansers, moisturizers', 4, 1),
('Makeup', 'makeup', 'Foundation, lipstick, eyeshadow, cosmetics', 4, 2),
('Hair Care', 'hair-care', 'Shampoo, conditioner, styling products', 4, 3),
('Fragrances', 'fragrances', 'Perfumes, colognes, body sprays', 4, 4)
ON CONFLICT (slug) DO NOTHING;

-- Sub-categories for Digital
INSERT INTO categories (name, slug, description, parent_id, sort_order) VALUES
('Web Hosting', 'web-hosting', 'Domain names, hosting services, SSL certificates', 5, 1),
('Software & Apps', 'software-apps', 'Productivity software, mobile apps, tools', 5, 2),
('Online Courses', 'online-courses', 'Educational courses, training programs', 5, 3),
('Digital Services', 'digital-services', 'AI tools, design services, marketing tools', 5, 4)
ON CONFLICT (slug) DO NOTHING;

-- Sample brands
INSERT INTO brands (name, slug, description, website_url) VALUES
('Apple', 'apple', 'Technology company known for iPhones, MacBooks, and iPads', 'https://apple.com'),
('Samsung', 'samsung', 'Electronics and technology company', 'https://samsung.com'),
('Nike', 'nike', 'Athletic footwear and apparel company', 'https://nike.com'),
('Adidas', 'adidas', 'Sports footwear and clothing brand', 'https://adidas.com'),
('Sony', 'sony', 'Electronics and entertainment company', 'https://sony.com'),
('Canon', 'canon', 'Camera and imaging equipment manufacturer', 'https://canon.com'),
('Dell', 'dell', 'Computer technology company', 'https://dell.com'),
('HP', 'hp', 'Technology company specializing in computers and printers', 'https://hp.com'),
('Amazon', 'amazon', 'E-commerce and cloud computing company', 'https://amazon.com'),
('Google', 'google', 'Technology company specializing in internet services', 'https://google.com')
ON CONFLICT (slug) DO NOTHING;
