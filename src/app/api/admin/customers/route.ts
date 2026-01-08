import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const customers = await query(`
      SELECT 
        id, email, first_name, last_name, phone, 
        is_active, email_verified, created_at, updated_at
      FROM customers
      ORDER BY created_at DESC
    `);

    return NextResponse.json({ customers });
  } catch (error) {
    console.error('Error fetching customers:', error);
    return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 });
  }
}
