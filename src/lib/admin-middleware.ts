import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, verifyAdminSession } from '@/lib/admin-auth';

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: number;
    username: string;
    role: string;
    permissions: any;
  };
}

// Middleware to protect admin routes
export async function withAuth(
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>,
  requiredPermissions: string[] = []
) {
  return async (req: NextRequest) => {
    try {
      // Get token from Authorization header or cookies
      const authHeader = req.headers.get('authorization');
      const token = authHeader?.replace('Bearer ', '') || req.cookies.get('admin_token')?.value;

      if (!token) {
        return NextResponse.json(
          { error: 'Access token required' },
          { status: 401 }
        );
      }

      // Verify JWT token
      const decoded = verifyToken(token);
      if (!decoded) {
        return NextResponse.json(
          { error: 'Invalid or expired token' },
          { status: 401 }
        );
      }

      // Verify admin session
      const admin = await verifyAdminSession(token);
      if (!admin) {
        return NextResponse.json(
          { error: 'Invalid session' },
          { status: 401 }
        );
      }

      // Check permissions if required
      if (requiredPermissions.length > 0) {
        const hasPermission = requiredPermissions.some(permission => 
          admin.permissions[permission] === true
        );

        if (!hasPermission) {
          return NextResponse.json(
            { error: 'Insufficient permissions' },
            { status: 403 }
          );
        }
      }

      // Add user to request object
      const authenticatedReq = req as AuthenticatedRequest;
      authenticatedReq.user = {
        id: admin.id,
        username: admin.username,
        role: admin.role,
        permissions: admin.permissions };

      return handler(authenticatedReq);

    } catch (error) {
      console.error('Auth middleware error:', error);
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 500 }
      );
    }
  };
}

// Helper function to check if user has specific permission
export function hasPermission(user: any, permission: string): boolean {
  return user?.permissions?.[permission] === true;
}

// Helper function to check if user has any of the specified permissions
export function hasAnyPermission(user: any, permissions: string[]): boolean {
  return permissions.some(permission => user?.permissions?.[permission] === true);
}

// Helper function to check if user has all of the specified permissions
export function hasAllPermissions(user: any, permissions: string[]): boolean {
  return permissions.every(permission => user?.permissions?.[permission] === true);
}
