import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';
import { createOrderNotification } from '@/lib/notifications';
import { sendOrderShippedEmail, sendOrderDeliveredEmail, sendOrderCancelledEmail } from '@/lib/email';

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
    const { order_status, tracking_number, tracking_url, admin_notes, estimated_delivery } = body;

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

    if (estimated_delivery !== undefined) {
      updates.push('estimated_delivery = ?');
      params.push(estimated_delivery || null);
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

    // Create notification and send emails if order status changed
    if (order_status) {
      const orderResult = await query(
        `SELECT customer_id, customer_email, customer_first_name, customer_last_name, 
                order_number, total_amount, tracking_number, tracking_url
         FROM orders WHERE id = ?`,
        [id]
      ) as any[];

      if (Array.isArray(orderResult) && orderResult.length > 0) {
        const order = orderResult[0] as any;
        const customerName = `${order.customer_first_name} ${order.customer_last_name}`;
        
        // Create in-app notification if customer exists
        if (order.customer_id) {
          createOrderNotification(
            order.customer_id,
            parseInt(id),
            order.order_number,
            order_status
          ).catch(err => 
            console.error('Failed to create order notification:', err)
          );
        }

        // Send appropriate email based on order status
        if (order.customer_email) {
          if (order_status === 'shipped') {
            // Send shipping email with tracking info
            if (order.tracking_number) {
              sendOrderShippedEmail(
                order.customer_email,
                customerName,
                order.order_number,
                order.tracking_number,
                order.tracking_url || undefined
              ).catch(err => 
                console.error('Failed to send order shipped email:', err)
              );
            } else {
              // Still send email even without tracking number
              sendOrderShippedEmail(
                order.customer_email,
                customerName,
                order.order_number,
                'Pending',
                undefined
              ).catch(err => 
                console.error('Failed to send order shipped email:', err)
              );
            }
          } else if (order_status === 'delivered') {
            // Send delivery confirmation email
            sendOrderDeliveredEmail(
              order.customer_email,
              customerName,
              order.order_number
            ).catch(err => 
              console.error('Failed to send order delivered email:', err)
            );
          } else if (order_status === 'cancelled') {
            // Send cancellation email with refund info if applicable
            sendOrderCancelledEmail(
              order.customer_email,
              customerName,
              order.order_number,
              order.payment_status === 'paid' ? order.total_amount : undefined,
              body.cancellation_reason || undefined
            ).catch(err => 
              console.error('Failed to send order cancelled email:', err)
            );
          }
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    );
  }
}
