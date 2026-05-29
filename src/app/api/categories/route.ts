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
             COALESCE(COUNT(DISTINCT p.id)::int, 0) as product_count,
             (SELECT name FROM categories WHERE id = c.parent_id) as parent_name
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id AND p.is_active = TRUE
      WHERE c.is_active = TRUE
    `;
    
    const params = [];

    const megaMenu = searchParams.get('mega_menu');

    if (parentId) {
      sql += ' AND c.parent_id = ?';
      params.push(parentId);
    } else if (megaMenu === 'true') {
      // Mega menu: only root categories with show_in_menu = TRUE, ordered by menu_order
      sql += ' AND c.parent_id IS NULL AND c.show_in_menu = TRUE';
    } else if (parentOnly === 'true') {
      sql += ' AND c.parent_id IS NULL';
    } else if (slug) {
      sql += ' AND c.slug = ?';
      params.push(slug);
    } else {
      sql += ' AND c.parent_id IS NULL';
    }

    if (megaMenu === 'true') {
      sql += ' GROUP BY c.id ORDER BY c.menu_order ASC, c.name ASC';
    } else {
      sql += ' GROUP BY c.id ORDER BY c.sort_order ASC, c.name ASC';
    }

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
