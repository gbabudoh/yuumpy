import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('customer_token')?.value;

    if (token) {
      // Remove session from database
      await query('DELETE FROM customer_sessions WHERE token = ?', [token]);
    }

    // Create response and clear cookie
    const response = NextResponse.json({ success: true });
    
    response.cookies.set('customer_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/'
    });

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Logout failed' },
      { status: 500 }
    );
  }
}
