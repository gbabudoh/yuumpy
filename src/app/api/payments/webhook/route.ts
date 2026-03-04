import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { query } from '@/lib/database';
import { sendOrderConfirmationEmail, sendNewOrderNotificationEmail } from '@/lib/email';
import { awardPointsForOrder } from '@/lib/rewards';
import { createOrderNotification } from '@/lib/notifications';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

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

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentSuccess(paymentIntent);
        break;
      }
      case 'payment_intent.payment_failed': {
        const failedPayment = event.data.object as Stripe.PaymentIntent;
        await handlePaymentFailure(failedPayment);
        break;
      }
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutSessionCompleted(session);
        break;
      }
      case 'account.updated': {
        const account = event.data.object as Stripe.Account;
        await handleAccountUpdated(account);
        break;
      }
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}

// Handle Stripe Connect account updates (onboarding completion)
async function handleAccountUpdated(account: Stripe.Account) {
  try {
    if (account.charges_enabled && account.payouts_enabled) {
      await query(
        'UPDATE sellers SET stripe_onboarding_complete = TRUE WHERE stripe_connect_id = ?',
        [account.id]
      );
      console.log(`Stripe Connect onboarding complete for account: ${account.id}`);
    }
  } catch (error) {
    console.error('Error handling account update:', error);
  }
}

async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  try {
    await query(
      "UPDATE payments SET status = 'succeeded' WHERE stripe_payment_intent_id = ?",
      [paymentIntent.id]
    );

    if (paymentIntent.metadata.banner_ad_id) {
      await query('UPDATE banner_ads SET is_active = 1 WHERE id = ?', [paymentIntent.metadata.banner_ad_id]);
    }

    console.log('Payment succeeded:', paymentIntent.id);
  } catch (error) {
    console.error('Error handling payment success:', error);
  }
}

async function handlePaymentFailure(paymentIntent: Stripe.PaymentIntent) {
  try {
    await query(
      "UPDATE payments SET status = 'failed' WHERE stripe_payment_intent_id = ?",
      [paymentIntent.id]
    );
    console.log('Payment failed:', paymentIntent.id);
  } catch (error) {
    console.error('Error handling payment failure:', error);
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  try {
    // Parse multi-order metadata
    let orderIds: number[] = [];
    let orderNumbers: string[] = [];
    let transferData: Array<{
      order_id: number;
      seller_id: number;
      stripe_connect_id: string;
      payout_amount: number;
    }> = [];

    try {
      orderIds = JSON.parse(session.metadata?.order_ids || '[]');
      orderNumbers = JSON.parse(session.metadata?.order_numbers || '[]');
      transferData = JSON.parse(session.metadata?.transfer_data || '[]');
    } catch {
      // Fallback for legacy single-order format
      const singleId = session.metadata?.order_id;
      const singleNumber = session.metadata?.order_number;
      if (singleId) orderIds = [parseInt(singleId)];
      if (singleNumber) orderNumbers = [singleNumber];
    }

    if (orderIds.length === 0) {
      console.log('No order_ids in session metadata, skipping');
      return;
    }

    // Process each order
    for (const orderId of orderIds) {
      // Update order payment status
      await query(
        `UPDATE orders 
         SET payment_status = 'paid', order_status = 'confirmed', stripe_payment_intent_id = ?
         WHERE id = ?`,
        [session.payment_intent, orderId]
      );

      // Update stock for all items in this order
      const orderItems = await query(
        'SELECT product_id, quantity FROM order_items WHERE order_id = ?',
        [orderId]
      ) as { product_id: number; quantity: number }[];

      for (const item of orderItems) {
        await query(
          `UPDATE products SET stock_quantity = stock_quantity - ? 
           WHERE id = ? AND stock_quantity IS NOT NULL`,
          [item.quantity, item.product_id]
        );
      }

      // Create escrow transaction for seller orders
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
      ) as any[];

      if (!orderResult || orderResult.length === 0) continue;
      const order = orderResult[0];

      // Create escrow record for seller orders
      if (order.seller_id) {
        try {
          await query(
            `INSERT INTO escrow_transactions 
             (order_id, seller_id, total_amount, commission_amount, seller_payout_amount, status, hold_until)
             VALUES (?, ?, ?, ?, ?, 'held', DATE_ADD(NOW(), INTERVAL 7 DAY))`,
            [orderId, order.seller_id, order.total_amount, order.commission_amount, order.seller_payout_amount]
          );
          console.log(`Escrow created for order ${orderId}, seller ${order.seller_id}`);
        } catch (err) {
          console.error(`Failed to create escrow for order ${orderId}:`, err);
        }
      }

      // Send emails
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

      sendOrderConfirmationEmail(emailData).catch(err =>
        console.error('Failed to send order confirmation email:', err)
      );
      sendNewOrderNotificationEmail(emailData).catch(err =>
        console.error('Failed to send admin notification email:', err)
      );

      if (order.customer_id) {
        createOrderNotification(order.customer_id, orderId, order.order_number, 'confirmed').catch(err =>
          console.error('Failed to create order notification:', err)
        );
        awardPointsForOrder(order.customer_id, orderId, order.order_number, order.total_amount).catch(err =>
          console.error('Failed to award points:', err)
        );
      }
    }

    // Execute Stripe Connect transfers for sellers
    for (const transfer of transferData) {
      try {
        const amountInPence = Math.round(transfer.payout_amount * 100);
        if (amountInPence <= 0) continue;

        const stripeTransfer = await stripe.transfers.create({
          amount: amountInPence,
          currency: 'gbp',
          destination: transfer.stripe_connect_id,
          metadata: {
            order_id: transfer.order_id.toString(),
            seller_id: transfer.seller_id.toString(),
          },
          description: `Payout for order #${transfer.order_id}`,
        });

        // Store transfer ID on escrow record
        await query(
          'UPDATE escrow_transactions SET stripe_transfer_id = ? WHERE order_id = ? AND seller_id = ?',
          [stripeTransfer.id, transfer.order_id, transfer.seller_id]
        );

        console.log(`Transfer ${stripeTransfer.id} created for seller ${transfer.seller_id}`);
      } catch (err) {
        console.error(`Failed to create transfer for seller ${transfer.seller_id}:`, err);
      }
    }

    console.log(`Checkout completed for orders: ${orderNumbers.join(', ')}`);
  } catch (error) {
    console.error('Error handling checkout session:', error);
  }
}
