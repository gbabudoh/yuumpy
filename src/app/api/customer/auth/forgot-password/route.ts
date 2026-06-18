import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';
import { sendPasswordResetEmail } from '@/lib/email';
import { rateLimit, getClientIp } from '@/lib/rate-limit';
import crypto from 'crypto';

const SILENT_SUCCESS = { success: true, message: 'If an account exists, we have sent a reset link.' };

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const { allowed, retryAfterMs } = await rateLimit(`forgot-password:${ip}`, 5, 15 * 60 * 1000);
  if (!allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil(retryAfterMs / 1000)) } }
    );
  }

  try {
    const { email } = await request.json();
    if (!email) return NextResponse.json({ error: 'Email is required' }, { status: 400 });

    const users = await query(
      'SELECT id, email, first_name FROM customers WHERE email = ? AND is_active = TRUE',
      [email]
    ) as any[];

    // Always return the same response to prevent email enumeration
    if (users.length === 0) {
      return NextResponse.json(SILENT_SUCCESS);
    }

    const user = users[0];
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

    await query(
      'UPDATE customers SET reset_token = ?, reset_token_expiry = ? WHERE id = ?',
      [resetToken, resetTokenExpiry, user.id]
    );

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://yuumpy.com';
    const resetUrl = `${appUrl}/account/reset-password?token=${resetToken}`;

    await sendPasswordResetEmail(user.email, user.first_name || 'there', resetUrl);

    return NextResponse.json(SILENT_SUCCESS);
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
