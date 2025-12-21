import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const orderResult = await query(
      `SELECT o.*,
              (SELECT JSON_ARRAYAGG(
                JSON_OBJECT(
                  'id', oi.id,
                  'product_id', oi.product_id,
                  'product_name', oi.product_name,
                  'product_slug', oi.product_slug,
                  'product_image_url', oi.product_image_url,
                  'quantity', oi.quantity,
                  'unit_price', oi.unit_price,
                  'total_price', oi.total_price
                )
              ) FROM order_items oi WHERE oi.order_id = o.id) as items
       FROM orders o
       WHERE o.id = ?`,
      [id]
    );

    if (!Array.isArray(orderResult) || orderResult.length === 0) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(orderResult[0]);
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { order_status, tracking_number, tracking_url, admin_notes } = body;

    // Build update query dynamically
    const updates: string[] = [];
    const params: any[] = [];

    if (order_status) {
      updates.push('order_status = ?');
      params.push(order_status);
    }

    if (tracking_number !== undefined) {
      updates.push('tracking_number = ?');
      params.push(tracking_number || null);
    }

    if (tracking_url !== undefined) {
      updates.push('tracking_url = ?');
      params.push(tracking_url || null);
    }

    if (admin_notes !== undefined) {
      updates.push('admin_notes = ?');
      params.push(admin_notes || null);
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      );
    }

    params.push(id);

    await query(
      `UPDATE orders SET ${updates.join(', ')} WHERE id = ?`,
      params
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    );
  }
}
