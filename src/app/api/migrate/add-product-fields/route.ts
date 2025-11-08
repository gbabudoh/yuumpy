import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    // Check if columns already exist
    const checkColumns = await query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'products' 
      AND COLUMN_NAME IN ('long_description', 'product_review')
    `) as any[];

    const existingColumns = checkColumns.map(col => col.COLUMN_NAME);
    
    // Add long_description if it doesn't exist
    if (!existingColumns.includes('long_description')) {
      await query(`
        ALTER TABLE products 
        ADD COLUMN long_description TEXT AFTER short_description
      `);
      console.log('Added long_description column');
    }

    // Add product_review if it doesn't exist
    if (!existingColumns.includes('product_review')) {
      await query(`
        ALTER TABLE products 
        ADD COLUMN product_review TEXT AFTER long_description
      `);
      console.log('Added product_review column');
    }

    return NextResponse.json({
      success: true,
      message: 'Migration completed successfully',
      columnsAdded: {
        long_description: !existingColumns.includes('long_description'),
        product_review: !existingColumns.includes('product_review')
      }
    });

  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Migration failed',
        details: error.message
      },
      { status: 500 }
    );
  }
}
