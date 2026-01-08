import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    const checkColumns = await query(`
      SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'customers' 
      AND COLUMN_NAME IN ('reset_token', 'reset_token_expiry')
    `) as any[];

    const existingColumns = checkColumns.map(col => col.COLUMN_NAME);
    const messages: string[] = [];

    if (!existingColumns.includes('reset_token')) {
      await query('ALTER TABLE customers ADD COLUMN reset_token VARCHAR(255) NULL AFTER password_hash');
      messages.push('Added reset_token column');
    }

    if (!existingColumns.includes('reset_token_expiry')) {
      await query('ALTER TABLE customers ADD COLUMN reset_token_expiry DATETIME NULL AFTER reset_token');
      messages.push('Added reset_token_expiry column');
    }

    if (messages.length === 0) messages.push('Columns already exist');

    return NextResponse.json({ success: true, messages });
  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json({ success: false, error: 'Migration failed' }, { status: 500 });
  }
}
