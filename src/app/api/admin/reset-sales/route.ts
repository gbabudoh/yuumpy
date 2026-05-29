import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    // In PostgreSQL, TRUNCATE CASCADE handles foreign key dependencies
    await query('TRUNCATE TABLE order_items CASCADE');
    await query('TRUNCATE TABLE orders CASCADE');
    await query('TRUNCATE TABLE payments CASCADE');
    await query('TRUNCATE TABLE analytics CASCADE');

    return NextResponse.json({
      success: true,
      message: 'All sales data, payments, and analytics have been cleared.',
    });
  } catch (error) {
    console.error('Error resetting sales data:', error);
    return NextResponse.json({ error: 'Failed to reset sales data' }, { status: 500 });
  }
}
