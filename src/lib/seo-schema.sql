-- SEO Management Tables (PostgreSQL)

CREATE TABLE IF NOT EXISTS seo_settings (
  id SERIAL PRIMARY KEY,
  page_type VARCHAR(50) NOT NULL UNIQUE,
  meta_title VARCHAR(255),
  meta_description TEXT,
  meta_keywords TEXT,
  og_title VARCHAR(255),
  og_description TEXT,
  og_image VARCHAR(500),
  twitter_title VARCHAR(255),
  twitter_description TEXT,
  twitter_image VARCHAR(500),
  no_index BOOLEAN DEFAULT FALSE,
  no_follow BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS product_seo (
  id SERIAL PRIMARY KEY,
  product_id INT NOT NULL,
  meta_title VARCHAR(255),
  meta_description TEXT,
  meta_keywords TEXT,
  og_title VARCHAR(255),
  og_description TEXT,
  og_image VARCHAR(500),
  twitter_title VARCHAR(255),
  twitter_description TEXT,
  twitter_image VARCHAR(500),
  no_index BOOLEAN DEFAULT FALSE,
  no_follow BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  UNIQUE (product_id)
);

CREATE TABLE IF NOT EXISTS category_seo (
  id SERIAL PRIMARY KEY,
  category_id INT NOT NULL,
  meta_title VARCHAR(255),
  meta_description TEXT,
  meta_keywords TEXT,
  og_title VARCHAR(255),
  og_description TEXT,
  og_image VARCHAR(500),
  twitter_title VARCHAR(255),
  twitter_description TEXT,
  twitter_image VARCHAR(500),
  no_index BOOLEAN DEFAULT FALSE,
  no_follow BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
  UNIQUE (category_id)
);

CREATE TABLE IF NOT EXISTS page_seo (
  id SERIAL PRIMARY KEY,
  page_id INT NOT NULL,
  meta_title VARCHAR(255),
  meta_description TEXT,
  meta_keywords TEXT,
  og_title VARCHAR(255),
  og_description TEXT,
  og_image VARCHAR(500),
  twitter_title VARCHAR(255),
  twitter_description TEXT,
  twitter_image VARCHAR(500),
  no_index BOOLEAN DEFAULT FALSE,
  no_follow BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (page_id) REFERENCES pages(id) ON DELETE CASCADE,
  UNIQUE (page_id)
);

INSERT INTO seo_settings (page_type, meta_title, meta_description, meta_keywords, og_title, og_description) VALUES
('home', 'Yuumpy - Discover Amazing Products', 'Discover amazing products from our curated collection. Find the best deals and quality products for your needs.', 'products, deals, shopping, online store, curated collection', 'Yuumpy - Discover Amazing Products', 'Discover amazing products from our curated collection. Find the best deals and quality products for your needs.'),
('products', 'All Products - Yuumpy', 'Browse our complete collection of amazing products. Find exactly what you need with our curated selection.', 'products, browse, collection, shopping', 'All Products - Yuumpy', 'Browse our complete collection of amazing products. Find exactly what you need with our curated selection.'),
('categories', 'Product Categories - Yuumpy', 'Explore our product categories to find exactly what you need. Organized for easy browsing.', 'categories, products, browse, shopping', 'Product Categories - Yuumpy', 'Explore our product categories to find exactly what you need. Organized for easy browsing.'),
('about', 'About Yuumpy - Your Product Discovery Platform', 'Learn about Yuumpy, your trusted platform for discovering amazing products. We curate the best products for you.', 'about, yuumpy, platform, products', 'About Yuumpy - Your Product Discovery Platform', 'Learn about Yuumpy, your trusted platform for discovering amazing products. We curate the best products for you.'),
('advert', 'Banner Advertising - Yuumpy', 'Promote your products with our premium banner advertising options. Reach thousands of potential customers daily.', 'advertising, banner ads, promotion, marketing', 'Banner Advertising - Yuumpy', 'Promote your products with our premium banner advertising options. Reach thousands of potential customers daily.')
ON CONFLICT (page_type) DO UPDATE SET
  meta_title = EXCLUDED.meta_title,
  meta_description = EXCLUDED.meta_description,
  meta_keywords = EXCLUDED.meta_keywords,
  og_title = EXCLUDED.og_title,
  og_description = EXCLUDED.og_description;
