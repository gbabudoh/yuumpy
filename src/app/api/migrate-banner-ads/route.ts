import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    // Check if banner ad columns exist
    const columns = await query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'products' 
      AND COLUMN_NAME IN ('banner_ad_title', 'banner_ad_description', 'banner_ad_image_url', 'banner_ad_link_url', 'banner_ad_duration', 'banner_ad_is_repeating', 'banner_ad_start_date', 'banner_ad_end_date', 'banner_ad_is_active')
    `);

    const existingColumns = (columns as any[]).map(col => col.COLUMN_NAME);
    const requiredColumns = [
      'banner_ad_title',
      'banner_ad_description', 
      'banner_ad_image_url',
      'banner_ad_link_url',
      'banner_ad_duration',
      'banner_ad_is_repeating',
      'banner_ad_start_date',
      'banner_ad_end_date',
      'banner_ad_is_active'
    ];

    const missingColumns = requiredColumns.filter(col => !existingColumns.includes(col));

    if (missingColumns.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'All banner ad columns already exist'
      });
    }

    // Add missing columns
    const alterStatements = [];
    
    if (missingColumns.includes('banner_ad_title')) {
      alterStatements.push('ADD COLUMN banner_ad_title VARCHAR(255)');
    }
    if (missingColumns.includes('banner_ad_description')) {
      alterStatements.push('ADD COLUMN banner_ad_description TEXT');
    }
    if (missingColumns.includes('banner_ad_image_url')) {
      alterStatements.push('ADD COLUMN banner_ad_image_url VARCHAR(1000)');
    }
    if (missingColumns.includes('banner_ad_link_url')) {
      alterStatements.push('ADD COLUMN banner_ad_link_url VARCHAR(1000)');
    }
    if (missingColumns.includes('banner_ad_duration')) {
      alterStatements.push("ADD COLUMN banner_ad_duration ENUM('1_week', '2_weeks', '3_weeks', '4_weeks', '6_months') DEFAULT '1_week'");
    }
    if (missingColumns.includes('banner_ad_is_repeating')) {
      alterStatements.push('ADD COLUMN banner_ad_is_repeating BOOLEAN DEFAULT FALSE');
    }
    if (missingColumns.includes('banner_ad_start_date')) {
      alterStatements.push('ADD COLUMN banner_ad_start_date DATETIME');
    }
    if (missingColumns.includes('banner_ad_end_date')) {
      alterStatements.push('ADD COLUMN banner_ad_end_date DATETIME');
    }
    if (missingColumns.includes('banner_ad_is_active')) {
      alterStatements.push('ADD COLUMN banner_ad_is_active BOOLEAN DEFAULT FALSE');
    }

    if (alterStatements.length > 0) {
      const alterSql = `ALTER TABLE products ${alterStatements.join(', ')}`;
      await query(alterSql);
    }

    return NextResponse.json({
      success: true,
      message: `Added ${missingColumns.length} banner ad columns to products table`,
      addedColumns: missingColumns
    });

  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json(
      { error: 'Failed to migrate products table', details: error.message },
      { status: 500 }
    );
  }
}
