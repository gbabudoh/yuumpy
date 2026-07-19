import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';
import { getAuthenticatedCustomer } from '@/lib/customer-auth';

const VALID_REASONS = [
  'item_not_received',
  'item_not_as_described',
  'defective_item',
  'wrong_item',
  'seller_unresponsive',
  'other',
];

const OPEN_STATUSES = ['open', 'seller_responded', 'under_review'];

export async function GET(request: NextRequest) {
  try {
    const customer = await getAuthenticatedCustomer(request);
    if (!customer) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const orderNumber = request.nextUrl.searchParams.get('orderNumber');
    if (!orderNumber) return NextResponse.json({ error: 'orderNumber required' }, { status: 400 });

    const disputes = await query(
      `SELECT d.* FROM disputes d
       JOIN orders o ON d.order_id = o.id
       WHERE o.order_number = ? AND d.customer_id = ?
       ORDER BY d.created_at DESC
       LIMIT 1`,
      [orderNumber, customer.id]
    ) as unknown[];

    return NextResponse.json({ dispute: disputes[0] || null });
  } catch (error) {
    console.error('Customer dispute fetch error:', error);
    return NextResponse.json({ error: 'Failed to load dispute' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const customer = await getAuthenticatedCustomer(request);
    if (!customer) return NextResponse.json({ error: 'Please login to report a problem' }, { status: 401 });

    const body = await request.json();
    const { orderNumber, reason, description } = body;

    if (!orderNumber || !reason || !description?.trim()) {
      return NextResponse.json({ error: 'Order, reason and description are required' }, { status: 400 });
    }
    if (!VALID_REASONS.includes(reason)) {
      return NextResponse.json({ error: 'Invalid reason' }, { status: 400 });
    }

    const orders = await query(
      `SELECT id, seller_id, payment_status, order_status
       FROM orders WHERE order_number = ? AND customer_id = ?`,
      [orderNumber, customer.id]
    ) as Array<{ id: number; seller_id: number | null; payment_status: string; order_status: string }>;

    if (orders.length === 0) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    const order = orders[0];

    if (!order.seller_id) {
      return NextResponse.json({ error: 'This order has no seller to dispute' }, { status: 400 });
    }
    if (order.payment_status !== 'paid') {
      return NextResponse.json({ error: 'Only paid orders can be disputed' }, { status: 400 });
    }

    const existing = await query(
      `SELECT id FROM disputes WHERE order_id = ? AND customer_id = ? AND status = ANY($3::text[])`,
      [order.id, customer.id, OPEN_STATUSES]
    ) as unknown[];
    if (existing.length > 0) {
      return NextResponse.json({ error: 'You already have an open dispute for this order' }, { status: 400 });
    }

    const escrowRows = await query(
      `SELECT id, status FROM escrow_transactions WHERE order_id = ? AND seller_id = ?`,
      [order.id, order.seller_id]
    ) as Array<{ id: number; status: string }>;
    const escrow = escrowRows[0];

    const inserted = await query(
      `INSERT INTO disputes (order_id, customer_id, seller_id, escrow_id, reason, description, status)
       VALUES (?, ?, ?, ?, ?, ?, 'open')
       RETURNING id`,
      [order.id, customer.id, order.seller_id, escrow?.id ?? null, reason, description.trim()]
    ) as Array<{ id: number }>;

    // Block the escrow auto-release cron while this dispute is open — it only
    // ever touches rows with status = 'held', so flipping this to 'disputed'
    // is what actually stops the payout from firing during review.
    if (escrow && escrow.status === 'held') {
      await query("UPDATE escrow_transactions SET status = 'disputed' WHERE id = ?", [escrow.id]);
      await query("UPDATE orders SET escrow_status = 'disputed' WHERE id = ?", [order.id]);
    }

    return NextResponse.json({ success: true, disputeId: inserted[0]?.id });
  } catch (error) {
    console.error('Dispute creation error:', error);
    return NextResponse.json({ error: 'Failed to submit dispute' }, { status: 500 });
  }
}
