import { NextResponse } from 'next/server';
import { getAuthenticatedSeller } from '@/lib/seller-session';
import { query } from '@/lib/database';

export async function GET(request: Request) {
  try {
    const seller = await getAuthenticatedSeller(request);
    if (!seller) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const settings = await query(
      'SELECT * FROM seller_settings WHERE seller_id = ?',
      [seller.id]
    ) as Record<string, string | number | boolean | null>[];

    return NextResponse.json({
      settings: settings.length > 0 ? settings[0] : null,
      seller: {
        store_name: seller.store_name,
        store_slug: seller.store_slug,
        business_name: seller.business_name,
        description: seller.description,
        logo_url: seller.logo_url,
        banner_url: seller.banner_url,
        phone: seller.phone,
        website: seller.website,
        address_line1: seller.address_line1,
        city: seller.city,
        state_province: seller.state_province,
        postal_code: seller.postal_code,
        country: seller.country,
      }
    });
  } catch (error) {
    console.error('Seller settings error:', error);
    return NextResponse.json({ error: 'Failed to load settings' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const seller = await getAuthenticatedSeller(request);
    if (!seller) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const body = await request.json();
    const { type } = body; // 'profile' or 'settings'

    if (type === 'profile') {
      const { storeName, description, phone, website, city, stateProvince, postalCode, country } = body;
      await query(
        `UPDATE sellers SET store_name = ?, description = ?, phone = ?, website = ?,
          city = ?, state_province = ?, postal_code = ?, country = ? WHERE id = ?`,
        [storeName, description, phone, website, city, stateProvince, postalCode, country || 'United States', seller.id]
      );
    } else if (type === 'settings') {
      const {
        shippingPolicy, freeShippingThreshold, flatRateShipping, processingTime,
        returnPolicy, returnWindowDays, acceptsReturns, payoutSchedule, minimumPayout,
        emailOnNewOrder, emailOnDispute, emailOnReview
      } = body;

      await query(
        `UPDATE seller_settings SET 
          shipping_policy = ?, free_shipping_threshold = ?, flat_rate_shipping = ?, 
          processing_time = ?, return_policy = ?, return_window_days = ?, 
          accepts_returns = ?, payout_schedule = ?, minimum_payout = ?,
          email_on_new_order = ?, email_on_dispute = ?, email_on_review = ?
        WHERE seller_id = ?`,
        [
          shippingPolicy, freeShippingThreshold, flatRateShipping, processingTime,
          returnPolicy, returnWindowDays, acceptsReturns ? 1 : 0, payoutSchedule, minimumPayout,
          emailOnNewOrder ? 1 : 0, emailOnDispute ? 1 : 0, emailOnReview ? 1 : 0,
          seller.id
        ]
      );
    }

    return NextResponse.json({ success: true, message: 'Settings updated' });
  } catch (error) {
    console.error('Update settings error:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
