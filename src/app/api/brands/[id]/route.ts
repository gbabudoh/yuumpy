import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const sql = `
      SELECT b.*, 
             COUNT(p.id) as product_count
      FROM brands b
      LEFT JOIN products p ON b.id = p.brand_id AND p.is_active = 1
      WHERE b.id = ?
      GROUP BY b.id
    `;

    const brands = await query(sql, [id]);
    
    if (!Array.isArray(brands) || brands.length === 0) {
      return NextResponse.json({ error: 'Brand not found' }, { status: 404 });
    }

    return NextResponse.json(brands[0]);
  } catch (error) {
    console.error('Error fetching brand:', error);
    return NextResponse.json({ error: 'Failed to fetch brand' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, slug, description, logo_url, website_url, is_active } = body;

    if (!name || !slug) {
      return NextResponse.json({ error: 'Name and slug are required' }, { status: 400 });
    }

    const sql = `
      UPDATE brands 
      SET name = ?, slug = ?, description = ?, logo_url = ?, website_url = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    const result = await query(sql, [
      name,
      slug,
      description || null,
      logo_url || null,
      website_url || null,
      is_active ? 1 : 0,
      id
    ]);

    const affectedRows = Array.isArray(result) ? (result as any)[0]?.affectedRows : (result as any)?.affectedRows;
    if (affectedRows === 0) {
      return NextResponse.json({ error: 'Brand not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Brand updated successfully' });
  } catch (error) {
    console.error('Error updating brand:', error);
    return NextResponse.json({ error: 'Failed to update brand' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const sql = 'DELETE FROM brands WHERE id = ?';
    const result = await query(sql, [id]);

    const affectedRows = Array.isArray(result) ? (result as any)[0]?.affectedRows : (result as any)?.affectedRows;
    if (affectedRows === 0) {
      return NextResponse.json({ error: 'Brand not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Brand deleted successfully' });
  } catch (error) {
    console.error('Error deleting brand:', error);
    return NextResponse.json({ error: 'Failed to delete brand' }, { status: 500 });
  }
}
