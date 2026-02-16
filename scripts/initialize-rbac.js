import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env.local') });

async function initializeRBAC() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME || 'yuumpy',
      port: parseInt(process.env.DB_PORT || '3306')
    });

    console.log('Successfully connected to the database.');

    // We need to add 'basic_admin'
    console.log('Updating admin_users role column...');
    // First, ensure the table exists (it should, but just in case)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS admin_users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) NOT NULL UNIQUE,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        role ENUM('super_admin', 'content_admin', 'product_admin', 'basic_admin') NOT NULL DEFAULT 'content_admin',
        permissions JSON NOT NULL,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        last_login TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await connection.query(`
      ALTER TABLE admin_users 
      MODIFY COLUMN role ENUM('super_admin', 'content_admin', 'product_admin', 'basic_admin') NOT NULL DEFAULT 'content_admin'
    `);

    // 2. Hash the password for the super admin
    const password = 'GetMeInToAdmin';
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 3. Upsert the super admin user
    console.log('Setting up super admin user (adminaces1)...');
    const permissions = JSON.stringify({
      can_manage_users: true,
      can_manage_products: true,
      can_manage_categories: true,
      can_manage_subcategories: true,
      can_manage_brands: true,
      can_manage_banner_ads: true,
      can_manage_product_banner_ads: true,
      can_manage_analytics: true,
      can_manage_seo: true,
      can_manage_settings: true,
      can_manage_emails: true,
      can_manage_pages: true,
      can_manage_orders: true,
      can_manage_customers: true
    });

    const [existing] = await connection.query('SELECT id FROM admin_users WHERE username = ?', ['adminaces1']);
    
    if (existing.length > 0) {
      await connection.query(
        'UPDATE admin_users SET email = ?, password_hash = ?, role = ?, permissions = ?, is_active = 1 WHERE username = ?',
        ['admin@yuumpy.com', passwordHash, 'super_admin', permissions, 'adminaces1']
      );
      console.log('Super admin user updated.');
    } else {
      await connection.query(
        'INSERT INTO admin_users (username, email, password_hash, role, permissions, is_active) VALUES (?, ?, ?, ?, ?, 1)',
        ['adminaces1', 'admin@yuumpy.com', passwordHash, 'super_admin', permissions]
      );
      console.log('Super admin user created.');
    }

    console.log('RBAC initialization complete.');
  } catch (err) {
    console.error('Error during RBAC initialization:', err);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}

initializeRBAC();
