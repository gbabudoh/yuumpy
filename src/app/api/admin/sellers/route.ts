import { NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function GET() {
  try {
    const sellers = await query(
      'SELECT * FROM sellers ORDER BY created_at DESC'
    );
    return NextResponse.json({ sellers });
  } catch (error) {
    console.error('Admin sellers error:', error);
    return NextResponse.json({ error: 'Failed to load sellers' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, status, is_verified, is_featured, commission_rate } = body;

    if (!id) return NextResponse.json({ error: 'Seller ID required' }, { status: 400 });

    const updates: string[] = [];
    const params: (string | number | boolean)[] = [];

    if (status !== undefined) { updates.push('status = ?'); params.push(status); }
    if (is_verified !== undefined) { updates.push('is_verified = ?'); params.push(is_verified ? 1 : 0); }
    if (is_featured !== undefined) { updates.push('is_featured = ?'); params.push(is_featured ? 1 : 0); }
    if (commission_rate !== undefined) { updates.push('commission_rate = ?'); params.push(commission_rate); }

    if (updates.length > 0) {
      params.push(id);
      await query(`UPDATE sellers SET ${updates.join(', ')} WHERE id = ?`, params);
    }

    return NextResponse.json({ success: true, message: 'Seller updated' });
  } catch (error) {
    console.error('Admin update seller error:', error);
    return NextResponse.json({ error: 'Failed to update seller' }, { status: 500 });
  }
}
