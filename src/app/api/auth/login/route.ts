import { NextRequest, NextResponse } from 'next/server';

// Admin credentials
const ADMIN_CREDENTIALS = {
  username: 'adminaces1',
  password: 'GetMeInToAdmin'
};

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    // Validate credentials
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
      // Generate a simple token (in production, use JWT or proper session management)
      const token = Buffer.from(`${username}:${Date.now()}`).toString('base64');
      
      const response = NextResponse.json({
        success: true,
        message: 'Login successful',
        token,
        user: {
          username: username,
          role: 'admin'
        }
      });

      // Set HTTP-only cookie for additional security
      response.cookies.set('adminAuth', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      });

      return response;
    } else {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Invalid username or password' 
        },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Internal server error' 
      },
      { status: 500 }
    );
  }
}