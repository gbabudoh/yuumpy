import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env.local') });

async function verifyReset() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'yuumpy',
    port: parseInt(process.env.DB_PORT || '3306')
  });

  try {
    console.log('Verifying sales data reset...');
    
    const tables = ['order_items', 'orders', 'payments', 'analytics'];
    
    for (const table of tables) {
      const [rows] = await connection.query(`SELECT COUNT(*) as count FROM ${table}`);
      console.log(`Table ${table} count: ${rows[0].count}`);
    }
    
    console.log('Verification complete!');
  } catch (error) {
    console.error('Error verifying sales data:', error);
  } finally {
    await connection.end();
  }
}

verifyReset();
