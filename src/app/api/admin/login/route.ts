import { NextRequest, NextResponse } from 'next/server';
import { getAdminByUsername, verifyPassword, generateToken, createAdminSession, updateLastLogin, AdminUser } from '@/lib/admin-auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    // Get admin user
    const admin = await getAdminByUsername(username);
    if (!admin) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, admin.password_hash);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Generate token
    const token = generateToken(admin.id, admin.role);

    // Create session
    const sessionCreated = await createAdminSession(admin.id, token);
    if (!sessionCreated) {
      return NextResponse.json(
        { error: 'Failed to create session' },
        { status: 500 }
      );
    }

    // Update last login
    await updateLastLogin(admin.id);

    // Return user data (without password)
    const { password_hash, ...adminData } = admin;

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      token,
      user: adminData
    });

  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    );
  }
}
