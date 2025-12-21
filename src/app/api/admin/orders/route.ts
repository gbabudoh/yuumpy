import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const paymentStatus = searchParams.get('payment_status');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    let sql = `
      SELECT o.*,
             (SELECT JSON_ARRAYAGG(
               JSON_OBJECT(
                 'id', oi.id,
                 'product_id', oi.product_id,
                 'product_name', oi.product_name,
                 'product_slug', oi.product_slug,
                 'product_image_url', oi.product_image_url,
                 'quantity', oi.quantity,
                 'unit_price', oi.unit_price,
                 'total_price', oi.total_price
               )
             ) FROM order_items oi WHERE oi.order_id = o.id) as items
      FROM orders o
      WHERE 1=1
    `;
    const params: any[] = [];

    if (status) {
      sql += ' AND o.order_status = ?';
      params.push(status);
    }

    if (paymentStatus) {
      sql += ' AND o.payment_status = ?';
      params.push(paymentStatus);
    }

    if (search) {
      sql += ' AND (o.order_number LIKE ? OR o.customer_email LIKE ? OR o.customer_first_name LIKE ? OR o.customer_last_name LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    sql += ' ORDER BY o.created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const orders = await query(sql, params);

    // Get total count
    let countSql = 'SELECT COUNT(*) as total FROM orders o WHERE 1=1';
    const countParams: any[] = [];

    if (status) {
      countSql += ' AND o.order_status = ?';
      countParams.push(status);
    }

    if (paymentStatus) {
      countSql += ' AND o.payment_status = ?';
      countParams.push(paymentStatus);
    }

    if (search) {
      countSql += ' AND (o.order_number LIKE ? OR o.customer_email LIKE ? OR o.customer_first_name LIKE ? OR o.customer_last_name LIKE ?)';
      const searchTerm = `%${search}%`;
      countParams.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    const [countResult] = await query(countSql, countParams) as any[];
    const total = countResult.total;

    return NextResponse.json({
      orders: Array.isArray(orders) ? orders : [],
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}
