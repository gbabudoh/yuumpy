-- Sample data for Yuumpy database
USE yuumpy;

-- Insert sample products with correct category IDs
INSERT INTO products (name, slug, description, short_description, price, original_price, affiliate_url, image_url, category_id, brand_id, is_featured, is_bestseller, rating, reviews) VALUES
-- Electronics products
('iPhone 15 Pro', 'iphone-15-pro', 'Latest iPhone with advanced camera system, A17 Pro chip, and titanium design.', 'Premium smartphone with cutting-edge technology', 999.99, 1199.99, 'https://apple.com/iphone-15-pro', 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600', 2, 1, TRUE, TRUE, 4.8, 1250),
('Samsung Galaxy S24', 'samsung-galaxy-s24', 'Powerful Android smartphone with AI features and premium camera system.', 'AI-powered smartphone with exceptional camera', 899.99, 1099.99, 'https://samsung.com/galaxy-s24', 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600', 2, 2, TRUE, FALSE, 4.7, 980),
('MacBook Pro M3', 'macbook-pro-m3', 'Professional laptop with M3 chip, stunning display, and all-day battery life.', 'Professional laptop for creators and developers', 1999.99, 2299.99, 'https://apple.com/macbook-pro', 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600', 2, 1, TRUE, TRUE, 4.9, 2100),
('Sony WH-1000XM5 Headphones', 'sony-wh-1000xm5', 'Industry-leading noise canceling wireless headphones with exceptional sound quality.', 'Premium noise-canceling headphones', 399.99, 499.99, 'https://sony.com/wh-1000xm5', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600', 2, 5, FALSE, TRUE, 4.6, 850),

-- Fashion products  
('Nike Air Max 270', 'nike-air-max-270', 'Comfortable running shoes with Max Air cushioning and modern design.', 'Comfortable running shoes with Max Air', 129.99, 159.99, 'https://nike.com/air-max-270', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600', 1, 3, FALSE, TRUE, 4.5, 3200),
('Adidas Ultraboost 22', 'adidas-ultraboost-22', 'High-performance running shoes with Boost midsole technology.', 'High-performance running shoes', 179.99, 199.99, 'https://adidas.com/ultraboost-22', 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600', 1, 4, TRUE, FALSE, 4.7, 2800),
('Designer Leather Jacket', 'designer-leather-jacket', 'Premium leather jacket with classic design and superior craftsmanship.', 'Premium leather jacket for any occasion', 299.99, 399.99, 'https://example.com/leather-jacket', 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600', 1, NULL, FALSE, TRUE, 4.4, 450),
('Luxury Watch', 'luxury-watch', 'Elegant timepiece with Swiss movement and premium materials.', 'Elegant Swiss-made timepiece', 899.99, 1299.99, 'https://example.com/luxury-watch', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600', 1, NULL, TRUE, FALSE, 4.8, 1200),

-- Household products
('Kitchen Stand Mixer', 'kitchen-stand-mixer', 'Professional stand mixer with multiple attachments for all your baking needs.', 'Professional stand mixer for baking', 249.99, 329.99, 'https://example.com/stand-mixer', 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600', 3, NULL, FALSE, TRUE, 4.6, 1800),
('Smart Home Hub', 'smart-home-hub', 'Central control for all your smart home devices with voice assistant integration.', 'Control your smart home with voice commands', 149.99, 199.99, 'https://example.com/smart-hub', 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=600', 3, NULL, TRUE, FALSE, 4.3, 950),
('Memory Foam Mattress', 'memory-foam-mattress', 'Premium memory foam mattress for ultimate comfort and support.', 'Ultimate comfort with memory foam technology', 599.99, 799.99, 'https://example.com/memory-foam-mattress', 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600', 3, NULL, FALSE, TRUE, 4.7, 2100),

-- Cosmetics products
('Premium Skincare Set', 'premium-skincare-set', 'Complete skincare routine with cleanser, serum, and moisturizer.', 'Complete skincare routine for healthy skin', 89.99, 129.99, 'https://example.com/skincare-set', 'https://images.unsplash.com/photo-1570194065650-d99fb4bedf0a?w=600', 4, NULL, TRUE, TRUE, 4.5, 3200),
('Luxury Makeup Palette', 'luxury-makeup-palette', 'Professional makeup palette with 24 shades for any occasion.', 'Professional makeup palette with 24 shades', 79.99, 99.99, 'https://example.com/makeup-palette', 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600', 4, NULL, FALSE, TRUE, 4.4, 1800),
('Hair Care Bundle', 'hair-care-bundle', 'Complete hair care set with shampoo, conditioner, and styling products.', 'Complete hair care solution', 49.99, 69.99, 'https://example.com/hair-care-bundle', 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600', 4, NULL, TRUE, FALSE, 4.6, 2500),

-- Digital products
('Web Hosting Package', 'web-hosting-package', 'Professional web hosting with SSL, unlimited bandwidth, and 24/7 support.', 'Professional web hosting with SSL included', 99.99, 149.99, 'https://example.com/web-hosting', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600', 5, NULL, TRUE, TRUE, 4.8, 4500),
('Online Course Bundle', 'online-course-bundle', 'Complete programming course bundle with 50+ hours of content.', 'Learn programming with 50+ hours of content', 199.99, 299.99, 'https://example.com/programming-course', 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600', 5, NULL, FALSE, TRUE, 4.7, 3200),
('AI Writing Tool Subscription', 'ai-writing-tool-subscription', 'Advanced AI-powered writing assistant for content creation.', 'AI-powered writing assistant for content creation', 29.99, 49.99, 'https://example.com/ai-writing-tool', 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600', 5, NULL, TRUE, FALSE, 4.6, 1800);
