import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    console.log('Starting Admin Users database migration...');

    // Create admin users table
    const createAdminUsersTable = `
      CREATE TABLE IF NOT EXISTS admin_users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        username VARCHAR(50) NOT NULL UNIQUE,
        email VARCHAR(100) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        role ENUM('super_admin', 'content_admin', 'product_admin') NOT NULL DEFAULT 'content_admin',
        permissions JSON,
        is_active BOOLEAN DEFAULT TRUE,
        last_login TIMESTAMP NULL,
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES admin_users(id) ON DELETE SET NULL
      )
    `;

    // Create admin sessions table
    const createAdminSessionsTable = `
      CREATE TABLE IF NOT EXISTS admin_sessions (
        id INT PRIMARY KEY AUTO_INCREMENT,
        admin_user_id INT NOT NULL,
        session_token VARCHAR(255) NOT NULL UNIQUE,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (admin_user_id) REFERENCES admin_users(id) ON DELETE CASCADE
      )
    `;

    // Execute table creation
    await query(createAdminUsersTable);
    console.log('✅ Created admin_users table');

    await query(createAdminSessionsTable);
    console.log('✅ Created admin_sessions table');

    // Insert default super admin user (password: admin123)
    const insertSuperAdmin = `
      INSERT INTO admin_users (username, email, password_hash, role, permissions, created_by) VALUES
      ('admin', 'admin@yuumpy.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'super_admin', 
       JSON_OBJECT(
         'can_manage_users', true,
         'can_manage_products', true,
         'can_manage_categories', true,
         'can_manage_subcategories', true,
         'can_manage_brands', true,
         'can_manage_banner_ads', true,
         'can_manage_product_banner_ads', true,
         'can_manage_analytics', true,
         'can_manage_seo', true,
         'can_manage_settings', true,
         'can_manage_emails', true,
         'can_manage_pages', true
       ), NULL)
      ON DUPLICATE KEY UPDATE
      username = VALUES(username),
      email = VALUES(email)
    `;

    // Insert sample content admin user (password: content123)
    const insertContentAdmin = `
      INSERT INTO admin_users (username, email, password_hash, role, permissions, created_by) VALUES
      ('content_admin', 'content@yuumpy.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'content_admin',
       JSON_OBJECT(
         'can_manage_users', false,
         'can_manage_products', true,
         'can_manage_categories', true,
         'can_manage_subcategories', true,
         'can_manage_brands', true,
         'can_manage_banner_ads', false,
         'can_manage_product_banner_ads', false,
         'can_manage_analytics', false,
         'can_manage_seo', false,
         'can_manage_settings', false,
         'can_manage_emails', false,
         'can_manage_pages', false
       ), 1)
      ON DUPLICATE KEY UPDATE
      username = VALUES(username),
      email = VALUES(email)
    `;

    // Insert sample product admin user (password: product123)
    const insertProductAdmin = `
      INSERT INTO admin_users (username, email, password_hash, role, permissions, created_by) VALUES
      ('product_admin', 'product@yuumpy.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'product_admin',
       JSON_OBJECT(
         'can_manage_users', false,
         'can_manage_products', true,
         'can_manage_categories', false,
         'can_manage_subcategories', false,
         'can_manage_brands', false,
         'can_manage_banner_ads', false,
         'can_manage_product_banner_ads', false,
         'can_manage_analytics', false,
         'can_manage_seo', false,
         'can_manage_settings', false,
         'can_manage_emails', false,
         'can_manage_pages', false
       ), 1)
      ON DUPLICATE KEY UPDATE
      username = VALUES(username),
      email = VALUES(email)
    `;

    await query(insertSuperAdmin);
    console.log('✅ Inserted super admin user');

    await query(insertContentAdmin);
    console.log('✅ Inserted content admin user');

    await query(insertProductAdmin);
    console.log('✅ Inserted product admin user');

    return NextResponse.json({
      success: true,
      message: 'Admin Users database migration completed successfully',
      tablesCreated: [
        'admin_users',
        'admin_sessions'
      ],
      defaultUsersCreated: [
        {
          username: 'admin',
          password: 'admin123',
          role: 'super_admin'
        },
        {
          username: 'content_admin',
          password: 'content123',
          role: 'content_admin'
        },
        {
          username: 'product_admin',
          password: 'product123',
          role: 'product_admin'
        }
      ]
    });

  } catch (error) {
    console.error('Admin Users migration error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to migrate Admin Users database',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
