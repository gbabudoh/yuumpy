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

    // Get customer orders
    const ordersResult = await query(
      `SELECT o.id, o.order_number, o.total_amount, o.currency, o.payment_status, 
              o.order_status, o.tracking_number, o.tracking_url, o.estimated_delivery, o.created_at,
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
       WHERE o.customer_id = ?
       ORDER BY o.created_at DESC`,
      [decoded.customerId]
    );

    return NextResponse.json({
      orders: Array.isArray(ordersResult) ? ordersResult : []
    });
  } catch (error) {
    console.error('Error fetching customer orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}
