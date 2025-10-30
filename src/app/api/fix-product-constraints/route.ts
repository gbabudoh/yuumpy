import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    const messages = [];

    // First, check what foreign key constraints exist
    const existingConstraints = await query(`
      SELECT 
        CONSTRAINT_NAME,
        COLUMN_NAME,
        REFERENCED_TABLE_NAME,
        REFERENCED_COLUMN_NAME
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'products' 
      AND REFERENCED_TABLE_NAME IS NOT NULL
    `);

    console.log('Existing constraints:', existingConstraints);
    messages.push(`Found ${(existingConstraints as any[]).length} existing foreign key constraints`);

    // Drop problematic foreign key constraints
    for (const constraint of existingConstraints as any[]) {
      if (constraint.COLUMN_NAME === 'subcategory_id' && constraint.REFERENCED_TABLE_NAME === 'subcategories') {
        try {
          await query(`ALTER TABLE products DROP FOREIGN KEY ${constraint.CONSTRAINT_NAME}`);
          messages.push(`Dropped problematic constraint: ${constraint.CONSTRAINT_NAME}`);
        } catch (dropError) {
          console.log(`Could not drop constraint ${constraint.CONSTRAINT_NAME}:`, dropError.message);
          messages.push(`Warning: Could not drop constraint ${constraint.CONSTRAINT_NAME}`);
        }
      }
    }

    // Check if categories table exists
    const categoriesTable = await query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'categories'
    `);

    if ((categoriesTable as any[]).length === 0) {
      messages.push('Categories table does not exist - creating it');
      await query(`
        CREATE TABLE categories (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          slug VARCHAR(255) NOT NULL UNIQUE,
          parent_id INT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL
        )
      `);
    }

    // Add correct foreign key constraints
    try {
      // Check if correct subcategory constraint exists
      const correctSubcategoryConstraint = await query(`
        SELECT CONSTRAINT_NAME 
        FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'products' 
        AND COLUMN_NAME = 'subcategory_id'
        AND REFERENCED_TABLE_NAME = 'categories'
      `);

      if ((correctSubcategoryConstraint as any[]).length === 0) {
        await query(`
          ALTER TABLE products 
          ADD CONSTRAINT fk_products_subcategory 
          FOREIGN KEY (subcategory_id) REFERENCES categories(id) ON DELETE SET NULL
        `);
        messages.push('Added correct foreign key constraint for subcategory_id -> categories(id)');
      } else {
        messages.push('Correct subcategory foreign key constraint already exists');
      }

      // Check category_id constraint
      const categoryConstraint = await query(`
        SELECT CONSTRAINT_NAME 
        FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'products' 
        AND COLUMN_NAME = 'category_id'
        AND REFERENCED_TABLE_NAME = 'categories'
      `);

      if ((categoryConstraint as any[]).length === 0) {
        await query(`
          ALTER TABLE products 
          ADD CONSTRAINT fk_products_category 
          FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
        `);
        messages.push('Added foreign key constraint for category_id -> categories(id)');
      } else {
        messages.push('Category foreign key constraint already exists');
      }

    } catch (constraintError) {
      console.error('Error adding constraints:', constraintError);
      messages.push(`Warning: Could not add some constraints: ${constraintError.message}`);
    }

    // Verify final state
    const finalConstraints = await query(`
      SELECT 
        CONSTRAINT_NAME,
        COLUMN_NAME,
        REFERENCED_TABLE_NAME,
        REFERENCED_COLUMN_NAME
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'products' 
      AND REFERENCED_TABLE_NAME IS NOT NULL
    `);

    messages.push(`Final state: ${(finalConstraints as any[]).length} foreign key constraints`);

    return NextResponse.json({
      success: true,
      messages: messages,
      finalConstraints: finalConstraints
    });

  } catch (error) {
    console.error('Constraint fix error:', error);
    return NextResponse.json(
      { error: 'Failed to fix product constraints', details: error.message },
      { status: 500 }
    );
  }
}