import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');

    let sql = `
      SELECT id, title, slug, content, meta_title, meta_description, 
             is_active, created_at, updated_at
      FROM pages
      WHERE 1=1
    `;
    
    const params = [];

    if (slug) {
      sql += ' AND slug = ? AND is_active = 1';
      params.push(slug);
    }

    sql += ' ORDER BY title ASC';

    const pages = await query(sql, params);
    
    if (slug) {
      return NextResponse.json(pages[0] || null);
    }
    
    return NextResponse.json(pages);
  } catch (error) {
    console.error('Error fetching pages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pages' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, slug, content, meta_title, meta_description, is_active = true } = body;

    if (!title || !slug || !content) {
      return NextResponse.json(
        { error: 'Title, slug, and content are required' },
        { status: 400 }
      );
    }

    // Check if slug already exists
    const existingPage = await query(
      'SELECT id FROM pages WHERE slug = ?',
      [slug]
    );

    if ((existingPage as any[]).length > 0) {
      return NextResponse.json(
        { error: 'A page with this slug already exists' },
        { status: 400 }
      );
    }

    const sql = `
      INSERT INTO pages (title, slug, content, meta_title, meta_description, is_active)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    const result = await query(sql, [
      title,
      slug,
      content,
      meta_title || null,
      meta_description || null,
      is_active
    ]);

    return NextResponse.json({
      success: true,
      page: { id: (result as any).insertId, ...body }
    });
  } catch (error) {
    console.error('Error creating page:', error);
    return NextResponse.json(
      { error: 'Failed to create page' },
      { status: 500 }
    );
  }
}