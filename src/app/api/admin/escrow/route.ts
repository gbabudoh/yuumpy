import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { query } from '@/lib/database';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export async function GET(request: NextRequest) {
  const status = request.nextUrl.searchParams.get('status') || '';

  try {
    let sql = `
      SELECT e.*, s.store_name, s.store_slug, s.email as seller_email,
             s.stripe_connect_id, s.stripe_onboarding_complete,
             o.order_number, o.order_status
      FROM escrow_transactions e
      LEFT JOIN sellers s ON e.seller_id = s.id
      LEFT JOIN orders o ON e.order_id = o.id
    `;
    const params: string[] = [];

    if (status && status !== 'all') {
      sql += ' WHERE e.status = ?';
      params.push(status);
    }

    sql += ' ORDER BY e.created_at DESC';

    let transactions: unknown[] = [];
    try {
      transactions = await query(sql, params) as unknown[];
    } catch { transactions = []; }

    let stats = { held: 0, released: 0, refunded: 0, disputed: 0, total_held_amount: 0, total_released_amount: 0 };
    try {
      const summary = await query(`
        SELECT 
          SUM(CASE WHEN status = 'held' THEN 1 ELSE 0 END) as held,
          SUM(CASE WHEN status = 'released' THEN 1 ELSE 0 END) as released,
          SUM(CASE WHEN status = 'refunded' OR status = 'partially_refunded' THEN 1 ELSE 0 END) as refunded,
          SUM(CASE WHEN status = 'disputed' THEN 1 ELSE 0 END) as disputed,
          COALESCE(SUM(CASE WHEN status = 'held' THEN seller_payout_amount ELSE 0 END), 0) as total_held_amount,
          COALESCE(SUM(CASE WHEN status = 'released' THEN seller_payout_amount ELSE 0 END), 0) as total_released_amount
        FROM escrow_transactions
      `) as Record<string, unknown>[];
      if (summary.length > 0) {
        stats = {
          held: Number(summary[0].held) || 0,
          released: Number(summary[0].released) || 0,
          refunded: Number(summary[0].refunded) || 0,
          disputed: Number(summary[0].disputed) || 0,
          total_held_amount: Number(summary[0].total_held_amount) || 0,
          total_released_amount: Number(summary[0].total_released_amount) || 0,
        };
      }
    } catch { /* table may not exist */ }

    return NextResponse.json({ transactions, stats });
  } catch (error) {
    console.error('Escrow API error:', error);
    return NextResponse.json({ error: 'Failed to load escrow data' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, escrow_id, notes } = body;

    if (!escrow_id) return NextResponse.json({ error: 'escrow_id required' }, { status: 400 });

    if (action === 'release') {
      // Fetch escrow + seller info for Stripe transfer
      const escrowResult = await query(
        `SELECT e.*, s.stripe_connect_id, s.stripe_onboarding_complete
         FROM escrow_transactions e
         JOIN sellers s ON e.seller_id = s.id
         WHERE e.id = ?`,
        [escrow_id]
      ) as Array<{
        id: number;
        order_id: number;
        seller_id: number;
        seller_payout_amount: string | number;
        stripe_transfer_id: string | null;
        stripe_connect_id: string | null;
        stripe_onboarding_complete: boolean;
      }>;

      if (escrowResult.length === 0) {
        return NextResponse.json({ error: 'Escrow not found' }, { status: 404 });
      }

      const escrow = escrowResult[0];
      const payoutAmount = typeof escrow.seller_payout_amount === 'string'
        ? parseFloat(escrow.seller_payout_amount)
        : escrow.seller_payout_amount;

      // Create Stripe transfer if seller has connected account and no transfer exists yet
      let transferId = escrow.stripe_transfer_id;
      if (!transferId && escrow.stripe_connect_id && escrow.stripe_onboarding_complete) {
        const amountInPence = Math.round(payoutAmount * 100);
        if (amountInPence > 0) {
          try {
            const transfer = await stripe.transfers.create({
              amount: amountInPence,
              currency: 'gbp',
              destination: escrow.stripe_connect_id,
              metadata: {
                order_id: escrow.order_id.toString(),
                seller_id: escrow.seller_id.toString(),
                escrow_id: escrow.id.toString(),
                released_by: 'admin',
              },
              description: `Admin release for escrow #${escrow.id}`,
            });
            transferId = transfer.id;
          } catch (err) {
            console.error('Stripe transfer failed:', err);
            return NextResponse.json(
              { error: 'Stripe transfer failed', details: err instanceof Error ? err.message : 'Unknown' },
              { status: 500 }
            );
          }
        }
      }

      await query(
        `UPDATE escrow_transactions 
         SET status = 'released', released_at = NOW(), stripe_transfer_id = COALESCE(?, stripe_transfer_id),
             admin_notes = CONCAT(COALESCE(admin_notes, ''), ?)
         WHERE id = ?`,
        [transferId, `\n[Released] ${notes || 'Manual release by admin'}`, escrow_id]
      );

      await query("UPDATE orders SET escrow_status = 'released' WHERE id = ?", [escrow.order_id]);

      // Update seller stats
      await query('UPDATE sellers SET total_sales = total_sales + ? WHERE id = ?', [payoutAmount, escrow.seller_id]);

      return NextResponse.json({ success: true, transfer_id: transferId });
    }

    if (action === 'refund') {
      // If there's an existing transfer, reverse it
      const escrowResult = await query(
        'SELECT stripe_transfer_id, order_id FROM escrow_transactions WHERE id = ?',
        [escrow_id]
      ) as Array<{ stripe_transfer_id: string | null; order_id: number }>;

      if (escrowResult.length > 0 && escrowResult[0].stripe_transfer_id) {
        try {
          await stripe.transfers.createReversal(escrowResult[0].stripe_transfer_id);
        } catch (err) {
          console.error('Transfer reversal failed:', err);
        }
      }

      await query(
        `UPDATE escrow_transactions 
         SET status = 'refunded', refunded_at = NOW(), admin_notes = CONCAT(COALESCE(admin_notes, ''), ?)
         WHERE id = ?`,
        [`\n[Refunded] ${notes || 'Refunded by admin'}`, escrow_id]
      );

      if (escrowResult.length > 0) {
        await query("UPDATE orders SET escrow_status = 'refunded' WHERE id = ?", [escrowResult[0].order_id]);
      }

      return NextResponse.json({ success: true });
    }

    if (action === 'hold') {
      const { hold_days } = body;
      const holdDays = Number(hold_days) || 7;
      await query(
        `UPDATE escrow_transactions 
         SET status = 'held', hold_until = DATE_ADD(NOW(), INTERVAL ? DAY),
             admin_notes = CONCAT(COALESCE(admin_notes, ''), ?)
         WHERE id = ?`,
        [holdDays, `\n[Hold extended] ${notes || `Extended hold by ${holdDays} days`}`, escrow_id]
      );
      return NextResponse.json({ success: true });
    }

    if (action === 'add_note') {
      await query(
        "UPDATE escrow_transactions SET admin_notes = CONCAT(COALESCE(admin_notes, ''), ?) WHERE id = ?",
        [`\n[Note] ${notes}`, escrow_id]
      );
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('Escrow update error:', error);
    return NextResponse.json({ error: 'Failed to update escrow' }, { status: 500 });
  }
}
