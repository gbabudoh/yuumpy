import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    console.log('Running database migration for icon_url column...');

    // Check current column structure
    const checkColumnSql = `
      SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'categories' 
      AND COLUMN_NAME = 'icon_url'
    `;

    const columnInfo = await query(checkColumnSql) as any[];
    
    if (columnInfo.length === 0) {
      return NextResponse.json(
        { error: 'Column icon_url not found in categories table' },
        { status: 404 }
      );
    }

    const currentColumn = columnInfo[0];
    console.log('Current column info:', currentColumn);

    // Check if migration is needed
    if (currentColumn.DATA_TYPE === 'text' || currentColumn.CHARACTER_MAXIMUM_LENGTH > 10000) {
      return NextResponse.json({
        success: true,
        message: 'Migration not needed - column already supports large data',
        currentType: currentColumn.DATA_TYPE,
        currentLength: currentColumn.CHARACTER_MAXIMUM_LENGTH
      });
    }

    // Run the migration with proper character set handling
    const migrationSql = 'ALTER TABLE categories MODIFY COLUMN icon_url TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci';
    await query(migrationSql);

    // Verify the migration
    const verifyColumnInfo = await query(checkColumnSql) as any[];
    const newColumn = verifyColumnInfo[0];

    console.log('Migration completed. New column info:', newColumn);

    return NextResponse.json({
      success: true,
      message: 'Database migration completed successfully',
      before: {
        type: currentColumn.DATA_TYPE,
        length: currentColumn.CHARACTER_MAXIMUM_LENGTH
      },
      after: {
        type: newColumn.DATA_TYPE,
        length: newColumn.CHARACTER_MAXIMUM_LENGTH
      }
    });

  } catch (error: any) {
    console.error('Database migration error:', error);
    
    return NextResponse.json(
      { 
        error: 'Database migration failed', 
        details: error.message,
        sqlState: error.sqlState,
        errno: error.errno
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check current column structure
    const checkColumnSql = `
      SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'categories' 
      AND COLUMN_NAME = 'icon_url'
    `;

    const columnInfo = await query(checkColumnSql) as any[];
    
    if (columnInfo.length === 0) {
      return NextResponse.json(
        { error: 'Column icon_url not found in categories table' },
        { status: 404 }
      );
    }

    const currentColumn = columnInfo[0];
    const needsMigration = currentColumn.DATA_TYPE !== 'text' && 
                          (currentColumn.CHARACTER_MAXIMUM_LENGTH || 0) <= 1000;

    return NextResponse.json({
      currentType: currentColumn.DATA_TYPE,
      currentLength: currentColumn.CHARACTER_MAXIMUM_LENGTH,
      needsMigration,
      recommendedAction: needsMigration 
        ? 'Run POST /api/admin/migrate-database to upgrade column'
        : 'No migration needed'
    });

  } catch (error: any) {
    console.error('Error checking database schema:', error);
    
    return NextResponse.json(
      { error: 'Failed to check database schema', details: error.message },
      { status: 500 }
    );
  }
}