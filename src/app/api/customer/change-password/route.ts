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

// PUT - Change password
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
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Current password and new password are required' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'New password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Get current password hash
    const customerResult = await query(
      `SELECT password_hash FROM customers WHERE id = ?`,
      [customerId]
    ) as any[];

    if (!Array.isArray(customerResult) || customerResult.length === 0) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    const customer = customerResult[0] as any;

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, customer.password_hash);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 401 }
      );
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    // Update password
    await query(
      `UPDATE customers SET password_hash = ?, updated_at = NOW() WHERE id = ?`,
      [newPasswordHash, customerId]
    );

    return NextResponse.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error: any) {
    console.error('Error changing password:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

