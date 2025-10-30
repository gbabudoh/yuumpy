import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const isActive = searchParams.get('active');
    const category = searchParams.get('category');

    // First check if brands table exists
    const tableCheck = await query(`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = DATABASE() 
      AND table_name = 'brands'
    `);

    if ((tableCheck as any[])[0].count === 0) {
      return NextResponse.json([]);
    }

    let sql = `
      SELECT b.id, b.name, b.slug, b.description, b.is_active, b.created_at, b.updated_at,
             COALESCE(COUNT(p.id), 0) as product_count
      FROM brands b
      LEFT JOIN products p ON b.id = p.brand_id AND p.is_active = 1
    `;
    
    const conditions = [];
    const params = [];

    if (search) {
      conditions.push('(b.name LIKE ? OR b.description LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }

    if (category) {
      // Filter brands by category - only show brands that have products in this category
      conditions.push('p.category_id = (SELECT id FROM categories WHERE slug = ?)');
      params.push(category);
    }

    if (isActive !== null) {
      conditions.push('b.is_active = ?');
      params.push(isActive === 'true' ? 1 : 0);
    } else {
      // Default to active brands only
      conditions.push('b.is_active = 1');
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    sql += ' GROUP BY b.id ORDER BY b.name ASC';

    console.log('Executing brands query:', sql, params);
    const brands = await query(sql, params);
    console.log('Brands result:', brands);
    
    return NextResponse.json(brands);
  } catch (error) {
    console.error('Error fetching brands:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch brands', 
      details: error.message 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, slug, description, is_active = true } = body;

    console.log('Creating brand with data:', body);

    if (!name || !slug) {
      return NextResponse.json({ error: 'Name and slug are required' }, { status: 400 });
    }

    // Check if slug already exists
    const existingBrand = await query('SELECT id FROM brands WHERE slug = ?', [slug]);
    if ((existingBrand as any[]).length > 0) {
      return NextResponse.json({ error: 'A brand with this slug already exists' }, { status: 400 });
    }

    const sql = `
      INSERT INTO brands (name, slug, description, is_active)
      VALUES (?, ?, ?, ?)
    `;

    const result = await query(sql, [
      name,
      slug,
      description || null,
      is_active ? 1 : 0
    ]);

    return NextResponse.json({ 
      success: true,
      id: (result as any).insertId, 
      message: 'Brand created successfully' 
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating brand:', error);
    return NextResponse.json({ 
      error: 'Failed to create brand', 
      details: error.message 
    }, { status: 500 });
  }
}
