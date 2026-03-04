import { NextRequest } from 'next/server';
import { query } from './database';
import jwt from 'jsonwebtoken';
import { extractSellerToken, verifySellerSession, Seller } from './seller-auth';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

/**
 * Get the authenticated seller from the request.
 * Tries customer_token first (unified auth), then falls back to legacy seller_token.
 */
export async function getAuthenticatedSeller(request: Request | NextRequest): Promise<Seller | null> {
  // 1. Try customer token (unified auth — seller is linked via customer_id)
  try {
    let customerToken: string | undefined;

    if ('cookies' in request && typeof (request as NextRequest).cookies?.get === 'function') {
      customerToken = (request as NextRequest).cookies.get('customer_token')?.value;
    } else {
      const cookieHeader = request.headers.get('cookie');
      if (cookieHeader) {
        const match = cookieHeader.match(/customer_token=([^;]+)/);
        if (match) customerToken = match[1];
      }
    }

    if (customerToken) {
      const decoded = jwt.verify(customerToken, JWT_SECRET) as { customerId: number };
      if (decoded.customerId) {
        const result = await query(
          'SELECT * FROM sellers WHERE customer_id = ?',
          [decoded.customerId]
        ) as Seller[];
        if (result.length > 0) return result[0];
      }
    }
  } catch {
    // Token invalid or expired, try fallback
  }

  // 2. Fallback: legacy seller_token
  try {
    const sellerToken = extractSellerToken(request);
    if (sellerToken) {
      const seller = await verifySellerSession(sellerToken);
      if (seller) return seller;
    }
  } catch {
    // No valid seller token either
  }

  return null;
}
