import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, slug, description, category_id, sort_order = 0 } = body;

    if (!name || !slug || !category_id) {
      return NextResponse.json(
        { error: 'Name, slug, and category_id are required' },
        { status: 400 }
      );
    }

    // Update categories table where id matches and it's a subcategory (has parent_id)
    const sql = `
      UPDATE categories 
      SET name = ?, slug = ?, description = ?, parent_id = ?, sort_order = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND parent_id IS NOT NULL
    `;

    await query(sql, [name, slug, description || null, category_id, sort_order, id]);

    return NextResponse.json({
      success: true,
      message: 'Subcategory updated successfully'
    });
  } catch (error) {
    console.error('Error updating subcategory:', error);
    return NextResponse.json(
      { error: 'Failed to update subcategory' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if subcategory has products
    const productsResult = await query(
      'SELECT COUNT(*) as count FROM products WHERE subcategory_id = ?',
      [id]
    );

    const products = Array.isArray(productsResult) ? productsResult[0] : { count: 0 };
    if ((products as any).count > 0) {
      return NextResponse.json(
        { error: 'Cannot delete subcategory that has products assigned to it' },
        { status: 400 }
      );
    }

    // Delete from categories table where it's a subcategory
    const sql = 'DELETE FROM categories WHERE id = ? AND parent_id IS NOT NULL';
    await query(sql, [id]);

    return NextResponse.json({
      success: true,
      message: 'Subcategory deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting subcategory:', error);
    return NextResponse.json(
      { error: 'Failed to delete subcategory' },
      { status: 500 }
    );
  }
}