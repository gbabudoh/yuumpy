import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Check if the request is for admin routes (except login)
  if (request.nextUrl.pathname.startsWith('/admin') && 
      !request.nextUrl.pathname.startsWith('/admin/login')) {
    
    const token = request.cookies.get('adminAuth')?.value;
    
    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
    
    try {
      const decoded = Buffer.from(token, 'base64').toString('utf-8');
      const [username] = decoded.split(':');
      
      if (username !== 'adminaces1') {
        return NextResponse.redirect(new URL('/admin/login', request.url));
      }
    } catch {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  // Redirect seller login and register to account settings
  if (request.nextUrl.pathname === '/seller/login' || 
      request.nextUrl.pathname === '/seller/register') {
    return NextResponse.redirect(new URL('/account/settings?tab=selling', request.url));
  }

  // Seller dashboard routes — require customer auth (no separate seller login)
  if (request.nextUrl.pathname.startsWith('/seller')) {
    const customerToken = request.cookies.get('customer_token')?.value;
    
    if (!customerToken) {
      return NextResponse.redirect(new URL('/account/login?redirect=' + encodeURIComponent(request.nextUrl.pathname), request.url));
    }
    // Actual seller status check happens in the layout/API level
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/seller/:path*'
  ]
};
