import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid category ID' },
        { status: 400 }
      );
    }

    const sql = `
      SELECT c.*, 
             COUNT(p.id) as product_count,
             parent.name as parent_name
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id AND p.is_active = 1
      LEFT JOIN categories parent ON c.parent_id = parent.id
      WHERE c.id = ?
      GROUP BY c.id
    `;

    const categories = await query(sql, [id]);
    
    if (!Array.isArray(categories) || categories.length === 0) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(categories[0]);
  } catch (error) {
    console.error('Error fetching category:', error);
    return NextResponse.json(
      { error: 'Failed to fetch category' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid category ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { name, slug, description, image_url, icon_url, parent_id, sort_order, is_active } = body;

    if (!name || !slug) {
      return NextResponse.json(
        { error: 'Name and slug are required' },
        { status: 400 }
      );
    }

    // Check if slug is already in use by another category
    const slugCheck = await query(
      'SELECT id FROM categories WHERE slug = ? AND id != ?',
      [slug, id]
    );

    if ((slugCheck as any[]).length > 0) {
      return NextResponse.json(
        { error: `Slug '${slug}' is already in use by another category` },
        { status: 400 }
      );
    }

    const sql = `
      UPDATE categories 
      SET name = ?, slug = ?, description = ?, image_url = ?, icon_url = ?,
          parent_id = ?, sort_order = ?, is_active = ?, updated_at = NOW()
      WHERE id = ?
    `;

    const result = await query(sql, [
      name,
      slug,
      description || null,
      image_url || null,
      icon_url || null,
      parent_id || null,
      sort_order || 0,
      is_active !== undefined ? is_active : true,
      id
    ]);

    if ((result as any).affectedRows === 0) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Category updated successfully'
    });
  } catch (error: any) {
    console.error('Error updating category:', error);
    
    // Handle specific database errors
    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json(
        { error: 'A category with this slug already exists' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update category', details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid category ID' },
        { status: 400 }
      );
    }

    // Check if category has products
    const productCheck = await query(
      'SELECT COUNT(*) as count FROM products WHERE category_id = ? AND is_active = 1',
      [id]
    );

    if ((productCheck as any)[0].count > 0) {
      return NextResponse.json(
        { error: 'Cannot delete category with active products. Please move or delete products first.' },
        { status: 400 }
      );
    }

    // Check if category has subcategories
    const subcategoryCheck = await query(
      'SELECT COUNT(*) as count FROM categories WHERE parent_id = ? AND is_active = 1',
      [id]
    );

    if ((subcategoryCheck as any)[0].count > 0) {
      return NextResponse.json(
        { error: 'Cannot delete category with subcategories. Please delete subcategories first.' },
        { status: 400 }
      );
    }

    // Soft delete the category
    const result = await query(
      'UPDATE categories SET is_active = 0, updated_at = NOW() WHERE id = ?',
      [id]
    );

    if ((result as any).affectedRows === 0) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json(
      { error: 'Failed to delete category' },
      { status: 500 }
    );
  }
}