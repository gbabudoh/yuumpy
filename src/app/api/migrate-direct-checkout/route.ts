import { NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function POST() {
  try {
    const migrations: string[] = [];

    // Add purchase_type column to products (PostgreSQL duplicate column code: 42701)
    try {
      await query(`ALTER TABLE products ADD COLUMN purchase_type VARCHAR(20) DEFAULT 'affiliate' CHECK (purchase_type IN ('affiliate', 'direct'))`);
      migrations.push('Added purchase_type column to products');
    } catch (e: any) {
      if (e.code === '42701') {
        migrations.push('purchase_type column already exists');
      } else {
        throw e;
      }
    }

    try {
      await query(`ALTER TABLE products ADD COLUMN stock_quantity INT DEFAULT NULL`);
      migrations.push('Added stock_quantity column to products');
    } catch (e: any) {
      if (e.code === '42701') {
        migrations.push('stock_quantity column already exists');
      } else {
        throw e;
      }
    }

    await query(`
      CREATE TABLE IF NOT EXISTS customers (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        phone VARCHAR(20),
        is_active BOOLEAN DEFAULT TRUE,
        email_verified BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    migrations.push('Created customers table');

    await query(`
      CREATE TABLE IF NOT EXISTS customer_addresses (
        id SERIAL PRIMARY KEY,
        customer_id INT NOT NULL,
        address_type VARCHAR(10) DEFAULT 'shipping' CHECK (address_type IN ('billing', 'shipping')),
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        address_line1 VARCHAR(255) NOT NULL,
        address_line2 VARCHAR(255),
        city VARCHAR(100) NOT NULL,
        county VARCHAR(100),
        postcode VARCHAR(20) NOT NULL,
        country VARCHAR(100) DEFAULT 'United Kingdom',
        phone VARCHAR(20),
        is_default BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
      )
    `);
    migrations.push('Created customer_addresses table');

    await query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        order_number VARCHAR(50) UNIQUE NOT NULL,
        customer_id INT,
        customer_email VARCHAR(255) NOT NULL,
        customer_first_name VARCHAR(100) NOT NULL,
        customer_last_name VARCHAR(100) NOT NULL,
        customer_phone VARCHAR(20),
        shipping_address_line1 VARCHAR(255) NOT NULL,
        shipping_address_line2 VARCHAR(255),
        shipping_city VARCHAR(100) NOT NULL,
        shipping_county VARCHAR(100),
        shipping_postcode VARCHAR(20) NOT NULL,
        shipping_country VARCHAR(100) DEFAULT 'United Kingdom',
        subtotal DECIMAL(10, 2) NOT NULL,
        shipping_cost DECIMAL(10, 2) DEFAULT 0.00,
        tax_amount DECIMAL(10, 2) DEFAULT 0.00,
        total_amount DECIMAL(10, 2) NOT NULL,
        currency VARCHAR(3) DEFAULT 'GBP',
        stripe_payment_intent_id VARCHAR(255),
        payment_status VARCHAR(10) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
        order_status VARCHAR(15) DEFAULT 'pending' CHECK (order_status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
        tracking_number VARCHAR(100),
        tracking_url VARCHAR(500),
        customer_notes TEXT,
        admin_notes TEXT,
        estimated_delivery DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL
      )
    `);
    migrations.push('Created orders table');

    await query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id INT NOT NULL,
        product_id INT,
        product_name VARCHAR(255) NOT NULL,
        product_slug VARCHAR(255) NOT NULL,
        product_image_url TEXT,
        quantity INT NOT NULL DEFAULT 1,
        unit_price DECIMAL(10, 2) NOT NULL,
        total_price DECIMAL(10, 2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
      )
    `);
    migrations.push('Created order_items table');

    await query(`
      CREATE TABLE IF NOT EXISTS customer_sessions (
        id SERIAL PRIMARY KEY,
        customer_id INT NOT NULL,
        token VARCHAR(500) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
      )
    `);
    migrations.push('Created customer_sessions table');

    // estimated_delivery is included in the orders CREATE above; add it if table pre-existed
    try {
      await query(`ALTER TABLE orders ADD COLUMN estimated_delivery DATE DEFAULT NULL`);
      migrations.push('Added estimated_delivery column to orders');
    } catch (e: any) {
      if (e.code === '42701') {
        migrations.push('estimated_delivery column already exists');
      } else {
        throw e;
      }
    }

    const indexes = [
      { name: 'idx_orders_customer_id', table: 'orders', column: 'customer_id' },
      { name: 'idx_orders_order_number', table: 'orders', column: 'order_number' },
      { name: 'idx_orders_payment_status', table: 'orders', column: 'payment_status' },
      { name: 'idx_orders_order_status', table: 'orders', column: 'order_status' },
      { name: 'idx_order_items_order_id', table: 'order_items', column: 'order_id' },
      { name: 'idx_customers_email', table: 'customers', column: 'email' },
      { name: 'idx_customer_sessions_token', table: 'customer_sessions', column: 'token' },
      { name: 'idx_products_purchase_type', table: 'products', column: 'purchase_type' },
    ];

    for (const idx of indexes) {
      try {
        await query(`CREATE INDEX IF NOT EXISTS ${idx.name} ON ${idx.table}(${idx.column})`);
        migrations.push(`Created index ${idx.name}`);
      } catch {
        migrations.push(`Index ${idx.name} may already exist`);
      }
    }

    return NextResponse.json({ success: true, message: 'Direct checkout migration completed', migrations });
  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json(
      { error: 'Migration failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
