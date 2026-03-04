import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { query } from '@/lib/database';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

// Cron endpoint: auto-release escrow funds after hold period expires
// Call this via a cron job (e.g., daily) or Vercel cron
// Protected by CRON_SECRET header
export async function GET(request: NextRequest) {
  try {
    const cronSecret = request.headers.get('x-cron-secret') || request.nextUrl.searchParams.get('secret');
    if (cronSecret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find escrow transactions ready for release:
    // status = 'held' AND hold_until <= NOW() AND the order is delivered or confirmed
    const readyForRelease = await query(
      `SELECT e.*, s.stripe_connect_id, s.stripe_onboarding_complete, s.store_name,
              o.order_status, o.order_number
       FROM escrow_transactions e
       JOIN sellers s ON e.seller_id = s.id
       JOIN orders o ON e.order_id = o.id
       WHERE e.status = 'held' 
         AND e.hold_until IS NOT NULL 
         AND e.hold_until <= NOW()
         AND o.order_status IN ('confirmed', 'shipped', 'delivered')
         AND o.payment_status = 'paid'`
    ) as Array<{
      id: number;
      order_id: number;
      seller_id: number;
      seller_payout_amount: string | number;
      stripe_transfer_id: string | null;
      stripe_connect_id: string | null;
      stripe_onboarding_complete: boolean;
      store_name: string;
      order_status: string;
      order_number: string;
    }>;

    if (!Array.isArray(readyForRelease) || readyForRelease.length === 0) {
      return NextResponse.json({ message: 'No escrow transactions ready for release', released: 0 });
    }

    let released = 0;
    let failed = 0;
    const results: Array<{ escrow_id: number; order_number: string; status: string; error?: string }> = [];

    for (const escrow of readyForRelease) {
      try {
        const payoutAmount = typeof escrow.seller_payout_amount === 'string'
          ? parseFloat(escrow.seller_payout_amount)
          : escrow.seller_payout_amount;

        // If no transfer was created yet (seller connected after checkout), create one now
        if (!escrow.stripe_transfer_id && escrow.stripe_connect_id && escrow.stripe_onboarding_complete) {
          const amountInPence = Math.round(payoutAmount * 100);
          if (amountInPence > 0) {
            const transfer = await stripe.transfers.create({
              amount: amountInPence,
              currency: 'gbp',
              destination: escrow.stripe_connect_id,
              metadata: {
                order_id: escrow.order_id.toString(),
                seller_id: escrow.seller_id.toString(),
                escrow_id: escrow.id.toString(),
              },
              description: `Escrow release for order #${escrow.order_number}`,
            });

            await query(
              'UPDATE escrow_transactions SET stripe_transfer_id = ? WHERE id = ?',
              [transfer.id, escrow.id]
            );
          }
        }

        // Mark escrow as released
        await query(
          `UPDATE escrow_transactions 
           SET status = 'released', released_at = NOW(), 
               admin_notes = CONCAT(COALESCE(admin_notes, ''), ?)
           WHERE id = ?`,
          [`\n[Auto-released] Hold period expired, funds released automatically`, escrow.id]
        );

        // Update order escrow status
        await query(
          "UPDATE orders SET escrow_status = 'released' WHERE id = ?",
          [escrow.order_id]
        );

        // Update seller total_sales
        await query(
          'UPDATE sellers SET total_sales = total_sales + ? WHERE id = ?',
          [payoutAmount, escrow.seller_id]
        );

        released++;
        results.push({ escrow_id: escrow.id, order_number: escrow.order_number, status: 'released' });
      } catch (err) {
        failed++;
        const errorMsg = err instanceof Error ? err.message : 'Unknown error';
        console.error(`Failed to release escrow ${escrow.id}:`, err);
        results.push({ escrow_id: escrow.id, order_number: escrow.order_number, status: 'failed', error: errorMsg });
      }
    }

    return NextResponse.json({
      message: `Processed ${readyForRelease.length} escrow transactions`,
      released,
      failed,
      results,
    });
  } catch (error) {
    console.error('Escrow release cron error:', error);
    return NextResponse.json({ error: 'Escrow release failed' }, { status: 500 });
  }
}
