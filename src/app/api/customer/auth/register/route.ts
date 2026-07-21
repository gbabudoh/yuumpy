import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { rateLimit, getClientIp } from '@/lib/rate-limit';
import { sendVerificationEmail } from '@/lib/email';

let verificationColumnsEnsured = false;
async function ensureVerificationColumns() {
  if (verificationColumnsEnsured) return;
  try {
    await query('ALTER TABLE customers ADD COLUMN IF NOT EXISTS email_verification_token VARCHAR(255) DEFAULT NULL');
    await query('ALTER TABLE customers ADD COLUMN IF NOT EXISTS email_verification_token_expiry TIMESTAMP DEFAULT NULL');
  } catch (e) {
    console.warn('email_verification column migration failed (may already exist):', e);
  } finally {
    verificationColumnsEnsured = true;
  }
}

export async function POST(request: NextRequest) {
  await ensureVerificationColumns();

  const ip = getClientIp(request);
  const { allowed, retryAfterMs } = await rateLimit(`register:${ip}`, 5, 60 * 60 * 1000);
  if (!allowed) {
    return NextResponse.json(
      { error: 'Too many registration attempts. Please try again later.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil(retryAfterMs / 1000)) } }
    );
  }

  try {
    const body = await request.json();
    const { email, password, firstName, lastName, phone } = body;

    // Validate required fields
    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'Email, password, first name, and last name are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate password length
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingCustomer = await query(
      'SELECT id FROM customers WHERE email = ?',
      [email]
    );

    if (Array.isArray(existingCustomer) && existingCustomer.length > 0) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Generate email verification token (24 hour expiry)
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Create customer — email_verified defaults to false; no session is
    // issued until the email is confirmed via the verification link.
    const result = await query(
      `INSERT INTO customers (email, password_hash, first_name, last_name, phone, email_verification_token, email_verification_token_expiry)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [email, passwordHash, firstName, lastName, phone || null, verificationToken, verificationTokenExpiry]
    );

    const customerId = (result as any).insertId;

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://yuumpy.com';
    const verifyUrl = `${appUrl}/account/verify-email?token=${verificationToken}`;
    await sendVerificationEmail(email, firstName, verifyUrl);

    return NextResponse.json({
      success: true,
      requiresVerification: true,
      email,
      customerId,
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 500 }
    );
  }
}
