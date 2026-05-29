import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

// GET all root categories with their mega menu settings
export async function GET() {
  try {
    const categories = await query(`
      SELECT id, name, slug, description, image_url, is_active,
             show_in_menu, menu_order,
             COALESCE((SELECT COUNT(*)::int FROM products p WHERE p.category_id = c.id AND p.is_active = TRUE), 0) as product_count
      FROM categories c
      WHERE parent_id IS NULL
      ORDER BY menu_order ASC, name ASC
    `);

    return NextResponse.json(categories);
  } catch (error: any) {
    console.error('Mega menu GET error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT — bulk update which categories show in mega menu and their order
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { categories } = body as {
      categories: { id: number; show_in_menu: boolean; menu_order: number }[];
    };

    if (!Array.isArray(categories)) {
      return NextResponse.json({ error: 'categories array required' }, { status: 400 });
    }

    for (const cat of categories) {
      await query(
        'UPDATE categories SET show_in_menu = ?, menu_order = ? WHERE id = ?',
        [cat.show_in_menu, cat.menu_order, cat.id]
      );
    }

    return NextResponse.json({ success: true, updated: categories.length });
  } catch (error: any) {
    console.error('Mega menu PUT error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH — update a single category's mega menu settings
export async function PATCH(request: NextRequest) {
  try {
    const { id, show_in_menu, menu_order } = await request.json();

    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    const updates: string[] = [];
    const params: any[] = [];

    if (show_in_menu !== undefined) {
      updates.push('show_in_menu = ?');
      params.push(show_in_menu);
    }
    if (menu_order !== undefined) {
      updates.push('menu_order = ?');
      params.push(menu_order);
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });
    }

    params.push(id);
    await query(`UPDATE categories SET ${updates.join(', ')} WHERE id = ?`, params);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Mega menu PATCH error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
