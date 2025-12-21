import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderNumber: string }> }
) {
  try {
    const { orderNumber } = await params;
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

    // Get order with all details
    const orderResult = await query(
      `SELECT o.id, o.order_number, o.total_amount, o.subtotal, o.shipping_cost, 
              o.tax_amount, o.currency, o.payment_status, o.order_status, 
              o.tracking_number, o.tracking_url, o.estimated_delivery,
              o.created_at, o.updated_at,
              o.shipping_address_line1, o.shipping_address_line2,
              o.shipping_city, o.shipping_county, o.shipping_postcode, o.shipping_country,
              (SELECT JSON_ARRAYAGG(
                JSON_OBJECT(
                  'id', oi.id,
                  'product_name', oi.product_name,
                  'product_slug', oi.product_slug,
                  'product_image_url', oi.product_image_url,
                  'quantity', oi.quantity,
                  'unit_price', oi.unit_price,
                  'total_price', oi.total_price
                )
              ) FROM order_items oi WHERE oi.order_id = o.id) as items
       FROM orders o
       WHERE o.order_number = ? AND o.customer_id = ?`,
      [orderNumber, decoded.customerId]
    );

    if (!Array.isArray(orderResult) || orderResult.length === 0) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    const order = orderResult[0] as any;

    // Format shipping address from inline fields
    if (order.shipping_address_line1) {
      order.shipping_address = {
        address_line1: order.shipping_address_line1,
        address_line2: order.shipping_address_line2,
        city: order.shipping_city,
        state: order.shipping_county,
        postal_code: order.shipping_postcode,
        country: order.shipping_country
      };
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error('Error fetching order details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order details' },
      { status: 500 }
    );
  }
}
