import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const parentOnly = searchParams.get('parent_only');
    const slug = searchParams.get('slug');
    const parentId = searchParams.get('parent_id');

    let sql = `
      SELECT c.*, 
             COALESCE(COUNT(DISTINCT p1.id), 0) + COALESCE(COUNT(DISTINCT p2.id), 0) as product_count,
             parent.name as parent_name
      FROM categories c
      LEFT JOIN products p1 ON c.id = p1.category_id AND p1.is_active = 1
      LEFT JOIN products p2 ON c.id = p2.secondary_category_id AND p2.is_active = 1
      LEFT JOIN categories parent ON c.parent_id = parent.id
      WHERE c.is_active = 1
    `;
    
    const params = [];

    // Handle different query types
    if (parentId) {
      // Fetch subcategories by parent_id
      sql += ' AND c.parent_id = ?';
      params.push(parentId);
    } else if (parentOnly === 'true') {
      // Fetch only main categories (parent_id IS NULL)
      sql += ' AND c.parent_id IS NULL';
    } else if (slug) {
      // When searching by slug, don't filter by parent_id - allow any category
      // This allows finding subcategories by slug
      sql += ' AND c.slug = ?';
      params.push(slug);
    } else {
      // Default: fetch main categories
      sql += ' AND c.parent_id IS NULL';
    }

    sql += ' GROUP BY c.id ORDER BY c.sort_order ASC, c.name ASC';

    console.log('Categories API Query:', sql, params);
    const categories = await query(sql, params);
    console.log('Categories API Result:', categories);
    
    if (slug) {
      const result = categories[0] || null;
      console.log('Single category result:', result);
      return NextResponse.json(result);
    }
    
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Creating category with data:', body);
    const { name, slug, description, image_url, icon_url, parent_id, sort_order = 0 } = body;

    if (!name || !slug) {
      return NextResponse.json(
        { error: 'Name and slug are required' },
        { status: 400 }
      );
    }

    const sql = `
      INSERT INTO categories (name, slug, description, image_url, icon_url, parent_id, sort_order)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const result = await query(sql, [
      name, 
      slug, 
      description || null, 
      image_url || null,
      icon_url || null,
      parent_id || null,
      sort_order
    ]);

    return NextResponse.json({
      success: true,
      category: { id: (result as any).insertId, ...body }
    });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create category', 
        details: error.message,
        stack: error.stack
      },
      { status: 500 }
    );
  }
}
