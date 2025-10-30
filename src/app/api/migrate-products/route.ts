import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    const messages = [];

    // Check if brand_id column exists
    const brandColumns = await query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'products' 
      AND COLUMN_NAME = 'brand_id'
    `);

    if ((brandColumns as any[]).length === 0) {
      // Add brand_id column if it doesn't exist
      await query(`
        ALTER TABLE products 
        ADD COLUMN brand_id INT NULL,
        ADD FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE SET NULL
      `);
      messages.push('Added brand_id column to products table');
    } else {
      messages.push('brand_id column already exists');
    }

    // Check if subcategory_id column exists
    const subcategoryColumns = await query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'products' 
      AND COLUMN_NAME = 'subcategory_id'
    `);

    if ((subcategoryColumns as any[]).length === 0) {
      // Add subcategory_id column if it doesn't exist
      await query(`
        ALTER TABLE products 
        ADD COLUMN subcategory_id INT NULL
      `);
      messages.push('Added subcategory_id column to products table');
    } else {
      messages.push('subcategory_id column already exists');
    }

    // Check and fix foreign key constraints
    try {
      // Drop existing foreign key constraint if it exists and references wrong table
      const foreignKeys = await query(`
        SELECT CONSTRAINT_NAME 
        FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'products' 
        AND COLUMN_NAME = 'subcategory_id'
        AND REFERENCED_TABLE_NAME = 'subcategories'
      `);

      if ((foreignKeys as any[]).length > 0) {
        const constraintName = (foreignKeys as any[])[0].CONSTRAINT_NAME;
        await query(`ALTER TABLE products DROP FOREIGN KEY ${constraintName}`);
        messages.push('Dropped incorrect foreign key constraint for subcategory_id');
      }

      // Add correct foreign key constraint (subcategory_id should reference categories table)
      const correctForeignKeys = await query(`
        SELECT CONSTRAINT_NAME 
        FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'products' 
        AND COLUMN_NAME = 'subcategory_id'
        AND REFERENCED_TABLE_NAME = 'categories'
      `);

      if ((correctForeignKeys as any[]).length === 0) {
        await query(`
          ALTER TABLE products 
          ADD CONSTRAINT fk_products_subcategory 
          FOREIGN KEY (subcategory_id) REFERENCES categories(id) ON DELETE SET NULL
        `);
        messages.push('Added correct foreign key constraint for subcategory_id');
      }
    } catch (fkError) {
      console.log('Foreign key constraint handling:', fkError.message);
      messages.push('Foreign key constraint handling completed with warnings');
    }

    // Check if affiliate_partner_name column exists
    const affiliateColumns = await query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'products' 
      AND COLUMN_NAME = 'affiliate_partner_name'
    `);

    if ((affiliateColumns as any[]).length === 0) {
      // Add affiliate_partner_name column if it doesn't exist
      await query(`
        ALTER TABLE products 
        ADD COLUMN affiliate_partner_name VARCHAR(255) NULL,
        ADD COLUMN external_purchase_info TEXT NULL
      `);
      messages.push('Added affiliate_partner_name and external_purchase_info columns to products table');
    } else {
      messages.push('affiliate_partner_name column already exists');
    }

    // Check if banner ad columns exist
    const bannerAdColumns = await query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'products' 
      AND COLUMN_NAME = 'banner_ad_title'
    `);

    if ((bannerAdColumns as any[]).length === 0) {
      // Add banner ad columns if they don't exist
      await query(`
        ALTER TABLE products 
        ADD COLUMN banner_ad_title VARCHAR(255) NULL,
        ADD COLUMN banner_ad_description TEXT NULL,
        ADD COLUMN banner_ad_image_url TEXT NULL,
        ADD COLUMN banner_ad_link_url TEXT NULL,
        ADD COLUMN banner_ad_duration ENUM('1_week', '2_weeks', '3_weeks', '4_weeks', '6_months') DEFAULT '1_week',
        ADD COLUMN banner_ad_is_repeating BOOLEAN DEFAULT FALSE,
        ADD COLUMN banner_ad_start_date DATETIME NULL,
        ADD COLUMN banner_ad_end_date DATETIME NULL,
        ADD COLUMN banner_ad_is_active BOOLEAN DEFAULT FALSE
      `);
      messages.push('Added banner ad columns to products table');
    } else {
      messages.push('banner ad columns already exist');
    }

    return NextResponse.json({
      success: true,
      messages: messages
    });

  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json(
      { error: 'Failed to migrate products table', details: error.message },
      { status: 500 }
    );
  }
}