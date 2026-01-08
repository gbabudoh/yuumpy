import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();
    if (!token) return NextResponse.json({ error: 'Token is required' }, { status: 400 });

    const users = await query(
      'SELECT id FROM customers WHERE reset_token = ? AND reset_token_expiry > NOW() AND is_active = 1',
      [token]
    ) as any[];

    if (users.length === 0) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Verify reset token error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
