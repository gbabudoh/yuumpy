import { NextRequest } from 'next/server';
import { query } from './database';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export interface Customer {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
}

export async function getAuthenticatedCustomer(request: Request | NextRequest): Promise<Customer | null> {
  try {
    let token: string | undefined;

    if ('cookies' in request && typeof (request as NextRequest).cookies?.get === 'function') {
      token = (request as NextRequest).cookies.get('customer_token')?.value;
    } else {
      const cookieHeader = request.headers.get('cookie');
      if (cookieHeader) {
        const match = cookieHeader.match(/customer_token=([^;]+)/);
        if (match) token = match[1];
      }
    }

    if (!token) return null;

    const decoded = jwt.verify(token, JWT_SECRET) as { customerId: number };
    if (decoded.customerId) {
      const result = await query(
        'SELECT id, email, first_name, last_name FROM customers WHERE id = ?',
        [decoded.customerId]
      ) as Customer[];
      if (result.length > 0) return result[0];
    }
  } catch {
    // Token invalid or expired
  }

  return null;
}
