import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function GET(request: NextRequest) {
  const status = request.nextUrl.searchParams.get('status') || '';

  try {
    let sql = `
      SELECT d.*, 
             s.store_name, s.email as seller_email,
             c.first_name as customer_first_name, c.last_name as customer_last_name, c.email as customer_email,
             o.order_number, o.total_amount as order_total
      FROM disputes d
      LEFT JOIN sellers s ON d.seller_id = s.id
      LEFT JOIN customers c ON d.customer_id = c.id
      LEFT JOIN orders o ON d.order_id = o.id
    `;
    const params: string[] = [];

    if (status && status !== 'all') {
      sql += ' WHERE d.status = ?';
      params.push(status);
    }

    sql += ' ORDER BY d.created_at DESC';

    let disputes: unknown[] = [];
    try {
      disputes = await query(sql, params) as unknown[];
    } catch { disputes = []; }

    // Stats
    let stats = { open: 0, under_review: 0, resolved: 0, total: 0 };
    try {
      const summary = await query(`
        SELECT 
          SUM(CASE WHEN status IN ('open', 'seller_responded') THEN 1 ELSE 0 END) as open_count,
          SUM(CASE WHEN status = 'under_review' THEN 1 ELSE 0 END) as review_count,
          SUM(CASE WHEN status IN ('resolved_buyer', 'resolved_seller', 'resolved_split', 'closed') THEN 1 ELSE 0 END) as resolved_count,
          COUNT(*) as total
        FROM disputes
      `) as Record<string, unknown>[];
      if (summary.length > 0) {
        stats = {
          open: Number(summary[0].open_count) || 0,
          under_review: Number(summary[0].review_count) || 0,
          resolved: Number(summary[0].resolved_count) || 0,
          total: Number(summary[0].total) || 0,
        };
      }
    } catch { /* table may not exist */ }

    return NextResponse.json({ disputes, stats });
  } catch (error) {
    console.error('Disputes API error:', error);
    return NextResponse.json({ error: 'Failed to load disputes' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, dispute_id } = body;

    if (!dispute_id) return NextResponse.json({ error: 'dispute_id required' }, { status: 400 });

    if (action === 'update_status') {
      const { status, resolution_notes, refund_amount } = body;
      const validStatuses = ['open', 'seller_responded', 'under_review', 'resolved_buyer', 'resolved_seller', 'resolved_split', 'closed'];
      if (!validStatuses.includes(status)) {
        return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
      }

      const isResolved = ['resolved_buyer', 'resolved_seller', 'resolved_split', 'closed'].includes(status);

      await query(
        `UPDATE disputes SET status = ?, resolution_notes = ?, refund_amount = ?, 
         ${isResolved ? 'resolved_at = NOW(),' : ''} updated_at = NOW() WHERE id = ?`,
        [status, resolution_notes || null, refund_amount || null, dispute_id]
      );

      // If resolved in buyer's favor, refund the escrow
      if (status === 'resolved_buyer' && refund_amount) {
        try {
          const dispute = await query('SELECT escrow_id FROM disputes WHERE id = ?', [dispute_id]) as { escrow_id: number }[];
          if (dispute.length > 0 && dispute[0].escrow_id) {
            await query(
              "UPDATE escrow_transactions SET status = 'refunded', refunded_at = NOW(), admin_notes = CONCAT(COALESCE(admin_notes, ''), ?) WHERE id = ?",
              [`\n[Dispute resolved - buyer refund £${refund_amount}]`, dispute[0].escrow_id]
            );
          }
        } catch { /* escrow update optional */ }
      }

      return NextResponse.json({ success: true });
    }

    if (action === 'add_message') {
      const { message } = body;
      if (!message) return NextResponse.json({ error: 'Message required' }, { status: 400 });

      await query(
        'INSERT INTO dispute_messages (dispute_id, sender_type, sender_id, message) VALUES (?, ?, ?, ?)',
        [dispute_id, 'admin', 0, message]
      );
      return NextResponse.json({ success: true });
    }

    if (action === 'get_messages') {
      let messages: unknown[] = [];
      try {
        messages = await query(
          'SELECT * FROM dispute_messages WHERE dispute_id = ? ORDER BY created_at ASC',
          [dispute_id]
        ) as unknown[];
      } catch { messages = []; }
      return NextResponse.json({ messages });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('Dispute update error:', error);
    return NextResponse.json({ error: 'Failed to update dispute' }, { status: 500 });
  }
}
