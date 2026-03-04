import { NextResponse } from 'next/server';
import { extractSellerToken, verifySellerToken } from '@/lib/seller-auth';
import { query } from '@/lib/database';

export async function POST(request: Request) {
  try {
    const token = extractSellerToken(request);
    
    if (token) {
      const decoded = verifySellerToken(token);
      if (decoded?.sellerId) {
        // Mark as offline in DB
        await query('UPDATE sellers SET is_online = 0, last_seen_at = NOW() WHERE id = ?', [decoded.sellerId]);
        // Also remove the session
        await query('DELETE FROM seller_sessions WHERE token = ?', [token]);
      }
    }
  } catch (error) {
    console.error('Logout cleanup error:', error);
  }

  const response = NextResponse.json({ success: true, message: 'Logged out successfully' });

  response.cookies.set('seller_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });

  return response;
}
