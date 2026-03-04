import { NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { productId, approved } = body;

    if (!productId) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
    }

    await query(
      'UPDATE products SET seller_approved = ? WHERE id = ?',
      [approved ? 1 : 0, productId]
    );

    return NextResponse.json({ success: true, message: approved ? 'Product approved' : 'Product unapproved' });
  } catch (error) {
    console.error('Approve product error:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}
