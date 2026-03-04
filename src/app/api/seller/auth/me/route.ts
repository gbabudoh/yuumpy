import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

function getCustomerId(request: NextRequest): number | null {
  try {
    const token = request.cookies.get('customer_token')?.value;
    if (!token) return null;
    const decoded = jwt.verify(token, JWT_SECRET) as { customerId: number };
    return decoded.customerId || null;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    // First try customer token (new unified auth)
    const customerId = getCustomerId(request);
    if (customerId) {
      const result = await query(
        `SELECT * FROM sellers WHERE customer_id = ? AND status = 'approved'`,
        [customerId]
      ) as Array<Record<string, unknown>>;

      if (result.length > 0) {
        const { password_hash: _, ...safeData } = result[0];
        return NextResponse.json({ seller: safeData });
      }
    }

    // Fallback: try legacy seller_token cookie
    const cookieHeader = request.headers.get('cookie');
    if (cookieHeader) {
      const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split('=');
        acc[key] = value;
        return acc;
      }, {} as Record<string, string>);

      const sellerToken = cookies.seller_token;
      if (sellerToken) {
        const { verifySellerSession } = await import('@/lib/seller-auth');
        const seller = await verifySellerSession(sellerToken);
        if (seller) {
          const { password_hash: _, ...safeData } = seller;
          return NextResponse.json({ seller: safeData });
        }
      }
    }

    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  } catch (error) {
    console.error('Seller auth check error:', error);
    return NextResponse.json({ error: 'Auth check failed' }, { status: 500 });
  }
}
