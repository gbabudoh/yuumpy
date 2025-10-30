import bcrypt from 'bcryptjs';
import { query } from './database';
import { generateJWT, verifyJWT, generateAdminToken, JWT_CONFIG } from './jwt-config';

export interface AdminUser {
  id: number;
  username: string;
  email: string;
  password_hash: string;
  role: 'super_admin' | 'content_admin' | 'product_admin';
  permissions: {
    can_manage_users: boolean;
    can_manage_products: boolean;
    can_manage_categories: boolean;
    can_manage_subcategories: boolean;
    can_manage_brands: boolean;
    can_manage_banner_ads: boolean;
    can_manage_product_banner_ads: boolean;
    can_manage_analytics: boolean;
    can_manage_seo: boolean;
    can_manage_settings: boolean;
    can_manage_emails: boolean;
    can_manage_pages: boolean;
  };
  is_active: boolean;
  last_login?: string;
  created_at: string;
}

export interface AdminSession {
  id: number;
  admin_user_id: number;
  session_token: string;
  expires_at: string;
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

// Verify password
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Generate JWT token
export function generateToken(userId: number, role: string): string {
  return generateAdminToken(userId, role, getRolePermissions(role));
}

// Verify JWT token
export function verifyToken(token: string): { userId: number; role: string } | null {
  try {
    const decoded = verifyJWT(token) as any;
    if (!decoded || decoded.type !== JWT_CONFIG.types.ADMIN) {
      return null;
    }
    return { userId: decoded.userId, role: decoded.role };
  } catch (error) {
    return null;
  }
}

// Get admin user by username
export async function getAdminByUsername(username: string): Promise<AdminUser | null> {
  try {
    const sql = 'SELECT * FROM admin_users WHERE username = ? AND is_active = 1';
    const result = await query(sql, [username]);
    return Array.isArray(result) && result.length > 0 ? (result[0] as AdminUser) : null;
  } catch (error) {
    console.error('Error fetching admin user:', error);
    return null;
  }
}

// Get admin user by ID
export async function getAdminById(id: number): Promise<AdminUser | null> {
  try {
    const sql = 'SELECT * FROM admin_users WHERE id = ? AND is_active = 1';
    const result = await query(sql, [id]);
    return Array.isArray(result) && result.length > 0 ? (result[0] as AdminUser) : null;
  } catch (error) {
    console.error('Error fetching admin user:', error);
    return null;
  }
}

// Create admin session
export async function createAdminSession(userId: number, token: string): Promise<boolean> {
  try {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24 hours

    const sql = `
      INSERT INTO admin_sessions (admin_user_id, session_token, expires_at) 
      VALUES (?, ?, ?)
    `;
    await query(sql, [userId, token, expiresAt]);
    return true;
  } catch (error) {
    console.error('Error creating admin session:', error);
    return false;
  }
}

// Verify admin session
export async function verifyAdminSession(token: string): Promise<AdminUser | null> {
  try {
    const sql = `
      SELECT au.* FROM admin_users au
      JOIN admin_sessions s ON au.id = s.admin_user_id
      WHERE s.session_token = ? AND s.expires_at > NOW() AND au.is_active = 1
    `;
    const result = await query(sql, [token]);
    return Array.isArray(result) && result.length > 0 ? (result[0] as AdminUser) : null;
  } catch (error) {
    console.error('Error verifying admin session:', error);
    return null;
  }
}

// Update last login
export async function updateLastLogin(userId: number): Promise<void> {
  try {
    const sql = 'UPDATE admin_users SET last_login = NOW() WHERE id = ?';
    await query(sql, [userId]);
  } catch (error) {
    console.error('Error updating last login:', error);
  }
}

// Delete expired sessions
export async function cleanupExpiredSessions(): Promise<void> {
  try {
    const sql = 'DELETE FROM admin_sessions WHERE expires_at < NOW()';
    await query(sql);
  } catch (error) {
    console.error('Error cleaning up expired sessions:', error);
  }
}

// Check if user has permission
export function hasPermission(user: AdminUser, permission: keyof AdminUser['permissions']): boolean {
  return user.permissions[permission] === true;
}

// Get role permissions
export function getRolePermissions(role: string): AdminUser['permissions'] {
  const permissions = {
    can_manage_users: false,
    can_manage_products: false,
    can_manage_categories: false,
    can_manage_subcategories: false,
    can_manage_brands: false,
    can_manage_banner_ads: false,
    can_manage_product_banner_ads: false,
    can_manage_analytics: false,
    can_manage_seo: false,
    can_manage_settings: false,
    can_manage_emails: false,
    can_manage_pages: false };

  switch (role) {
    case 'super_admin':
      // Super admin has all permissions
      Object.keys(permissions).forEach(key => {
        permissions[key as keyof typeof permissions] = true;
      });
      break;
    
    case 'content_admin':
      // Content admin can manage products, categories, subcategories, brands
      permissions.can_manage_products = true;
      permissions.can_manage_categories = true;
      permissions.can_manage_subcategories = true;
      permissions.can_manage_brands = true;
      break;
    
    case 'product_admin':
      // Product admin can only manage products
      permissions.can_manage_products = true;
      break;
  }

  return permissions;
}
