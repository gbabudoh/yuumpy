-- Notifications System Schema
-- This adds support for customer notifications

-- Customer notifications table
CREATE TABLE IF NOT EXISTS customer_notifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  customer_id INT NOT NULL,
  type ENUM('order', 'reward', 'promotion', 'system', 'shipping') DEFAULT 'system',
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  link_url VARCHAR(500) NULL,
  is_read BOOLEAN DEFAULT FALSE,
  order_id INT NULL,
  order_number VARCHAR(50) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_notifications_customer_id ON customer_notifications(customer_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON customer_notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON customer_notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_order_id ON customer_notifications(order_id);

