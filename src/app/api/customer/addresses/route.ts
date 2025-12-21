import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('customer_token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Verify token
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Get customer addresses
    const addressesResult = await query(
      `SELECT id, address_type, first_name, last_name, address_line1, address_line2, 
              city, county, postcode, country, phone, is_default
       FROM customer_addresses 
       WHERE customer_id = ?
       ORDER BY is_default DESC, created_at DESC`,
      [decoded.customerId]
    );

    return NextResponse.json({
      addresses: Array.isArray(addressesResult) ? addressesResult : []
    });
  } catch (error) {
    console.error('Error fetching addresses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch addresses' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('customer_token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Verify token
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      address_type = 'shipping',
      first_name,
      last_name,
      address_line1,
      address_line2,
      city,
      county,
      postcode,
      country = 'United Kingdom',
      phone,
      is_default = false
    } = body;

    // Validate required fields
    if (!first_name || !last_name || !address_line1 || !city || !postcode) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // If this is set as default, unset other defaults first
    if (is_default) {
      await query(
        'UPDATE customer_addresses SET is_default = 0 WHERE customer_id = ?',
        [decoded.customerId]
      );
    }

    // Insert new address
    const result = await query(
      `INSERT INTO customer_addresses 
       (customer_id, address_type, first_name, last_name, address_line1, address_line2, 
        city, county, postcode, country, phone, is_default)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        decoded.customerId,
        address_type,
        first_name,
        last_name,
        address_line1,
        address_line2 || null,
        city,
        county || null,
        postcode,
        country,
        phone || null,
        is_default ? 1 : 0
      ]
    );

    return NextResponse.json({
      success: true,
      addressId: (result as any).insertId
    });
  } catch (error) {
    console.error('Error creating address:', error);
    return NextResponse.json(
      { error: 'Failed to create address' },
      { status: 500 }
    );
  }
}
