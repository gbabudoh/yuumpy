import jwt from 'jsonwebtoken';

// JWT Configuration
export const JWT_CONFIG = {
  // Secret key - should be in environment variables
  secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production',
  
  // Token expiration times
  expiresIn: {
    access: '24h',      // Access token expires in 24 hours
    refresh: '7d',      // Refresh token expires in 7 days
    admin: '8h',        // Admin token expires in 8 hours
  },
  
  // Token types
  types: {
    ACCESS: 'access',
    REFRESH: 'refresh',
    ADMIN: 'admin' },
  
  // Algorithm
  algorithm: 'HS256' as const };

// Generate JWT token with custom options
export function generateJWT(
  payload: any,
  type: keyof typeof JWT_CONFIG.expiresIn = 'access'
): string {
  const expiresInValue = JWT_CONFIG.expiresIn[type];
  const options: jwt.SignOptions = {
    expiresIn: expiresInValue as any,
    algorithm: JWT_CONFIG.algorithm };

  return jwt.sign(payload, JWT_CONFIG.secret, options);
}

// Verify JWT token
export function verifyJWT(token: string): any {
  try {
    return jwt.verify(token, JWT_CONFIG.secret);
  } catch (error) {
    console.error('JWT verification error:', error);
    return null;
  }
}

// Decode JWT token without verification (for debugging)
export function decodeJWT(token: string): any {
  try {
    return jwt.decode(token);
  } catch (error) {
    console.error('JWT decode error:', error);
    return null;
  }
}

// Check if token is expired
export function isTokenExpired(token: string): boolean {
  try {
    const decoded = jwt.decode(token) as any;
    if (!decoded || !decoded.exp) return true;
    
    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp < currentTime;
  } catch (error) {
    return true;
  }
}

// Generate admin-specific token
export function generateAdminToken(userId: number, role: string, permissions: any): string {
  const payload = {
    userId,
    role,
    permissions,
    type: JWT_CONFIG.types.ADMIN,
    iat: Math.floor(Date.now() / 1000) };

  return generateJWT(payload, 'admin');
}

// Generate refresh token
export function generateRefreshToken(userId: number): string {
  const payload = {
    userId,
    type: JWT_CONFIG.types.REFRESH,
    iat: Math.floor(Date.now() / 1000) };

  return generateJWT(payload, 'refresh');
}

// Extract token from request headers
export function extractTokenFromRequest(request: Request): string | null {
  // Try Authorization header first
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // Try cookie
  const cookieHeader = request.headers.get('cookie');
  if (cookieHeader) {
    const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      acc[key] = value;
      return acc;
    }, {} as Record<string, string>);

    return cookies.admin_token || null;
  }

  return null;
}

// Validate JWT secret
export function validateJWTSecret(): boolean {
  const secret = process.env.JWT_SECRET;
  
  if (!secret) {
    console.error('❌ JWT_SECRET is not set in environment variables');
    return false;
  }

  if (secret === 'your-super-secret-jwt-key-change-this-in-production') {
    console.warn('⚠️  JWT_SECRET is using default value. Please change it in production!');
    return false;
  }

  if (secret.length < 32) {
    console.warn('⚠️  JWT_SECRET should be at least 32 characters long for security');
    return false;
  }

  console.log('✅ JWT_SECRET is properly configured');
  return true;
}

// Generate a secure JWT secret (for development)
export function generateSecureSecret(): string {
  const crypto = require('crypto');
  return crypto.randomBytes(64).toString('hex');
}
