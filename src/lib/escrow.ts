import Stripe from 'stripe';
import { query } from '@/lib/database';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

interface RefundResult {
  success: boolean;
  error?: string;
  stripeRefundId?: string;
}

// Reverses the seller's Connect transfer (if any) and refunds the buyer's original
// charge via Stripe, then marks the escrow/order rows accordingly. The transfer
// reversal must succeed before the buyer is refunded — otherwise the platform pays
// the buyer back in full while the seller still keeps their payout.
export async function refundEscrowTransaction(escrowId: number, notes: string): Promise<RefundResult> {
  const rows = await query(
    `SELECT e.id, e.order_id, e.total_amount, e.status, e.stripe_transfer_id,
            o.stripe_payment_intent_id
     FROM escrow_transactions e
     JOIN orders o ON e.order_id = o.id
     WHERE e.id = ?`,
    [escrowId]
  ) as Array<{
    id: number;
    order_id: number;
    total_amount: string | number;
    status: string;
    stripe_transfer_id: string | null;
    stripe_payment_intent_id: string | null;
  }>;

  if (rows.length === 0) {
    return { success: false, error: 'Escrow transaction not found' };
  }
  const escrow = rows[0];

  if (escrow.status === 'refunded') {
    return { success: false, error: 'Escrow transaction is already refunded' };
  }
  if (!escrow.stripe_payment_intent_id) {
    return { success: false, error: 'Order has no Stripe payment intent — cannot refund' };
  }

  if (escrow.stripe_transfer_id) {
    try {
      await stripe.transfers.createReversal(escrow.stripe_transfer_id);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      return { success: false, error: `Transfer reversal failed, refund aborted: ${message}` };
    }
  }

  const totalAmount = typeof escrow.total_amount === 'string'
    ? parseFloat(escrow.total_amount)
    : escrow.total_amount;
  const amountInPence = Math.round(totalAmount * 100);

  let refund: Stripe.Refund;
  try {
    refund = await stripe.refunds.create({
      payment_intent: escrow.stripe_payment_intent_id,
      amount: amountInPence,
      metadata: {
        escrow_id: escrow.id.toString(),
        order_id: escrow.order_id.toString(),
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return { success: false, error: `Stripe refund failed: ${message}` };
  }

  await query(
    `UPDATE escrow_transactions
     SET status = 'refunded', refunded_at = NOW(), stripe_refund_id = ?,
         admin_notes = CONCAT(COALESCE(admin_notes, ''), ?)
     WHERE id = ?`,
    [refund.id, `\n[Refunded] ${notes}`, escrowId]
  );

  await query(
    "UPDATE orders SET escrow_status = 'refunded', payment_status = 'refunded' WHERE id = ?",
    [escrow.order_id]
  );

  return { success: true, stripeRefundId: refund.id };
}
