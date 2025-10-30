import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const eventType = searchParams.get('event_type');
    const productId = searchParams.get('product_id');
    const categoryId = searchParams.get('category_id');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');

    let sql = `
      SELECT 
        event_type,
        COUNT(*) as count,
        DATE(created_at) as date
      FROM analytics
      WHERE 1=1
    `;
    const params: any[] = [];

    if (eventType) {
      sql += ' AND event_type = ?';
      params.push(eventType);
    }

    if (productId) {
      sql += ' AND product_id = ?';
      params.push(productId);
    }

    if (categoryId) {
      sql += ' AND category_id = ?';
      params.push(categoryId);
    }

    if (startDate) {
      sql += ' AND created_at >= ?';
      params.push(startDate);
    }

    if (endDate) {
      sql += ' AND created_at <= ?';
      params.push(endDate);
    }

    sql += ' GROUP BY event_type, DATE(created_at) ORDER BY date DESC';

    const analytics = await query(sql, params);

    return NextResponse.json(analytics);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      event_type,
      product_id,
      category_id,
      user_ip,
      user_agent,
      referrer,
      page_url,
      metadata
    } = body;

    const sql = `
      INSERT INTO analytics (
        event_type, product_id, category_id, user_ip, user_agent,
        referrer, page_url, metadata
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await query(sql, [
      event_type,
      product_id,
      category_id,
      user_ip,
      user_agent,
      referrer,
      page_url,
      JSON.stringify(metadata)
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error logging analytics:', error);
    return NextResponse.json(
      { error: 'Failed to log analytics' },
      { status: 500 }
    );
  }
}
