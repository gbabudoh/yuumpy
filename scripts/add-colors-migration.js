/* eslint-disable @typescript-eslint/no-require-imports */
require('dotenv').config({ path: '.env.local' });
const mysql = require('mysql2/promise');

async function migrate() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'yuumpy',
    port: parseInt(process.env.DB_PORT || '3306')
  });

  try {
    console.log('Connected to database.');

    // Check if column exists
    const [columns] = await connection.execute(
      "SHOW COLUMNS FROM products LIKE 'colors'"
    );

    if (columns.length > 0) {
      console.log('Column "colors" already exists.');
    } else {
      console.log('Adding "colors" column...');
      await connection.execute(
        "ALTER TABLE products ADD COLUMN colors JSON DEFAULT NULL"
      );
      console.log('Successfully added "colors" column.');
    }

  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await connection.end();
  }
}

migrate();
