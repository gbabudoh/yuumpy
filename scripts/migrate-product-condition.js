const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function migrate() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'yuumpy',
    port: parseInt(process.env.DB_PORT || '3306'),
  });

  console.log('Connected to database');
  const dbName = process.env.DB_NAME || 'yuumpy';

  try {
    // Check and add purchase_type column
    const [purchaseTypeCol] = await connection.execute(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'products' AND COLUMN_NAME = 'purchase_type'`,
      [dbName]
    );

    if (purchaseTypeCol.length > 0) {
      console.log('✅ purchase_type column already exists');
    } else {
      console.log('Adding purchase_type column...');
      await connection.execute(
        `ALTER TABLE products ADD COLUMN purchase_type ENUM('affiliate', 'direct') DEFAULT 'affiliate' AFTER external_purchase_info`
      );
      console.log('✅ purchase_type column added successfully');
    }

    // Check and add product_condition column
    const [conditionCol] = await connection.execute(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'products' AND COLUMN_NAME = 'product_condition'`,
      [dbName]
    );

    if (conditionCol.length > 0) {
      console.log('✅ product_condition column already exists');
    } else {
      console.log('Adding product_condition column...');
      await connection.execute(
        `ALTER TABLE products ADD COLUMN product_condition ENUM('new', 'refurbished', 'used') DEFAULT 'new' AFTER purchase_type`
      );
      console.log('✅ product_condition column added successfully');
    }

    // Check and add stock_quantity column
    const [stockCol] = await connection.execute(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'products' AND COLUMN_NAME = 'stock_quantity'`,
      [dbName]
    );

    if (stockCol.length > 0) {
      console.log('✅ stock_quantity column already exists');
    } else {
      console.log('Adding stock_quantity column...');
      await connection.execute(
        `ALTER TABLE products ADD COLUMN stock_quantity INT DEFAULT NULL AFTER product_condition`
      );
      console.log('✅ stock_quantity column added successfully');
    }

    console.log('\n🎉 Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
  } finally {
    await connection.end();
    console.log('Database connection closed');
  }
}

migrate();
