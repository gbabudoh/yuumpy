import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { query } from '@/lib/database';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16' });

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, currency = 'gbp', banner_ad_id, customer_email } = body;

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to pence
      currency,
      metadata: {
        banner_ad_id: banner_ad_id.toString(),
        customer_email } });

    // Store payment intent in database
    const sql = `
      INSERT INTO payments (stripe_payment_intent_id, amount, currency, customer_email, banner_ad_id, status)
      VALUES (?, ?, ?, ?, ?, 'pending')
    `;

    await query(sql, [
      paymentIntent.id,
      amount,
      currency,
      customer_email,
      banner_ad_id
    ]);

    return NextResponse.json({
      client_secret: paymentIntent.client_secret,
      payment_intent_id: paymentIntent.id });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    );
  }
}
