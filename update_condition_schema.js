import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function updateSchema() {
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

    // Alter product_condition column to VARCHAR(100) to allow more descriptive conditions
    await connection.execute('ALTER TABLE products MODIFY COLUMN product_condition VARCHAR(100) DEFAULT "Handcrafted"');
    console.log('Successfully modified products.product_condition to VARCHAR(100)');

  } catch (error) {
    console.error('Error updating schema:', error.message);
  } finally {
    if (connection) await connection.end();
  }
}

updateSchema();
