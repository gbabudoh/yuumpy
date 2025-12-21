import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Check if customer exists with this email
    const customerResult = await query(
      'SELECT id, first_name, last_name, phone FROM customers WHERE email = ? AND is_active = 1',
      [email]
    );

    if (!Array.isArray(customerResult) || customerResult.length === 0) {
      return NextResponse.json({ exists: false });
    }

    const customer = customerResult[0] as any;

    // Check if customer has a saved address
    const addressResult = await query(
      `SELECT address_line1, address_line2, city, county, postcode, country 
       FROM customer_addresses 
       WHERE customer_id = ? AND is_default = 1 
       LIMIT 1`,
      [customer.id]
    );

    const hasAddress = Array.isArray(addressResult) && addressResult.length > 0;
    const address = hasAddress ? addressResult[0] as any : null;

    return NextResponse.json({
      exists: true,
      customer: {
        id: customer.id,
        firstName: customer.first_name,
        lastName: customer.last_name,
        phone: customer.phone,
        hasAddress,
        address: address ? {
          addressLine1: address.address_line1,
          addressLine2: address.address_line2,
          city: address.city,
          county: address.county,
          postcode: address.postcode,
          country: address.country
        } : null
      }
    });
  } catch (error) {
    console.error('Error checking email:', error);
    return NextResponse.json(
      { error: 'Failed to check email' },
      { status: 500 }
    );
  }
}
