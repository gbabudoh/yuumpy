import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json();
    if (!token || !password) return NextResponse.json({ error: 'Token and password are required' }, { status: 400 });
    if (password.length < 8) return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });

    const users = await query(
      'SELECT id FROM customers WHERE reset_token = ? AND reset_token_expiry > NOW() AND is_active = 1',
      [token]
    ) as any[];

    if (users.length === 0) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    await query(
      'UPDATE customers SET password_hash = ?, reset_token = NULL, reset_token_expiry = NULL WHERE id = ?',
      [hashedPassword, users[0].id]
    );

    return NextResponse.json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
