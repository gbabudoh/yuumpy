import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('adminAuth')?.value || 
                 request.headers.get('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Not authenticated' 
        },
        { status: 401 }
      );
    }

    // Decode the token (in production, use proper JWT verification)
    try {
      const decoded = Buffer.from(token, 'base64').toString('utf-8');
      const [username] = decoded.split(':');
      
      if (username === 'adminaces1') {
        return NextResponse.json({
          success: true,
          user: {
            username: username,
            role: 'admin'
          }
        });
      } else {
        return NextResponse.json(
          { 
            success: false, 
            message: 'Invalid token' 
          },
          { status: 401 }
        );
      }
    } catch (decodeError) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Invalid token format' 
        },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Internal server error' 
      },
      { status: 500 }
    );
  }
}