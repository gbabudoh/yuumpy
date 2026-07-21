import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();
    if (!token) return NextResponse.json({ error: 'Token is required' }, { status: 400 });

    const users = await query(
      'SELECT id FROM customers WHERE email_verification_token = ? AND email_verification_token_expiry > NOW()',
      [token]
    ) as any[];

    if (users.length === 0) {
      return NextResponse.json({ error: 'Invalid or expired verification link' }, { status: 400 });
    }

    await query(
      'UPDATE customers SET email_verified = TRUE, email_verification_token = NULL, email_verification_token_expiry = NULL WHERE id = ?',
      [users[0].id]
    );

    return NextResponse.json({ success: true, message: 'Email verified successfully' });
  } catch (error) {
    console.error('Verify email error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
