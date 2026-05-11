import { NextResponse } from 'next/server';
import { query } from '@/lib/database';
import { getAuthenticatedSeller } from '@/lib/seller-session';
// Assume we have a similar helper for customers
import { getAuthenticatedCustomer } from '@/lib/customer-auth'; 

export async function POST(request: Request) {
  try {
    const customer = await getAuthenticatedCustomer(request);
    if (!customer) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const body = await request.json();
    const { sellerId, productId, description, attachmentUrls } = body;

    if (!sellerId || !description) {
      return NextResponse.json({ error: 'Seller ID and description are required' }, { status: 400 });
    }

    const result = await query(
      `INSERT INTO custom_requests (customer_id, seller_id, product_id, description, attachment_urls, status)
       VALUES (?, ?, ?, ?, ?, 'pending')`,
      [customer.id, sellerId, productId || null, description, attachmentUrls ? JSON.stringify(attachmentUrls) : null]
    ) as { insertId: number };

    return NextResponse.json({
      success: true,
      requestId: result.insertId,
      message: 'Your customization request has been sent to the artisan!'
    });
  } catch (error) {
    console.error('Custom request creation error:', error);
    return NextResponse.json({ error: 'Failed to submit request' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const seller = await getAuthenticatedSeller(request);
    const customer = await getAuthenticatedCustomer(request);

    if (!seller && !customer) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    let results;
    if (seller) {
      results = await query(
        `SELECT cr.*, c.first_name, c.last_name, p.name as product_name 
         FROM custom_requests cr
         JOIN customers c ON cr.customer_id = c.id
         LEFT JOIN products p ON cr.product_id = p.id
         WHERE cr.seller_id = ?
         ORDER BY cr.created_at DESC`,
        [seller.id]
      );
    } else {
      results = await query(
        `SELECT cr.*, s.store_name, p.name as product_name 
         FROM custom_requests cr
         JOIN sellers s ON cr.seller_id = s.id
         LEFT JOIN products p ON cr.product_id = p.id
         WHERE cr.customer_id = ?
         ORDER BY cr.created_at DESC`,
        [customer.id]
      );
    }

    return NextResponse.json({ requests: results });
  } catch (error) {
    console.error('Custom request fetch error:', error);
    return NextResponse.json({ error: 'Failed to load requests' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const seller = await getAuthenticatedSeller(request);
    if (!seller) return NextResponse.json({ error: 'Not authorized' }, { status: 401 });

    const body = await request.json();
    const { requestId, status, quotedPrice } = body;

    if (!requestId || !status) {
      return NextResponse.json({ error: 'Request ID and status are required' }, { status: 400 });
    }

    await query(
      `UPDATE custom_requests SET status = ?, quoted_price = ? WHERE id = ? AND seller_id = ?`,
      [status, quotedPrice || null, requestId, seller.id]
    );

    return NextResponse.json({ success: true, message: 'Request updated' });
  } catch (error) {
    console.error('Custom request update error:', error);
    return NextResponse.json({ error: 'Failed to update request' }, { status: 500 });
  }
}
