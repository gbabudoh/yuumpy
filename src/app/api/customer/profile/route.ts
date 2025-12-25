import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Helper function to get customer ID from token
function getCustomerId(request: NextRequest): number | null {
  try {
    const token = request.cookies.get('customer_token')?.value;
    
    if (!token) {
      return null;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return decoded.customerId || null;
  } catch (error) {
    return null;
  }
}

// GET - Get customer profile
export async function GET(request: NextRequest) {
  try {
    const customerId = getCustomerId(request);
    
    if (!customerId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const customerResult = await query(
      `SELECT id, email, first_name, last_name, phone, created_at, updated_at 
       FROM customers WHERE id = ?`,
      [customerId]
    ) as any[];

    if (!Array.isArray(customerResult) || customerResult.length === 0) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    const customer = customerResult[0] as any;

    return NextResponse.json({
      success: true,
      customer: {
        id: customer.id,
        email: customer.email,
        firstName: customer.first_name,
        lastName: customer.last_name,
        phone: customer.phone || '',
        createdAt: customer.created_at,
        updatedAt: customer.updated_at
      }
    });
  } catch (error: any) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

// PUT - Update customer profile
export async function PUT(request: NextRequest) {
  try {
    const customerId = getCustomerId(request);
    
    if (!customerId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { firstName, lastName, phone, email } = body;

    // Validate required fields
    if (!firstName || !lastName || !email) {
      return NextResponse.json(
        { error: 'First name, last name, and email are required' },
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

    // Check if email is already taken by another customer
    const existingCustomer = await query(
      `SELECT id FROM customers WHERE email = ? AND id != ?`,
      [email, customerId]
    ) as any[];

    if (Array.isArray(existingCustomer) && existingCustomer.length > 0) {
      return NextResponse.json(
        { error: 'Email is already in use' },
        { status: 400 }
      );
    }

    // Update customer profile
    await query(
      `UPDATE customers 
       SET first_name = ?, last_name = ?, phone = ?, email = ?, updated_at = NOW()
       WHERE id = ?`,
      [firstName, lastName, phone || null, email, customerId]
    );

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully'
    });
  } catch (error: any) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

