import { NextRequest, NextResponse } from 'next/server';
import { ResultSetHeader } from 'mysql2';
import { query } from '@/lib/database';
import { hashPassword, getRolePermissions } from '@/lib/admin-auth';

// Get all admin users
export async function GET() {
  try {
    const sql = `
      SELECT 
        au.id, au.username, au.email, au.role, au.permissions, 
        au.is_active, au.last_login, au.created_at,
        creator.username as created_by_username
      FROM admin_users au
      LEFT JOIN admin_users creator ON au.created_by = creator.id
      ORDER BY au.created_at DESC
    `;
    const result = await query(sql);

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Error fetching admin users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch admin users' },
      { status: 500 }
    );
  }
}

// Create new admin user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      username,
      email,
      password,
      role,
      created_by
    } = body;

    // Validate required fields
    if (!username || !email || !password || !role) {
      return NextResponse.json(
        { error: 'Username, email, password, and role are required' },
        { status: 400 }
      );
    }

    // Validate role
    const validRoles = ['super_admin', 'content_admin', 'product_admin', 'basic_admin'];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be super_admin, content_admin, product_admin, or basic_admin' },
        { status: 400 }
      );
    }

    // Check if username or email already exists
    const existingUserSql = 'SELECT id FROM admin_users WHERE username = ? OR email = ?';
    const existingUser = await query(existingUserSql, [username, email]);
    
    if (Array.isArray(existingUser) && existingUser.length > 0) {
      return NextResponse.json(
        { error: 'Username or email already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Get permissions for the role
    const permissions = getRolePermissions(role);

    // Create user
    const insertSql = `
      INSERT INTO admin_users (username, email, password_hash, role, permissions, created_by)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    const result = await query(insertSql, [
      username,
      email,
      passwordHash,
      role,
      JSON.stringify(permissions),
      created_by
    ]);

    return NextResponse.json({
      success: true,
      message: 'Admin user created successfully',
      userId: (result as ResultSetHeader).insertId
    });

  } catch (error) {
    console.error('Error creating admin user:', error);
    return NextResponse.json(
      { error: 'Failed to create admin user' },
      { status: 500 }
    );
  }
}

// Update admin user
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      id,
      username,
      email,
      role,
      is_active
    } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Validate role if provided
    if (role) {
      const validRoles = ['super_admin', 'content_admin', 'product_admin', 'basic_admin'];
      if (!validRoles.includes(role)) {
        return NextResponse.json(
          { error: 'Invalid role. Must be super_admin, content_admin, product_admin, or basic_admin' },
          { status: 400 }
        );
      }
    }

    // Check if username or email already exists (excluding current user)
    if (username || email) {
      const existingUserSql = 'SELECT id FROM admin_users WHERE (username = ? OR email = ?) AND id != ?';
      const existingUser = await query(existingUserSql, [username, email, id]);
      
      if (Array.isArray(existingUser) && existingUser.length > 0) {
        return NextResponse.json(
          { error: 'Username or email already exists' },
          { status: 400 }
        );
      }
    }

    // Build update query dynamically
    const updateFields = [];
    const updateValues = [];

    if (username) {
      updateFields.push('username = ?');
      updateValues.push(username);
    }
    if (email) {
      updateFields.push('email = ?');
      updateValues.push(email);
    }
    if (role) {
      updateFields.push('role = ?');
      updateValues.push(role);
      // Update permissions when role changes
      const permissions = getRolePermissions(role);
      updateFields.push('permissions = ?');
      updateValues.push(JSON.stringify(permissions));
    }
    if (typeof is_active === 'boolean') {
      updateFields.push('is_active = ?');
      updateValues.push(is_active);
    }

    if (updateFields.length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      );
    }

    updateValues.push(id);

    const updateSql = `UPDATE admin_users SET ${updateFields.join(', ')} WHERE id = ?`;
    await query(updateSql, updateValues);

    return NextResponse.json({
      success: true,
      message: 'Admin user updated successfully'
    });

  } catch (error) {
    console.error('Error updating admin user:', error);
    return NextResponse.json(
      { error: 'Failed to update admin user' },
      { status: 500 }
    );
  }
}

// Delete admin user
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Check if user exists and is not the super admin
    const userSql = 'SELECT role FROM admin_users WHERE id = ?';
    const user = await query(userSql, [id]);

    if (Array.isArray(user) && user.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (user[0].role === 'super_admin') {
      return NextResponse.json(
        { error: 'Cannot delete super admin user' },
        { status: 400 }
      );
    }

    // Delete user
    const deleteSql = 'DELETE FROM admin_users WHERE id = ?';
    await query(deleteSql, [id]);

    return NextResponse.json({
      success: true,
      message: 'Admin user deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting admin user:', error);
    return NextResponse.json(
      { error: 'Failed to delete admin user' },
      { status: 500 }
    );
  }
}
