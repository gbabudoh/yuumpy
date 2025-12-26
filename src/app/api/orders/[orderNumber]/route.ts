import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';
import { 
  sendOrderConfirmationEmail, 
  sendNewOrderNotificationEmail,
  sendOrderShippedEmail,
  sendOrderDeliveredEmail,
  sendOrderCancelledEmail
} from '@/lib/email';
import { awardPointsForOrder } from '@/lib/rewards';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ orderNumber: string }> }
) {
  try {
    const { orderNumber } = await context.params;

    // Get order details
    const orderResult = await query(
      `SELECT o.*, 
              GROUP_CONCAT(
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
              ) as items
       FROM orders o
       LEFT JOIN order_items oi ON o.id = oi.order_id
       WHERE o.order_number = ?
       GROUP BY o.id`,
      [orderNumber]
    );

    if (!Array.isArray(orderResult) || orderResult.length === 0) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    const order = orderResult[0] as any;
    
    // Parse items JSON
    if (order.items) {
      try {
        order.items = JSON.parse(`[${order.items}]`);
      } catch {
        order.items = [];
      }
    } else {
      order.items = [];
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ orderNumber: string }> }
) {
  try {
    const { orderNumber } = await context.params;
    const body = await request.json();
    const { payment_status, order_status } = body;

    // Build update query dynamically
    const updates: string[] = [];
    const params: any[] = [];

    if (payment_status) {
      updates.push('payment_status = ?');
      params.push(payment_status);
    }
    if (order_status) {
      updates.push('order_status = ?');
      params.push(order_status);
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      );
    }

    params.push(orderNumber);

    await query(
      `UPDATE orders SET ${updates.join(', ')} WHERE order_number = ?`,
      params
    );

    // Fetch order details for email/notifications
    const orderResult = await query(
      `SELECT o.*, 
              JSON_ARRAYAGG(
                JSON_OBJECT(
                  'product_name', oi.product_name,
                  'quantity', oi.quantity,
                  'unit_price', oi.unit_price,
                  'total_price', oi.total_price,
                  'product_image_url', oi.product_image_url
                )
              ) as items
       FROM orders o
       LEFT JOIN order_items oi ON o.id = oi.order_id
       WHERE o.order_number = ?
       GROUP BY o.id`,
      [orderNumber]
    );

    if (Array.isArray(orderResult) && orderResult.length > 0) {
      const order = orderResult[0] as any;
      const customerName = `${order.customer_first_name} ${order.customer_last_name}`;
      const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;

      // If payment was just marked as paid, send confirmation emails
      if (payment_status === 'paid') {
        const emailData = {
          orderNumber: order.order_number,
          customerName,
          customerEmail: order.customer_email,
          items: items || [],
          subtotal: order.subtotal,
          shippingCost: order.shipping_cost || 0,
          totalAmount: order.total_amount,
          shippingAddress: {
            line1: order.shipping_address_line1,
            line2: order.shipping_address_line2,
            city: order.shipping_city,
            county: order.shipping_county,
            postcode: order.shipping_postcode,
            country: order.shipping_country || 'United Kingdom',
          },
        };

        // Send emails (don't await to avoid blocking response)
        sendOrderConfirmationEmail(emailData).catch(err => 
          console.error('Failed to send order confirmation email:', err)
        );
        sendNewOrderNotificationEmail(emailData).catch(err => 
          console.error('Failed to send admin notification email:', err)
        );

        // Award points if customer is logged in
        if (order.customer_id) {
          awardPointsForOrder(
            order.customer_id,
            order.id,
            order.order_number,
            order.total_amount
          ).catch(err => 
            console.error('Failed to award points:', err)
          );
        }
      }

      // Send emails for order status changes
      if (order_status && order.customer_email) {
        if (order_status === 'shipped') {
          // Send shipping email with tracking info
          const trackingNumber = order.tracking_number || 'Pending';
          sendOrderShippedEmail(
            order.customer_email,
            customerName,
            order.order_number,
            trackingNumber,
            order.tracking_url || undefined
          ).catch(err => 
            console.error('Failed to send order shipped email:', err)
          );
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
            undefined // cancellation reason not available in this endpoint
          ).catch(err => 
            console.error('Failed to send order cancelled email:', err)
          );
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
