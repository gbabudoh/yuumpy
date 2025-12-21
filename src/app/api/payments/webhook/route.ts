import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { query } from '@/lib/database';
import { sendOrderConfirmationEmail, sendNewOrderNotificationEmail } from '@/lib/email';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16' });

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature')!;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentSuccess(paymentIntent);
        break;
      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object as Stripe.PaymentIntent;
        await handlePaymentFailure(failedPayment);
        break;
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutSessionCompleted(session);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  try {
    const sql = `
      UPDATE payments 
      SET status = 'succeeded' 
      WHERE stripe_payment_intent_id = ?
    `;
    await query(sql, [paymentIntent.id]);

    // Activate banner ad if payment was for banner ad
    if (paymentIntent.metadata.banner_ad_id) {
      const activateAdSql = `
        UPDATE banner_ads 
        SET is_active = 1 
        WHERE id = ?
      `;
      await query(activateAdSql, [paymentIntent.metadata.banner_ad_id]);
    }

    console.log('Payment succeeded:', paymentIntent.id);
  } catch (error) {
    console.error('Error handling payment success:', error);
  }
}

async function handlePaymentFailure(paymentIntent: Stripe.PaymentIntent) {
  try {
    const sql = `
      UPDATE payments 
      SET status = 'failed' 
      WHERE stripe_payment_intent_id = ?
    `;
    await query(sql, [paymentIntent.id]);

    console.log('Payment failed:', paymentIntent.id);
  } catch (error) {
    console.error('Error handling payment failure:', error);
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  try {
    const orderId = session.metadata?.order_id;
    const orderNumber = session.metadata?.order_number;
    const productId = session.metadata?.product_id;

    if (!orderId) {
      console.log('No order_id in session metadata, skipping order update');
      return;
    }

    // Update order payment status
    await query(
      `UPDATE orders 
       SET payment_status = 'paid', 
           order_status = 'confirmed',
           stripe_payment_intent_id = ?
       WHERE id = ?`,
      [session.payment_intent, orderId]
    );

    // Update stock quantity if applicable
    if (productId) {
      await query(
        `UPDATE products 
         SET stock_quantity = stock_quantity - (
           SELECT quantity FROM order_items WHERE order_id = ? AND product_id = ?
         )
         WHERE id = ? AND stock_quantity IS NOT NULL`,
        [orderId, productId, productId]
      );
    }

    // Fetch order details for email
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
       WHERE o.id = ?
       GROUP BY o.id`,
      [orderId]
    );

    if (Array.isArray(orderResult) && orderResult.length > 0) {
      const order = orderResult[0] as any;
      const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;

      const emailData = {
        orderNumber: order.order_number,
        customerName: `${order.customer_first_name} ${order.customer_last_name}`,
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

      // Send emails (don't await to avoid blocking)
      sendOrderConfirmationEmail(emailData).catch(err => 
        console.error('Failed to send order confirmation email:', err)
      );
      sendNewOrderNotificationEmail(emailData).catch(err => 
        console.error('Failed to send admin notification email:', err)
      );
    }

    console.log('Checkout session completed for order:', orderNumber);
  } catch (error) {
    console.error('Error handling checkout session:', error);
  }
}
