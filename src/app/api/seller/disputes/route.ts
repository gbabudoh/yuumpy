import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';
import { getAuthenticatedSeller } from '@/lib/seller-session';

export async function GET(request: NextRequest) {
  try {
    const seller = await getAuthenticatedSeller(request);
    if (!seller) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const status = request.nextUrl.searchParams.get('status') || '';

    let sql = `
      SELECT d.*, c.first_name as customer_first_name, c.last_name as customer_last_name,
             o.order_number, o.total_amount as order_total
      FROM disputes d
      LEFT JOIN customers c ON d.customer_id = c.id
      LEFT JOIN orders o ON d.order_id = o.id
      WHERE d.seller_id = ?
    `;
    const params: (string | number)[] = [seller.id];

    if (status && status !== 'all') {
      sql += ' AND d.status = ?';
      params.push(status);
    }

    sql += ' ORDER BY d.created_at DESC';

    const disputes = await query(sql, params) as unknown[];

    return NextResponse.json({ disputes });
  } catch (error) {
    console.error('Seller disputes fetch error:', error);
    return NextResponse.json({ error: 'Failed to load disputes' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const seller = await getAuthenticatedSeller(request);
    if (!seller) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const body = await request.json();
    const { action, dispute_id } = body;

    if (!dispute_id) return NextResponse.json({ error: 'dispute_id required' }, { status: 400 });

    const owned = await query(
      'SELECT id, status FROM disputes WHERE id = ? AND seller_id = ?',
      [dispute_id, seller.id]
    ) as Array<{ id: number; status: string }>;
    if (owned.length === 0) {
      return NextResponse.json({ error: 'Dispute not found' }, { status: 404 });
    }

    if (action === 'get_messages') {
      const messages = await query(
        'SELECT * FROM dispute_messages WHERE dispute_id = ? ORDER BY created_at ASC',
        [dispute_id]
      ) as unknown[];
      return NextResponse.json({ messages });
    }

    if (action === 'add_message') {
      const { message } = body;
      if (!message?.trim()) return NextResponse.json({ error: 'Message required' }, { status: 400 });

      await query(
        'INSERT INTO dispute_messages (dispute_id, sender_type, sender_id, message) VALUES (?, ?, ?, ?)',
        [dispute_id, 'seller', seller.id, message.trim()]
      );

      // First seller reply moves it out of the plain "open" bucket so admin
      // can see it's been acknowledged.
      if (owned[0].status === 'open') {
        await query("UPDATE disputes SET status = 'seller_responded', updated_at = NOW() WHERE id = ?", [dispute_id]);
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('Seller dispute update error:', error);
    return NextResponse.json({ error: 'Failed to update dispute' }, { status: 500 });
  }
}
