import bcrypt from 'bcryptjs';
import { query } from './database';
import { verifyJWT, generateJWT } from './jwt-config';

export interface Seller {
  id: number;
  email: string;
  password_hash: string;
  store_name: string;
  store_slug: string;
  business_name: string;
  description: string;
  logo_url: string;
  banner_url: string;
  phone: string;
  website: string;
  address_line1: string;
  address_line2: string;
  city: string;
  state_province: string;
  postal_code: string;
  country: string;
  stripe_connect_id: string;
  stripe_onboarding_complete: boolean;
  commission_rate: number;
  status: 'pending' | 'approved' | 'suspended' | 'rejected';
  is_featured: boolean;
  is_verified: boolean;
  total_sales: number;
  total_orders: number;
  average_rating: number;
  total_reviews: number;
  email_verified: boolean;
  last_login: string;
  created_at: string;
  updated_at: string;
}

// Hash password
export async function hashSellerPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

// Verify password
export async function verifySellerPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Generate seller JWT token
export function generateSellerToken(sellerId: number): string {
  const payload = {
    sellerId,
    type: 'seller',
    iat: Math.floor(Date.now() / 1000),
  };
  return generateJWT(payload, 'access');
}

// Verify seller JWT token
export function verifySellerToken(token: string): { sellerId: number } | null {
  try {
    const decoded = verifyJWT(token) as { sellerId: number; type: string };
    if (!decoded || decoded.type !== 'seller') {
      return null;
    }
    return { sellerId: decoded.sellerId };
  } catch {
    return null;
  }
}

// Get seller by email
export async function getSellerByEmail(email: string): Promise<Seller | null> {
  try {
    const result = await query('SELECT * FROM sellers WHERE email = ?', [email]) as Seller[];
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error('Error fetching seller by email:', error);
    return null;
  }
}

// Get seller by ID
export async function getSellerById(id: number): Promise<Seller | null> {
  try {
    const result = await query('SELECT * FROM sellers WHERE id = ?', [id]) as Seller[];
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error('Error fetching seller by id:', error);
    return null;
  }
}

// Get seller by store slug
export async function getSellerBySlug(slug: string): Promise<Seller | null> {
  try {
    const result = await query('SELECT * FROM sellers WHERE store_slug = ?', [slug]) as Seller[];
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error('Error fetching seller by slug:', error);
    return null;
  }
}

// Create a new seller
export async function createSeller(data: {
  email: string;
  password: string;
  store_name: string;
  store_slug: string;
  business_name?: string;
  description?: string;
  phone?: string;
}): Promise<{ success: boolean; sellerId?: number; error?: string }> {
  try {
    const existing = await getSellerByEmail(data.email);
    if (existing) {
      return { success: false, error: 'Email already registered' };
    }

    // Check slug uniqueness
    const slugExists = await getSellerBySlug(data.store_slug);
    if (slugExists) {
      return { success: false, error: 'Store slug already taken' };
    }

    const password_hash = await hashSellerPassword(data.password);

    const result = await query(
      `INSERT INTO sellers (email, password_hash, store_name, store_slug, business_name, description, phone) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        data.email,
        password_hash,
        data.store_name,
        data.store_slug,
        data.business_name || null,
        data.description || null,
        data.phone || null,
      ]
    ) as { insertId: number };

    // Create default seller settings
    if (result.insertId) {
      await query(
        'INSERT INTO seller_settings (seller_id) VALUES (?)',
        [result.insertId]
      );
    }

    return { success: true, sellerId: result.insertId };
  } catch (error) {
    console.error('Error creating seller:', error);
    return { success: false, error: 'Failed to create seller account' };
  }
}

// Login seller
// Supports both: legacy sellers with their own password, and customer-linked sellers using customer password
export async function loginSeller(email: string, password: string): Promise<{
  success: boolean;
  token?: string;
  seller?: Partial<Seller>;
  error?: string;
}> {
  try {
    const seller = await getSellerByEmail(email);
    if (!seller) {
      return { success: false, error: 'Invalid email or password' };
    }

    if (seller.status === 'suspended') {
      return { success: false, error: 'Your account has been suspended. Contact support.' };
    }

    if (seller.status === 'rejected') {
      return { success: false, error: 'Your application was rejected. Contact support.' };
    }

    if (seller.status === 'pending') {
      return { success: false, error: 'Your seller application is still pending approval.' };
    }

    let valid = false;

    // If seller has own password, verify it
    if (seller.password_hash && seller.password_hash.length > 0) {
      valid = await verifySellerPassword(password, seller.password_hash);
    }

    // If not valid yet and seller is linked to a customer, try customer password
    if (!valid) {
      try {
        const customerResult = await query(
          'SELECT password_hash FROM customers WHERE email = ?',
          [email]
        ) as { password_hash: string }[];
        if (customerResult.length > 0 && customerResult[0].password_hash) {
          valid = await bcrypt.compare(password, customerResult[0].password_hash);
        }
      } catch { /* customers table might not have this user */ }
    }

    if (!valid) {
      return { success: false, error: 'Invalid email or password' };
    }

    const token = generateSellerToken(seller.id);

    // Create session
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);
    await query(
      'INSERT INTO seller_sessions (seller_id, token, expires_at) VALUES (?, ?, ?)',
      [seller.id, token, expiresAt]
    );

    // Update last login and status
    await query('UPDATE sellers SET last_login = NOW(), is_online = 1, last_seen_at = NOW() WHERE id = ?', [seller.id]);

    const safeData = { ...seller } as Partial<Seller>;
    delete safeData.password_hash;

    return { success: true, token, seller: safeData };
  } catch (error) {
    console.error('Error logging in seller:', error);
    return { success: false, error: 'Login failed' };
  }
}

// Verify seller session from cookie token
export async function verifySellerSession(token: string): Promise<Seller | null> {
  try {
    const decoded = verifySellerToken(token);
    if (!decoded) return null;

    const result = await query(
      `SELECT s.* FROM sellers s 
       JOIN seller_sessions ss ON s.id = ss.seller_id 
       WHERE ss.token = ? AND ss.expires_at > NOW()`,
      [token]
    ) as Seller[];

    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error('Error verifying seller session:', error);
    return null;
  }
}

// Get seller from request (extracts token from cookie)
export function extractSellerToken(request: Request): string | null {
  const cookieHeader = request.headers.get('cookie');
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split('=');
    acc[key] = value;
    return acc;
  }, {} as Record<string, string>);

  return cookies.seller_token || null;
}

// Generate store slug from store name
export function generateStoreSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}
