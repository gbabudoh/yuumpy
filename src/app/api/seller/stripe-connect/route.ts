import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { query } from '@/lib/database';
import { getAuthenticatedSeller } from '@/lib/seller-session';
import { Seller } from '@/lib/seller-auth';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

// GET: Check Stripe Connect status or create onboarding link
export async function GET(request: NextRequest) {
  try {
    const seller = await getAuthenticatedSeller(request);
    if (!seller) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // If seller already has a connected account, check its status
    if (seller.stripe_connect_id) {
      const account = await stripe.accounts.retrieve(seller.stripe_connect_id);
      const isComplete = account.charges_enabled && account.payouts_enabled;

      // Update DB if onboarding just completed
      if (isComplete && !seller.stripe_onboarding_complete) {
        await query(
          'UPDATE sellers SET stripe_onboarding_complete = TRUE WHERE id = ?',
          [seller.id]
        );
      }

      return NextResponse.json({
        connected: true,
        stripe_connect_id: seller.stripe_connect_id,
        charges_enabled: account.charges_enabled,
        payouts_enabled: account.payouts_enabled,
        onboarding_complete: isComplete,
      });
    }

    return NextResponse.json({ connected: false, onboarding_complete: false });
  } catch (error) {
    console.error('Stripe Connect status error:', error);
    return NextResponse.json({ error: 'Failed to check Stripe status' }, { status: 500 });
  }
}

// POST: Create connected account + onboarding link, or refresh link
export async function POST(request: NextRequest) {
  try {
    const seller = await getAuthenticatedSeller(request);
    if (!seller) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    let accountId = seller.stripe_connect_id;

    // Create a new connected account if none exists
    if (!accountId) {
      const account = await stripe.accounts.create({
        type: 'express',
        email: seller.email,
        metadata: { seller_id: seller.id.toString(), store_name: seller.store_name },
        business_profile: {
          name: seller.business_name || seller.store_name,
          url: `${baseUrl}/store/${seller.store_slug}`,
        },
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
      });

      accountId = account.id;
      await query(
        'UPDATE sellers SET stripe_connect_id = ? WHERE id = ?',
        [accountId, seller.id]
      );
    }

    // Generate onboarding link
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${baseUrl}/seller/settings?stripe=refresh`,
      return_url: `${baseUrl}/seller/settings?stripe=complete`,
      type: 'account_onboarding',
    });

    return NextResponse.json({
      url: accountLink.url,
      stripe_connect_id: accountId,
    });
  } catch (error) {
    console.error('Stripe Connect onboarding error:', error);
    return NextResponse.json(
      { error: 'Failed to create Stripe onboarding link' },
      { status: 500 }
    );
  }
}
