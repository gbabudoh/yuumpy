import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';
import { sendVerificationEmail } from '@/lib/email';
import { rateLimit, getClientIp } from '@/lib/rate-limit';
import crypto from 'crypto';

const SILENT_SUCCESS = { success: true, message: 'If an account exists and needs verification, we have sent a new link.' };

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const { allowed, retryAfterMs } = await rateLimit(`resend-verification:${ip}`, 5, 15 * 60 * 1000);
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
      'SELECT id, email, first_name FROM customers WHERE email = ? AND is_active = TRUE AND email_verified = FALSE',
      [email]
    ) as any[];

    // Always return the same response to prevent email enumeration
    if (users.length === 0) {
      return NextResponse.json(SILENT_SUCCESS);
    }

    const user = users[0];
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await query(
      'UPDATE customers SET email_verification_token = ?, email_verification_token_expiry = ? WHERE id = ?',
      [verificationToken, verificationTokenExpiry, user.id]
    );

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://yuumpy.com';
    const verifyUrl = `${appUrl}/account/verify-email?token=${verificationToken}`;

    await sendVerificationEmail(user.email, user.first_name || 'there', verifyUrl);

    return NextResponse.json(SILENT_SUCCESS);
  } catch (error) {
    console.error('Resend verification error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
