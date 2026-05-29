import { NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function POST() {
  try {
    const migrations: string[] = [];

    try {
      await query(`
        CREATE TABLE IF NOT EXISTS wishlist (
          id SERIAL PRIMARY KEY,
          customer_id INT NOT NULL,
          product_id INT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
          FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
          UNIQUE (customer_id, product_id)
        )
      `);
      migrations.push('Created wishlist table');
    } catch (e: any) {
      if (e.code === '42P07') {
        migrations.push('Wishlist table already exists');
      } else {
        throw e;
      }
    }

    try {
      await query(`CREATE INDEX IF NOT EXISTS idx_wishlist_customer_id ON wishlist(customer_id)`);
      migrations.push('Created index on customer_id');
    } catch {
      migrations.push('Index on customer_id may already exist');
    }

    try {
      await query(`CREATE INDEX IF NOT EXISTS idx_wishlist_product_id ON wishlist(product_id)`);
      migrations.push('Created index on product_id');
    } catch {
      migrations.push('Index on product_id may already exist');
    }

    return NextResponse.json({ success: true, message: 'Wishlist migration completed', migrations });
  } catch (error: any) {
    console.error('Wishlist migration error:', error);
    return NextResponse.json(
      { success: false, error: 'Migration failed', details: error.message },
      { status: 500 }
    );
  }
}
