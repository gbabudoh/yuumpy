import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function migrateArtisanFeatures() {
  const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'yuumpy',
    port: parseInt(process.env.DB_PORT || '3306'),
  };

  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('Connected to database');

    // 1. Extend sellers table for Maker Pages
    console.log('Extending sellers table...');
    const sellerColumns = [
      'ADD COLUMN IF NOT EXISTS artisan_story TEXT AFTER description',
      'ADD COLUMN IF NOT EXISTS studio_images JSON AFTER artisan_story',
      'ADD COLUMN IF NOT EXISTS specialties JSON AFTER studio_images',
      'ADD COLUMN IF NOT EXISTS social_links JSON AFTER specialties',
      'ADD COLUMN IF NOT EXISTS profile_video_url VARCHAR(500) AFTER social_links'
    ];
    
    for (const col of sellerColumns) {
      await connection.execute(`ALTER TABLE sellers ${col}`);
    }
    console.log('✅ Sellers table extended');

    // 2. Create custom_requests table
    console.log('Creating custom_requests table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS custom_requests (
        id INT PRIMARY KEY AUTO_INCREMENT,
        customer_id INT NOT NULL,
        seller_id INT NOT NULL,
        product_id INT DEFAULT NULL,
        description TEXT NOT NULL,
        attachment_urls JSON,
        status ENUM('pending', 'accepted', 'quoted', 'completed', 'cancelled') DEFAULT 'pending',
        quoted_price DECIMAL(10, 2) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (seller_id) REFERENCES sellers(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ custom_requests table created');

  } catch (error) {
    console.error('Migration failed:', error.message);
  } finally {
    if (connection) await connection.end();
  }
}

migrateArtisanFeatures();
