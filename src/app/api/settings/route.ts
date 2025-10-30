import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    if (key) {
      // Get specific setting by key
      const result = await query(
        'SELECT key_name, value, description FROM settings WHERE key_name = ?',
        [key]
      );
      
      if ((result as any[]).length === 0) {
        return NextResponse.json({ error: 'Setting not found' }, { status: 404 });
      }
      
      return NextResponse.json((result as any[])[0]);
    } else {
      // Get all settings
      const result = await query(
        'SELECT key_name, value, description FROM settings ORDER BY key_name'
      );
      
      return NextResponse.json(result);
    }
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { key_name, value, description } = body;

    if (!key_name || value === undefined) {
      return NextResponse.json(
        { error: 'Key name and value are required' },
        { status: 400 }
      );
    }

    // Update or insert setting
    const result = await query(
      `INSERT INTO settings (key_name, value, description) 
       VALUES (?, ?, ?) 
       ON DUPLICATE KEY UPDATE 
       value = VALUES(value), 
       description = VALUES(description),
       updated_at = CURRENT_TIMESTAMP`,
      [key_name, value, description || null]
    );

    return NextResponse.json({
      success: true,
      message: 'Setting updated successfully',
      setting: { key_name, value, description }
    });
  } catch (error) {
    console.error('Error updating setting:', error);
    return NextResponse.json(
      { error: 'Failed to update setting' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    if (!key) {
      return NextResponse.json(
        { error: 'Key parameter is required' },
        { status: 400 }
      );
    }

    const result = await query(
      'DELETE FROM settings WHERE key_name = ?',
      [key]
    );

    if ((result as any).affectedRows === 0) {
      return NextResponse.json(
        { error: 'Setting not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Setting deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting setting:', error);
    return NextResponse.json(
      { error: 'Failed to delete setting' },
      { status: 500 }
    );
  }
}
