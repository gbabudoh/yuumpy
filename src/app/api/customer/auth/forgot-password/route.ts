import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    if (!email) return NextResponse.json({ error: 'Email is required' }, { status: 400 });

    const users = await query(
      'SELECT id, email, first_name FROM customers WHERE email = ? AND is_active = 1',
      [email]
    ) as any[];

    if (users.length === 0) {
      return NextResponse.json({ success: true, message: 'If an account exists, we have sent a reset link.' });
    }

    const user = users[0];
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000);

    await query(
      'UPDATE customers SET reset_token = ?, reset_token_expiry = ? WHERE id = ?',
      [resetToken, resetTokenExpiry, user.id]
    );

    const resetUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/account/reset-password?token=${resetToken}`;
    console.log('Password reset link for', email, ':', resetUrl);

    return NextResponse.json({
      success: true,
      message: 'If an account exists, we have sent a reset link.',
      resetUrl: process.env.NODE_ENV === 'development' ? resetUrl : undefined
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
