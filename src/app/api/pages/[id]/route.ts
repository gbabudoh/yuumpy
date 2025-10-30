import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const sql = `
      SELECT id, title, slug, content, meta_title, meta_description, 
             is_active, created_at, updated_at
      FROM pages
      WHERE id = ?
    `;

    const pages = await query(sql, [id]);
    
    if ((pages as any[]).length === 0) {
      return NextResponse.json(
        { error: 'Page not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(pages[0]);
  } catch (error) {
    console.error('Error fetching page:', error);
    return NextResponse.json(
      { error: 'Failed to fetch page' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, slug, content, meta_title, meta_description, is_active } = body;

    if (!title || !slug || !content) {
      return NextResponse.json(
        { error: 'Title, slug, and content are required' },
        { status: 400 }
      );
    }

    // Check if slug already exists for other pages
    const existingPage = await query(
      'SELECT id FROM pages WHERE slug = ? AND id != ?',
      [slug, id]
    );

    if ((existingPage as any[]).length > 0) {
      return NextResponse.json(
        { error: 'A page with this slug already exists' },
        { status: 400 }
      );
    }

    const sql = `
      UPDATE pages 
      SET title = ?, slug = ?, content = ?, meta_title = ?, 
          meta_description = ?, is_active = ?, updated_at = NOW()
      WHERE id = ?
    `;

    const result = await query(sql, [
      title,
      slug,
      content,
      meta_title || null,
      meta_description || null,
      is_active !== undefined ? is_active : true,
      id
    ]);

    if ((result as any).affectedRows === 0) {
      return NextResponse.json(
        { error: 'Page not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Page updated successfully'
    });
  } catch (error) {
    console.error('Error updating page:', error);
    return NextResponse.json(
      { error: 'Failed to update page' },
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

    // Soft delete the page
    const result = await query(
      'UPDATE pages SET is_active = 0, updated_at = NOW() WHERE id = ?',
      [id]
    );

    if ((result as any).affectedRows === 0) {
      return NextResponse.json(
        { error: 'Page not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Page deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting page:', error);
    return NextResponse.json(
      { error: 'Failed to delete page' },
      { status: 500 }
    );
  }
}