import { NextResponse } from 'next/server';
import { getAuthenticatedSeller } from '@/lib/seller-session';
import { query } from '@/lib/database';
import { sendOrderShippedEmail } from '@/lib/email';

export async function GET(request: Request) {
  try {
    const seller = await getAuthenticatedSeller(request);
    if (!seller) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const orders = await query(
      `SELECT o.*, 
        (SELECT COUNT(*)::int FROM order_items oi WHERE oi.order_id = o.id AND oi.seller_id = ?) as item_count
       FROM orders o 
       WHERE o.seller_id = ?
       ORDER BY o.created_at DESC`,
      [seller.id, seller.id]
    );

    return NextResponse.json({ orders });
  } catch (error) {
    console.error('Seller orders error:', error);
    return NextResponse.json({ error: 'Failed to load orders' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const seller = await getAuthenticatedSeller(request);
    if (!seller) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const body = await request.json();
    const { orderId, orderStatus, trackingNumber, trackingUrl } = body;

    if (!orderId) return NextResponse.json({ error: 'Order ID required' }, { status: 400 });

    // Verify ownership
    const existing = await query('SELECT id FROM orders WHERE id = ? AND seller_id = ?', [orderId, seller.id]) as { id: number }[];
    if (existing.length === 0) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const updates: string[] = [];
    const params: (string | number)[] = [];

    if (orderStatus) {
      updates.push('order_status = ?');
      params.push(orderStatus);
    }
    if (trackingNumber !== undefined) {
      updates.push('tracking_number = ?');
      params.push(trackingNumber);
    }
    if (trackingUrl !== undefined) {
      updates.push('tracking_url = ?');
      params.push(trackingUrl);
    }

    if (updates.length > 0) {
      params.push(orderId, seller.id);
      await query(
        `UPDATE orders SET ${updates.join(', ')} WHERE id = ? AND seller_id = ?`,
        params
      );
    }

    // Send shipping email to buyer when seller marks as shipped
    if (orderStatus === 'shipped') {
      const orderRows = await query(
        `SELECT customer_email, customer_first_name, customer_last_name, order_number,
                tracking_number, tracking_url
         FROM orders WHERE id = ? AND seller_id = ?`,
        [orderId, seller.id]
      ) as any[];

      if (orderRows.length > 0) {
        const o = orderRows[0];
        const customerName = `${o.customer_first_name} ${o.customer_last_name}`;
        sendOrderShippedEmail(
          o.customer_email,
          customerName,
          o.order_number,
          trackingNumber || o.tracking_number || 'Pending',
          trackingUrl || o.tracking_url || undefined
        ).catch(err => console.error('Failed to send shipped email:', err));
      }
    }

    return NextResponse.json({ success: true, message: 'Order updated' });
  } catch (error) {
    console.error('Update order error:', error);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}
