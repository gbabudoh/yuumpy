-- Yuumpy Database Schema
CREATE DATABASE IF NOT EXISTS yuumpy;
USE yuumpy;

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  image_url VARCHAR(500),
  parent_id INT NULL,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- Brands table
CREATE TABLE IF NOT EXISTS brands (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  logo_url VARCHAR(500),
  website_url VARCHAR(500),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  short_description VARCHAR(500),
  price DECIMAL(10, 2) NOT NULL,
  original_price DECIMAL(10, 2),
  affiliate_url VARCHAR(1000) NOT NULL,
  purchase_type ENUM('affiliate', 'direct') DEFAULT 'affiliate',
  product_condition ENUM('new', 'refurbished', 'used') DEFAULT 'new',
  stock_quantity INT DEFAULT NULL,
  image_url LONGTEXT,
  gallery JSON,
  category_id INT,
  brand_id INT,
  is_featured BOOLEAN DEFAULT FALSE,
  is_bestseller BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  meta_title VARCHAR(255),
  meta_description TEXT,
  -- Banner ad fields
  banner_ad_title VARCHAR(255),
  banner_ad_description TEXT,
  banner_ad_image_url VARCHAR(1000),
  banner_ad_link_url VARCHAR(1000),
  banner_ad_duration ENUM('1_week', '2_weeks', '3_weeks', '4_weeks', '6_months') DEFAULT '1_week',
  banner_ad_is_repeating BOOLEAN DEFAULT FALSE,
  banner_ad_start_date DATETIME,
  banner_ad_end_date DATETIME,
  banner_ad_is_active BOOLEAN DEFAULT FALSE,
  colors JSON DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
  FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE SET NULL
);

-- Banner ads table
CREATE TABLE IF NOT EXISTS banner_ads (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  image_url VARCHAR(500) NOT NULL,
  link_url VARCHAR(1000),
  position ENUM('top', 'middle', 'bottom') DEFAULT 'top',
  is_active BOOLEAN DEFAULT TRUE,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Analytics table
CREATE TABLE IF NOT EXISTS analytics (
  id INT PRIMARY KEY AUTO_INCREMENT,
  event_type ENUM('page_view', 'product_view', 'click', 'purchase', 'add_to_cart', 'email_signup', 'banner_click') NOT NULL,
  product_id INT,
  category_id INT,
  user_ip VARCHAR(45),
  user_agent TEXT,
  referrer VARCHAR(500),
  page_url VARCHAR(500),
  metadata JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- Analytics settings table
CREATE TABLE IF NOT EXISTS analytics_settings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  google_analytics_enabled BOOLEAN DEFAULT FALSE,
  google_analytics_tracking_id VARCHAR(50),
  matomo_enabled BOOLEAN DEFAULT FALSE,
  matomo_url VARCHAR(500),
  matomo_site_id VARCHAR(10),
  custom_events_config JSON,
  privacy_settings JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Payment transactions table
CREATE TABLE IF NOT EXISTS payments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  stripe_payment_intent_id VARCHAR(255) UNIQUE NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'GBP',
  status ENUM('pending', 'succeeded', 'failed', 'canceled') DEFAULT 'pending',
  customer_email VARCHAR(255),
  banner_ad_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (banner_ad_id) REFERENCES banner_ads(id) ON DELETE SET NULL
);

-- Insert main categories
INSERT INTO categories (name, slug, description, sort_order) VALUES
('Fashion', 'fashion', 'Clothing, shoes, bags, accessories, jewelry', 1),
('Electronics', 'electronics', 'Smartphones, laptops, wearables, audio, cameras, gaming', 2),
('Household', 'household', 'Kitchen, furniture, bedding, cleaning, home improvement', 3),
('Cosmetics', 'cosmetics', 'Skincare, makeup, hair care, fragrances, grooming', 4),
('Digital', 'digital', 'Web hosting, software, courses, streaming, AI tools, apps', 5);

-- Insert sub-categories for Fashion
INSERT INTO categories (name, slug, description, parent_id, sort_order) VALUES
('Men\'s Clothing', 'mens-clothing', 'Men\'s shirts, pants, suits, casual wear', 1, 1),
('Women\'s Clothing', 'womens-clothing', 'Women\'s dresses, tops, pants, formal wear', 1, 2),
('Shoes', 'shoes', 'Men\'s and women\'s shoes, sneakers, boots', 1, 3),
('Accessories', 'accessories', 'Bags, watches, jewelry, sunglasses', 1, 4);

-- Insert sub-categories for Electronics
INSERT INTO categories (name, slug, description, parent_id, sort_order) VALUES
('Smartphones', 'smartphones', 'Mobile phones, cases, accessories', 2, 1),
('Laptops & Computers', 'laptops-computers', 'Laptops, desktops, tablets, accessories', 2, 2),
('Audio & Headphones', 'audio-headphones', 'Headphones, speakers, earbuds, audio equipment', 2, 3),
('Gaming', 'gaming', 'Gaming consoles, games, accessories', 2, 4);

-- Insert sub-categories for Household
INSERT INTO categories (name, slug, description, parent_id, sort_order) VALUES
('Kitchen & Dining', 'kitchen-dining', 'Cookware, appliances, dining sets', 3, 1),
('Furniture', 'furniture', 'Living room, bedroom, office furniture', 3, 2),
('Home Decor', 'home-decor', 'Wall art, lighting, decorative items', 3, 3),
('Cleaning & Organization', 'cleaning-organization', 'Cleaning supplies, storage, organization', 3, 4);

-- Insert sub-categories for Cosmetics
INSERT INTO categories (name, slug, description, parent_id, sort_order) VALUES
('Skincare', 'skincare', 'Face creams, serums, cleansers, moisturizers', 4, 1),
('Makeup', 'makeup', 'Foundation, lipstick, eyeshadow, cosmetics', 4, 2),
('Hair Care', 'hair-care', 'Shampoo, conditioner, styling products', 4, 3),
('Fragrances', 'fragrances', 'Perfumes, colognes, body sprays', 4, 4);

-- Insert sub-categories for Digital
INSERT INTO categories (name, slug, description, parent_id, sort_order) VALUES
('Web Hosting', 'web-hosting', 'Domain names, hosting services, SSL certificates', 5, 1),
('Software & Apps', 'software-apps', 'Productivity software, mobile apps, tools', 5, 2),
('Online Courses', 'online-courses', 'Educational courses, training programs', 5, 3),
('Digital Services', 'digital-services', 'AI tools, design services, marketing tools', 5, 4);

-- Insert sample brands
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
('Google', 'google', 'Technology company specializing in internet services', 'https://google.com');

-- Insert sample products
INSERT INTO products (name, slug, description, short_description, price, original_price, affiliate_url, image_url, category_id, is_featured, is_bestseller) VALUES
('Wireless Bluetooth Headphones', 'wireless-bluetooth-headphones', 'High-quality wireless headphones with noise cancellation and 30-hour battery life.', 'Premium wireless headphones with noise cancellation', 99.99, 149.99, 'https://example.com/affiliate/headphones', 'https://res.cloudinary.com/your-cloud/image/upload/v1/headphones.jpg', 1, TRUE, TRUE),
('Smart Fitness Watch', 'smart-fitness-watch', 'Advanced fitness tracking with heart rate monitor, GPS, and water resistance.', 'Track your fitness with this smart watch', 199.99, 299.99, 'https://example.com/affiliate/smartwatch', 'https://res.cloudinary.com/your-cloud/image/upload/v1/smartwatch.jpg', 1, TRUE, FALSE),
('Designer T-Shirt', 'designer-t-shirt', 'Comfortable cotton t-shirt with modern design and premium quality.', 'Comfortable designer t-shirt', 29.99, 49.99, 'https://example.com/affiliate/tshirt', 'https://res.cloudinary.com/your-cloud/image/upload/v1/tshirt.jpg', 2, FALSE, TRUE);

-- Migration: Add new columns to existing products table (run if upgrading existing database)
-- ALTER TABLE products ADD COLUMN purchase_type ENUM('affiliate', 'direct') DEFAULT 'affiliate' AFTER affiliate_url;
-- ALTER TABLE products ADD COLUMN product_condition ENUM('new', 'refurbished', 'used') DEFAULT 'new' AFTER purchase_type;
-- ALTER TABLE products ADD COLUMN stock_quantity INT DEFAULT NULL AFTER product_condition;