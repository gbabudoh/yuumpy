import { NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function POST() {
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS product_variations (
        id SERIAL PRIMARY KEY,
        product_id INT NOT NULL,
        colour_name VARCHAR(100) NOT NULL,
        colour_hex VARCHAR(7) DEFAULT NULL,
        main_image_url TEXT DEFAULT NULL,
        gallery_images JSONB DEFAULT NULL,
        sort_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
      )
    `);

    await query(`CREATE INDEX IF NOT EXISTS idx_product_variations_product_id ON product_variations(product_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_product_variations_sort_order ON product_variations(sort_order)`);

    return NextResponse.json({ success: true, message: 'product_variations table created successfully' });
  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json(
      { error: 'Migration failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
