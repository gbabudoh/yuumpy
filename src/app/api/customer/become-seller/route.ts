import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

function getCustomerId(request: NextRequest): number | null {
  try {
    const token = request.cookies.get('customer_token')?.value;
    if (!token) return null;
    const decoded = jwt.verify(token, JWT_SECRET) as { customerId: number };
    return decoded.customerId || null;
  } catch {
    return null;
  }
}

// GET: Check if customer already has a seller account
export async function GET(request: NextRequest) {
  try {
    const customerId = getCustomerId(request);
    if (!customerId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const sellerResult = await query(
      `SELECT id, store_name, store_slug, status, is_verified, city, country, created_at 
       FROM sellers WHERE customer_id = ?`,
      [customerId]
    ) as Array<Record<string, unknown>>;

    if (sellerResult.length > 0) {
      return NextResponse.json({ hasSeller: true, seller: sellerResult[0] });
    }

    return NextResponse.json({ hasSeller: false });
  } catch (error) {
    console.error('Check seller status error:', error);
    return NextResponse.json({ error: 'Failed to check seller status' }, { status: 500 });
  }
}

// POST: Apply to become a seller
export async function POST(request: NextRequest) {
  try {
    const customerId = getCustomerId(request);
    if (!customerId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Check if already a seller
    const existing = await query(
      'SELECT id, status FROM sellers WHERE customer_id = ?',
      [customerId]
    ) as Array<{ id: number; status: string }>;

    if (existing.length > 0) {
      return NextResponse.json(
        { error: `You already have a seller account (status: ${existing[0].status})` },
        { status: 409 }
      );
    }

    // Get customer info to pre-fill
    const customerResult = await query(
      'SELECT id, email, first_name, last_name, phone FROM customers WHERE id = ?',
      [customerId]
    ) as Array<{ id: number; email: string; first_name: string; last_name: string; phone: string }>;

    if (customerResult.length === 0) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    const customer = customerResult[0];
    const body = await request.json();
    const { storeName, businessName, description, city, country } = body;

    if (!storeName || !city || !country) {
      return NextResponse.json(
        { error: 'Store name, city, and country are required' },
        { status: 400 }
      );
    }

    // Generate slug from store name
    const baseSlug = storeName
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

    // Ensure slug uniqueness
    let slug = baseSlug;
    let slugSuffix = 0;
    while (true) {
      const slugCheck = await query(
        'SELECT id FROM sellers WHERE store_slug = ?',
        [slug]
      ) as Array<{ id: number }>;
      if (slugCheck.length === 0) break;
      slugSuffix++;
      slug = `${baseSlug}-${slugSuffix}`;
    }

    // Get customer's default address for region info
    let addressLine1 = '';
    let addressLine2 = '';
    let stateProvince = '';
    let postalCode = '';
    try {
      const addrResult = await query(
        `SELECT address_line1, address_line2, city, county, postcode, country 
         FROM customer_addresses WHERE customer_id = ? AND is_default = 1 LIMIT 1`,
        [customerId]
      ) as Array<Record<string, string>>;
      if (addrResult.length > 0) {
        addressLine1 = addrResult[0].address_line1 || '';
        addressLine2 = addrResult[0].address_line2 || '';
        stateProvince = addrResult[0].county || '';
        postalCode = addrResult[0].postcode || '';
      }
    } catch { /* no addresses yet, that's fine */ }

    // Create seller record linked to customer — no separate password needed
    const result = await query(
      `INSERT INTO sellers 
       (customer_id, email, password_hash, store_name, store_slug, business_name, description, 
        phone, address_line1, address_line2, city, state_province, postal_code, country, status)
       VALUES (?, ?, '', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [
        customerId, customer.email, storeName, slug,
        businessName || null, description || null,
        customer.phone || null,
        addressLine1, addressLine2, city, stateProvince, postalCode, country
      ]
    ) as { insertId: number };

    const sellerId = result.insertId;

    // Create default seller settings
    await query('INSERT INTO seller_settings (seller_id) VALUES (?)', [sellerId]);

    return NextResponse.json({
      success: true,
      seller: {
        id: sellerId,
        store_name: storeName,
        store_slug: slug,
        status: 'pending',
        city,
        country,
      },
      message: 'Your seller application has been submitted. You will be notified once approved.',
    });
  } catch (error) {
    console.error('Become seller error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Failed to create seller account', details: message }, { status: 500 });
  }
}
