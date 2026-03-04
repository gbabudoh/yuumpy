-- Add online presence tracking to sellers
ALTER TABLE sellers ADD COLUMN IF NOT EXISTS is_online BOOLEAN DEFAULT FALSE;
ALTER TABLE sellers ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMP NULL;
CREATE INDEX IF NOT EXISTS idx_sellers_online ON sellers(is_online);
