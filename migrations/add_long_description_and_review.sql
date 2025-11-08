-- Migration: Add long_description and product_review fields to products table
-- Date: 2025-11-08

USE yuumpy;

-- Add long_description field (for detailed product information)
ALTER TABLE products 
ADD COLUMN long_description TEXT AFTER short_description;

-- Add product_review field (for expert insights/reviews)
ALTER TABLE products 
ADD COLUMN product_review TEXT AFTER long_description;

-- Update existing products to have empty values for new fields
UPDATE products 
SET long_description = '', product_review = '' 
WHERE long_description IS NULL OR product_review IS NULL;
