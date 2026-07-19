import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';
import { refundEscrowTransaction } from '@/lib/escrow';

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

    // query() already returns [] transparently when the table doesn't exist
    // yet (pre-migration) without throwing — anything that reaches here is a
    // genuine error, so let it bubble to the outer catch instead of quietly
    // reporting zero disputes to the admin.
    const disputes = await query(sql, params) as unknown[];

    let stats = { open: 0, under_review: 0, resolved: 0, total: 0 };
    const summary = await query(`
      SELECT
        SUM(CASE WHEN status IN ('open', 'seller_responded') THEN 1 ELSE 0 END)::float as open_count,
        SUM(CASE WHEN status = 'under_review' THEN 1 ELSE 0 END)::float as review_count,
        SUM(CASE WHEN status IN ('resolved_buyer', 'resolved_seller', 'resolved_split', 'closed') THEN 1 ELSE 0 END)::float as resolved_count,
        COUNT(*)::int as total
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

      // Refund before marking resolved — if the Stripe refund fails, the dispute
      // should stay open rather than silently reporting as resolved.
      if (status === 'resolved_buyer' && refund_amount) {
        const dispute = await query('SELECT escrow_id FROM disputes WHERE id = ?', [dispute_id]) as { escrow_id: number }[];
        if (dispute.length > 0 && dispute[0].escrow_id) {
          const result = await refundEscrowTransaction(
            dispute[0].escrow_id,
            `Dispute #${dispute_id} resolved in buyer's favor — refund £${refund_amount}`
          );
          if (!result.success) {
            return NextResponse.json({ error: `Refund failed: ${result.error}` }, { status: 400 });
          }
        }
      }

      // Resolved in the seller's favor (or closed with no refund) — hand the
      // escrow back to 'held' so it's no longer excluded from the auto-release
      // cron, which only ever picks up rows still marked 'held'.
      if ((status === 'resolved_seller' || status === 'closed') && !refund_amount) {
        const dispute = await query('SELECT escrow_id FROM disputes WHERE id = ?', [dispute_id]) as { escrow_id: number }[];
        if (dispute.length > 0 && dispute[0].escrow_id) {
          await query(
            "UPDATE escrow_transactions SET status = 'held', admin_notes = CONCAT(COALESCE(admin_notes, ''), ?) WHERE id = ? AND status = 'disputed'",
            [`\n[Dispute #${dispute_id} resolved in seller's favor — hold resumed]`, dispute[0].escrow_id]
          );
          await query(
            "UPDATE orders SET escrow_status = 'held' WHERE id = (SELECT order_id FROM escrow_transactions WHERE id = ?) AND escrow_status = 'disputed'",
            [dispute[0].escrow_id]
          );
        }
      }

      await query(
        `UPDATE disputes SET status = ?, resolution_notes = ?, refund_amount = ?,
         ${isResolved ? 'resolved_at = NOW(),' : ''} updated_at = NOW() WHERE id = ?`,
        [status, resolution_notes || null, refund_amount || null, dispute_id]
      );

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
      const messages = await query(
        'SELECT * FROM dispute_messages WHERE dispute_id = ? ORDER BY created_at ASC',
        [dispute_id]
      ) as unknown[];
      return NextResponse.json({ messages });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('Dispute update error:', error);
    return NextResponse.json({ error: 'Failed to update dispute' }, { status: 500 });
  }
}
