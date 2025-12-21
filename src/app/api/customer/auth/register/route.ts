import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(request: NextRequest) {
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

    // Create customer
    const result = await query(
      `INSERT INTO customers (email, password_hash, first_name, last_name, phone)
       VALUES (?, ?, ?, ?, ?)`,
      [email, passwordHash, firstName, lastName, phone || null]
    );

    const customerId = (result as any).insertId;

    // Generate JWT token
    const token = jwt.sign(
      {
        customerId,
        email,
        firstName,
        lastName
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Store session in database
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await query(
      'INSERT INTO customer_sessions (customer_id, token, expires_at) VALUES (?, ?, ?)',
      [customerId, token, expiresAt]
    );

    // Create response with cookie
    const response = NextResponse.json({
      success: true,
      customer: {
        id: customerId,
        email,
        firstName,
        lastName
      }
    });

    // Set HTTP-only cookie
    response.cookies.set('customer_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/'
    });

    return response;
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 500 }
    );
  }
}
