import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

const JWT_SECRET = process.env.JWT_SECRET ?? (() => { throw new Error('JWT_SECRET environment variable is not set'); })();
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? '';

const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const { allowed, retryAfterMs } = await rateLimit(`google-auth:${ip}`, 10, 15 * 60 * 1000);
  if (!allowed) {
    return NextResponse.json(
      { error: 'Too many attempts. Please try again later.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil(retryAfterMs / 1000)) } }
    );
  }

  if (!GOOGLE_CLIENT_ID) {
    return NextResponse.json({ error: 'Google sign-in is not configured' }, { status: 500 });
  }

  try {
    const { credential } = await request.json();
    if (!credential) {
      return NextResponse.json({ error: 'Missing Google credential' }, { status: 400 });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    if (!payload?.email || !payload.sub) {
      return NextResponse.json({ error: 'Invalid Google credential' }, { status: 401 });
    }

    const { sub: googleId, email, given_name, family_name, email_verified } = payload;
    const firstName = given_name || email.split('@')[0];
    const lastName = family_name || '';

    // Find existing customer by google_id or email
    const existing = await query(
      'SELECT id, email, first_name, last_name, is_active, google_id FROM customers WHERE google_id = ? OR email = ?',
      [googleId, email]
    );

    let customer: any;

    if (Array.isArray(existing) && existing.length > 0) {
      customer = existing[0];

      if (!customer.is_active) {
        return NextResponse.json(
          { error: 'Account is disabled. Please contact support.' },
          { status: 401 }
        );
      }

      // Link the Google account to an existing email/password customer
      if (!customer.google_id) {
        await query('UPDATE customers SET google_id = ?, email_verified = ? WHERE id = ?', [
          googleId,
          Boolean(email_verified),
          customer.id,
        ]);
      }
    } else {
      const result = await query(
        `INSERT INTO customers (email, first_name, last_name, google_id, email_verified)
         VALUES (?, ?, ?, ?, ?)`,
        [email, firstName, lastName, googleId, Boolean(email_verified)]
      );
      const customerId = (result as any).insertId;
      customer = { id: customerId, email, first_name: firstName, last_name: lastName };
    }

    // Generate JWT token (same shape as password login)
    const token = jwt.sign(
      {
        customerId: customer.id,
        email: customer.email,
        firstName: customer.first_name,
        lastName: customer.last_name,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await query(
      'INSERT INTO customer_sessions (customer_id, token, expires_at) VALUES (?, ?, ?)',
      [customer.id, token, expiresAt]
    );

    const response = NextResponse.json({
      success: true,
      customer: {
        id: customer.id,
        email: customer.email,
        firstName: customer.first_name,
        lastName: customer.last_name,
      },
    });

    response.cookies.set('customer_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Google sign-in error:', error);
    return NextResponse.json({ error: 'Google sign-in failed' }, { status: 500 });
  }
}
