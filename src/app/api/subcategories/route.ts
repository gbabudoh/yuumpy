import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('category_id');
    const categorySlug = searchParams.get('category_slug');

    let sql = `
      SELECT c.id, c.name, c.slug, c.description, 
             c.parent_id as category_id,
             c.sort_order, c.is_active, c.created_at, c.updated_at,
             p.name as parent_category_name, p.slug as parent_category_slug,
             COUNT(pr.id) as product_count
      FROM categories c
      LEFT JOIN categories p ON c.parent_id = p.id
      LEFT JOIN products pr ON c.id = pr.subcategory_id AND pr.is_active = 1
      WHERE c.is_active = 1 AND c.parent_id IS NOT NULL
    `;
    
    const params: any[] = [];

    if (categoryId) {
      sql += ' AND c.parent_id = ?';
      params.push(categoryId);
    } else if (categorySlug) {
      sql += ' AND p.slug = ?';
      params.push(categorySlug);
    }

    sql += ' GROUP BY c.id ORDER BY c.sort_order ASC, c.name ASC';

    console.log('Subcategories API Query:', sql, params);
    const subcategoriesResult = await query(sql, params);
    console.log('Subcategories API Result:', subcategoriesResult);
    
    // Ensure we always return an array
    const subcategories = Array.isArray(subcategoriesResult) ? subcategoriesResult : [];
    
    return NextResponse.json(subcategories);
  } catch (error) {
    console.error('Error fetching subcategories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subcategories' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, slug, description, category_id, sort_order = 0 } = body;

    if (!name || !slug || !category_id) {
      return NextResponse.json(
        { error: 'Name, slug, and category_id are required' },
        { status: 400 }
      );
    }

    // Insert into categories table with parent_id set to category_id
    const sql = `
      INSERT INTO categories (name, slug, description, parent_id, sort_order)
      VALUES (?, ?, ?, ?, ?)
    `;

    const result = await query(sql, [name, slug, description || null, category_id, sort_order]);

    return NextResponse.json({
      success: true,
      subcategory: { id: (result as any).insertId, ...body }
    });
  } catch (error) {
    console.error('Error creating subcategory:', error);
    return NextResponse.json(
      { error: 'Failed to create subcategory' },
      { status: 500 }
    );
  }
}