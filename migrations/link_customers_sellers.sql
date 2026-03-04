-- Link sellers to customers: every seller is a customer who activated selling
ALTER TABLE sellers ADD COLUMN IF NOT EXISTS customer_id INT UNIQUE DEFAULT NULL AFTER id;
ALTER TABLE sellers MODIFY COLUMN password_hash VARCHAR(255) NULL;
ALTER TABLE sellers MODIFY COLUMN email VARCHAR(255) NOT NULL;

-- Index for fast lookup
CREATE INDEX IF NOT EXISTS idx_sellers_customer_id ON sellers(customer_id);
