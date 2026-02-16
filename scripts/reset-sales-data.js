import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env.local') });

async function resetSales() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'yuumpy',
    port: parseInt(process.env.DB_PORT || '3306')
  });

  try {
    console.log('Starting sales data reset...');
    
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    
    const tables = [
      'order_items', 
      'orders', 
      'payments', 
      'analytics', 
      'products', 
      'categories', 
      'brands',
      'banner_ads',
      'emails'
    ];
    
    for (const table of tables) {
      try {
        console.log(`Clearing ${table}...`);
        await connection.query(`TRUNCATE TABLE ${table}`);
      } catch (err) {
        console.warn(`Could not clear table ${table}: ${err.message}`);
      }
    }
    
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');
    
    console.log('Sales data reset complete!');
  } catch (error) {
    console.error('Error resetting sales data:', error);
  } finally {
    await connection.end();
  }
}

resetSales();
