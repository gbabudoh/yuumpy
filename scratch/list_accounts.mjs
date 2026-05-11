import mysql from 'mysql2/promise';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

// Reconstruct __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Use absolute path to ensure .env.local is found regardless of where the script is run from
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

async function getLoginAccounts() {
  // Check if env variables were loaded
  if (!process.env.DB_HOST) {
    console.error('Error: Could not load environment variables from .env.local');
    return;
  }

  const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT || '3306'),
  };

  const connection = await mysql.createConnection(dbConfig);

  try {
    console.log('--- Admin Users ---');
    try {
      const [admins] = await connection.execute('SELECT id, username, role, created_at FROM admin_users');
      console.table(admins);
    } catch (e) {
      console.log('admin_users table not found or error:', e.message);
    }

    console.log('\n--- Sellers ---');
    try {
      const [sellers] = await connection.execute('SELECT id, business_name, email, created_at FROM sellers');
      console.table(sellers);
    } catch (e) {
      console.log('sellers table not found or error:', e.message);
    }

    console.log('\n--- Customers ---');
    try {
      const [customers] = await connection.execute('SELECT id, email, created_at FROM customers');
      console.table(customers);
    } catch (e) {
      console.log('customers table not found or error:', e.message);
    }

  } catch (error) {
    console.error('Error fetching accounts:', error);
  } finally {
    await connection.end();
  }
}

getLoginAccounts();
