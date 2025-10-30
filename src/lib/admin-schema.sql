-- Admin Users Management Tables

-- Admin users table with roles and permissions
CREATE TABLE IF NOT EXISTS admin_users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('super_admin', 'content_admin', 'product_admin') NOT NULL DEFAULT 'content_admin',
  permissions JSON,
  is_active BOOLEAN DEFAULT TRUE,
  last_login TIMESTAMP NULL,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES admin_users(id) ON DELETE SET NULL
);

-- Admin sessions table for authentication
CREATE TABLE IF NOT EXISTS admin_sessions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  admin_user_id INT NOT NULL,
  session_token VARCHAR(255) NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (admin_user_id) REFERENCES admin_users(id) ON DELETE CASCADE
);

-- Insert default super admin user (password: admin123)
INSERT INTO admin_users (username, email, password_hash, role, permissions, created_by) VALUES
('admin', 'admin@yuumpy.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'super_admin', 
 JSON_OBJECT(
   'can_manage_users', true,
   'can_manage_products', true,
   'can_manage_categories', true,
   'can_manage_subcategories', true,
   'can_manage_brands', true,
   'can_manage_banner_ads', true,
   'can_manage_product_banner_ads', true,
   'can_manage_analytics', true,
   'can_manage_seo', true,
   'can_manage_settings', true,
   'can_manage_emails', true,
   'can_manage_pages', true
 ), NULL)
ON DUPLICATE KEY UPDATE
username = VALUES(username),
email = VALUES(email);

-- Insert sample content admin user (password: content123)
INSERT INTO admin_users (username, email, password_hash, role, permissions, created_by) VALUES
('content_admin', 'content@yuumpy.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'content_admin',
 JSON_OBJECT(
   'can_manage_users', false,
   'can_manage_products', true,
   'can_manage_categories', true,
   'can_manage_subcategories', true,
   'can_manage_brands', true,
   'can_manage_banner_ads', false,
   'can_manage_product_banner_ads', false,
   'can_manage_analytics', false,
   'can_manage_seo', false,
   'can_manage_settings', false,
   'can_manage_emails', false,
   'can_manage_pages', false
 ), 1)
ON DUPLICATE KEY UPDATE
username = VALUES(username),
email = VALUES(email);

-- Insert sample product admin user (password: product123)
INSERT INTO admin_users (username, email, password_hash, role, permissions, created_by) VALUES
('product_admin', 'product@yuumpy.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'product_admin',
 JSON_OBJECT(
   'can_manage_users', false,
   'can_manage_products', true,
   'can_manage_categories', false,
   'can_manage_subcategories', false,
   'can_manage_brands', false,
   'can_manage_banner_ads', false,
   'can_manage_product_banner_ads', false,
   'can_manage_analytics', false,
   'can_manage_seo', false,
   'can_manage_settings', false,
   'can_manage_emails', false,
   'can_manage_pages', false
 ), 1)
ON DUPLICATE KEY UPDATE
username = VALUES(username),
email = VALUES(email);
