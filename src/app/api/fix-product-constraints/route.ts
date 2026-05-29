import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    const messages = [];

    // In PostgreSQL, query referential constraints via information_schema
    const existingConstraints = await query(`
      SELECT
        tc.constraint_name,
        kcu.column_name,
        ccu.table_name AS referenced_table_name,
        ccu.column_name AS referenced_column_name
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage ccu
        ON tc.constraint_name = ccu.constraint_name AND tc.table_schema = ccu.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_schema = current_schema()
        AND tc.table_name = 'products'
    `);

    console.log('Existing constraints:', existingConstraints);
    messages.push(`Found ${(existingConstraints as any[]).length} existing foreign key constraints`);

    // Drop constraints referencing a non-existent subcategories table
    for (const constraint of existingConstraints as any[]) {
      if (constraint.column_name === 'subcategory_id' && constraint.referenced_table_name === 'subcategories') {
        try {
          await query(`ALTER TABLE products DROP CONSTRAINT ${constraint.constraint_name}`);
          messages.push(`Dropped problematic constraint: ${constraint.constraint_name}`);
        } catch (dropError: any) {
          messages.push(`Warning: Could not drop constraint ${constraint.constraint_name}: ${dropError.message}`);
        }
      }
    }

    // Ensure categories table exists
    const categoriesTable = await query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = current_schema()
        AND table_name = 'categories'
    `);

    if ((categoriesTable as any[]).length === 0) {
      messages.push('Categories table does not exist - creating it');
      await query(`
        CREATE TABLE categories (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          slug VARCHAR(255) NOT NULL UNIQUE,
          parent_id INT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL
        )
      `);
    }

    // Re-query constraints after drops
    const postDropConstraints = await query(`
      SELECT kcu.column_name, ccu.table_name AS referenced_table_name
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage ccu
        ON tc.constraint_name = ccu.constraint_name AND tc.table_schema = ccu.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_schema = current_schema()
        AND tc.table_name = 'products'
    `) as any[];

    const hasSubcategoryConstraint = postDropConstraints.some(
      (c: any) => c.column_name === 'subcategory_id' && c.referenced_table_name === 'categories'
    );

    if (!hasSubcategoryConstraint) {
      try {
        await query(`
          ALTER TABLE products
          ADD CONSTRAINT fk_products_subcategory
          FOREIGN KEY (subcategory_id) REFERENCES categories(id) ON DELETE SET NULL
        `);
        messages.push('Added correct foreign key constraint for subcategory_id -> categories(id)');
      } catch (err: any) {
        messages.push(`Could not add subcategory constraint: ${err.message}`);
      }
    } else {
      messages.push('Correct subcategory foreign key constraint already exists');
    }

    const hasCategoryConstraint = postDropConstraints.some(
      (c: any) => c.column_name === 'category_id' && c.referenced_table_name === 'categories'
    );

    if (!hasCategoryConstraint) {
      try {
        await query(`
          ALTER TABLE products
          ADD CONSTRAINT fk_products_category
          FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
        `);
        messages.push('Added foreign key constraint for category_id -> categories(id)');
      } catch (err: any) {
        messages.push(`Could not add category constraint: ${err.message}`);
      }
    } else {
      messages.push('Category foreign key constraint already exists');
    }

    const finalConstraints = await query(`
      SELECT tc.constraint_name, kcu.column_name, ccu.table_name AS referenced_table_name, ccu.column_name AS referenced_column_name
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage ccu
        ON tc.constraint_name = ccu.constraint_name AND tc.table_schema = ccu.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_schema = current_schema()
        AND tc.table_name = 'products'
    `);

    messages.push(`Final state: ${(finalConstraints as any[]).length} foreign key constraints`);

    return NextResponse.json({ success: true, messages, finalConstraints });
  } catch (error: any) {
    console.error('Constraint fix error:', error);
    return NextResponse.json(
      { error: 'Failed to fix product constraints', details: error.message },
      { status: 500 }
    );
  }
}
