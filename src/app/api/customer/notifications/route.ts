import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Helper function to get customer ID from token
function getCustomerId(request: NextRequest): number | null {
  try {
    const token = request.cookies.get('customer_token')?.value;
    
    if (!token) {
      return null;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return decoded.customerId || null;
  } catch (error) {
    return null;
  }
}

// GET - Get all notifications for the authenticated customer
export async function GET(request: NextRequest) {
  try {
    const customerId = getCustomerId(request);
    
    if (!customerId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get('unread_only') === 'true';
    const limit = parseInt(searchParams.get('limit') || '50');

    let sql = `
      SELECT id, type, title, message, link_url, is_read, order_id, order_number, created_at
      FROM customer_notifications
      WHERE customer_id = ?
    `;

    const params: any[] = [customerId];

    if (unreadOnly) {
      sql += ' AND is_read = FALSE';
    }

    sql += ' ORDER BY created_at DESC LIMIT ?';
    params.push(limit);

    const notifications = await query(sql, params) as any[];

    // Get unread count
    const unreadResult = await query(
      `SELECT COUNT(*) as count FROM customer_notifications WHERE customer_id = ? AND is_read = FALSE`,
      [customerId]
    ) as any[];

    const unreadCount = unreadResult[0]?.count || 0;

    return NextResponse.json({
      success: true,
      notifications: Array.isArray(notifications) ? notifications : [],
      unreadCount: Number(unreadCount)
    });
  } catch (error: any) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

// PUT - Mark notifications as read
export async function PUT(request: NextRequest) {
  try {
    const customerId = getCustomerId(request);
    
    if (!customerId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { notificationIds, markAllAsRead } = body;

    if (markAllAsRead) {
      // Mark all as read
      await query(
        `UPDATE customer_notifications SET is_read = TRUE WHERE customer_id = ?`,
        [customerId]
      );
    } else if (notificationIds && Array.isArray(notificationIds) && notificationIds.length > 0) {
      // Mark specific notifications as read
      const placeholders = notificationIds.map(() => '?').join(',');
      await query(
        `UPDATE customer_notifications 
         SET is_read = TRUE 
         WHERE customer_id = ? AND id IN (${placeholders})`,
        [customerId, ...notificationIds]
      );
    } else {
      return NextResponse.json(
        { error: 'Either notificationIds or markAllAsRead must be provided' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Notifications marked as read'
    });
  } catch (error: any) {
    console.error('Error updating notifications:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Delete notification(s)
export async function DELETE(request: NextRequest) {
  try {
    const customerId = getCustomerId(request);
    
    if (!customerId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const notificationId = searchParams.get('id');
    const deleteAllRead = searchParams.get('delete_all_read') === 'true';

    if (deleteAllRead) {
      // Delete all read notifications
      await query(
        `DELETE FROM customer_notifications WHERE customer_id = ? AND is_read = TRUE`,
        [customerId]
      );
    } else if (notificationId) {
      // Delete specific notification
      await query(
        `DELETE FROM customer_notifications WHERE customer_id = ? AND id = ?`,
        [customerId, notificationId]
      );
    } else {
      return NextResponse.json(
        { error: 'Either id or delete_all_read must be provided' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Notification(s) deleted'
    });
  } catch (error: any) {
    console.error('Error deleting notifications:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

