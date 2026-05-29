import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function GET() {
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS product_banner_ads (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        image_url VARCHAR(500),
        link_url VARCHAR(500),
        is_active BOOLEAN DEFAULT TRUE,
        start_date DATE,
        end_date DATE,
        expires_at TIMESTAMP,
        duration VARCHAR(20),
        is_repeating BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const rows = await query(`SELECT * FROM product_banner_ads ORDER BY created_at DESC`);
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error fetching product banner ads:', error);
    return NextResponse.json({ error: 'Failed to fetch product banner ads' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, image_url, link_url, is_active, start_date, end_date, expires_at, duration, is_repeating } = body;

    const result = await query(
      `INSERT INTO product_banner_ads (title, description, image_url, link_url, is_active, start_date, end_date, expires_at, duration, is_repeating)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, description, image_url, link_url, is_active, start_date, end_date, expires_at, duration, is_repeating]
    );

    return NextResponse.json({
      id: result.insertId,
      title, description, image_url, link_url, is_active,
      start_date, end_date, expires_at, duration, is_repeating,
      created_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error creating product banner ad:', error);
    return NextResponse.json({ error: 'Failed to create product banner ad' }, { status: 500 });
  }
}
