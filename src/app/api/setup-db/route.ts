import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

export async function POST(request: NextRequest) {
  // Connect without specifying database first to create it if needed
  const adminPool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    database: 'postgres', // connect to default db
    port: parseInt(process.env.DB_PORT || '5432'),
  });

  try {
    const dbName = process.env.DB_NAME || 'yuumpy';

    // Create database if it doesn't exist
    const existing = await adminPool.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [dbName]
    );
    if (existing.rows.length === 0) {
      await adminPool.query(`CREATE DATABASE "${dbName}"`);
    }
    await adminPool.end();

    // Now connect to the target database and create tables
    const pool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || '',
      database: dbName,
      port: parseInt(process.env.DB_PORT || '5432'),
    });

    const statements = [
      `CREATE TABLE IF NOT EXISTS categories (
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
      )`,
      `CREATE TABLE IF NOT EXISTS brands (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        description TEXT,
        logo_url VARCHAR(500),
        website_url VARCHAR(500),
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        description TEXT,
        short_description VARCHAR(500),
        price DECIMAL(10, 2) NOT NULL,
        original_price DECIMAL(10, 2),
        affiliate_url VARCHAR(1000) NOT NULL,
        affiliate_partner_name VARCHAR(255),
        external_purchase_info TEXT,
        image_url TEXT,
        gallery JSONB,
        category_id INT,
        subcategory_id INT,
        brand_id INT,
        is_featured BOOLEAN DEFAULT FALSE,
        is_bestseller BOOLEAN DEFAULT FALSE,
        is_active BOOLEAN DEFAULT TRUE,
        rating DECIMAL(3, 2) DEFAULT 0,
        reviews INT DEFAULT 0,
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
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
        FOREIGN KEY (subcategory_id) REFERENCES categories(id) ON DELETE SET NULL,
        FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE SET NULL
      )`,
    ];

    for (const stmt of statements) {
      await pool.query(stmt);
    }

    // Insert seed data if tables are empty
    const catCount = await pool.query('SELECT COUNT(*) as count FROM categories');
    if (parseInt(catCount.rows[0].count) === 0) {
      await pool.query(`
        INSERT INTO categories (name, slug, description, sort_order) VALUES
        ('Fashion', 'fashion', 'Clothing, shoes, bags, accessories, jewelry', 1),
        ('Electronics', 'electronics', 'Smartphones, laptops, wearables, audio, cameras, gaming', 2),
        ('Household', 'household', 'Kitchen, furniture, bedding, cleaning, home improvement', 3),
        ('Cosmetics', 'cosmetics', 'Skincare, makeup, hair care, fragrances, grooming', 4),
        ('Digital', 'digital', 'Web hosting, software, courses, streaming, AI tools, apps', 5)
        ON CONFLICT (slug) DO NOTHING
      `);

      await pool.query(`
        INSERT INTO brands (name, slug, description, website_url) VALUES
        ('Apple', 'apple', 'Technology company known for iPhones, MacBooks, and iPads', 'https://apple.com'),
        ('Samsung', 'samsung', 'Electronics and technology company', 'https://samsung.com'),
        ('Nike', 'nike', 'Athletic footwear and apparel company', 'https://nike.com'),
        ('Adidas', 'adidas', 'Sports footwear and clothing brand', 'https://adidas.com'),
        ('Sony', 'sony', 'Electronics and entertainment company', 'https://sony.com')
        ON CONFLICT (slug) DO NOTHING
      `);

      await pool.query(`
        INSERT INTO products (name, slug, description, short_description, price, original_price, affiliate_url, image_url, category_id, brand_id, is_featured, is_bestseller, rating, reviews)
        VALUES
        ('iPhone 15 Pro', 'iphone-15-pro', 'Latest iPhone with advanced camera system and A17 Pro chip.', 'Premium smartphone with cutting-edge technology', 999.99, 1199.99, 'https://apple.com/iphone-15-pro', 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600', 2, 1, TRUE, TRUE, 4.8, 1250),
        ('Samsung Galaxy S24', 'samsung-galaxy-s24', 'Powerful Android smartphone with AI features.', 'AI-powered smartphone with exceptional camera', 899.99, 1099.99, 'https://samsung.com/galaxy-s24', 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600', 2, 2, TRUE, FALSE, 4.7, 980),
        ('Nike Air Max 270', 'nike-air-max-270', 'Comfortable running shoes with Max Air cushioning.', 'Comfortable running shoes with Max Air', 129.99, 159.99, 'https://nike.com/air-max-270', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600', 1, 3, FALSE, TRUE, 4.5, 3200),
        ('MacBook Pro M3', 'macbook-pro-m3', 'Professional laptop with M3 chip and all-day battery life.', 'Professional laptop for creators and developers', 1999.99, 2299.99, 'https://apple.com/macbook-pro', 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600', 2, 1, TRUE, TRUE, 4.9, 2100),
        ('Sony WH-1000XM5', 'sony-wh-1000xm5', 'Industry-leading noise canceling wireless headphones.', 'Premium noise-canceling headphones', 399.99, 499.99, 'https://sony.com/wh-1000xm5', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600', 2, 5, FALSE, TRUE, 4.6, 850)
        ON CONFLICT (slug) DO NOTHING
      `);
    }

    await pool.end();

    return NextResponse.json({
      message: 'Database setup completed successfully',
      status: 'success',
    });
  } catch (error: any) {
    console.error('Database setup error:', error);
    return NextResponse.json(
      { error: 'Failed to setup database', details: error.message },
      { status: 500 }
    );
  }
}
