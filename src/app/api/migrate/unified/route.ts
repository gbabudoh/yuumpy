import { NextResponse } from 'next/server';
import { query } from '@/lib/database';
import fs from 'fs';
import path from 'path';

export async function POST() {
  try {
    const schemas = ['direct-checkout-schema.sql', 'marketplace-schema.sql'];
    const results: string[] = [];

    for (const schemaFile of schemas) {
      const schemaPath = path.join(process.cwd(), 'src', 'lib', schemaFile);
      if (!fs.existsSync(schemaPath)) {
        results.push(`❌ Schema file not found: ${schemaFile}`);
        continue;
      }

      const schemaSql = fs.readFileSync(schemaPath, 'utf-8');
      
      // Split by semicolons and execute each statement
      const statements = schemaSql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'));

      for (const statement of statements) {
        try {
          await query(statement, []);
          const firstLine = statement.split('\n').find(l => l.trim().length > 0) || '';
          results.push(`✅ [${schemaFile}] ${firstLine.substring(0, 60)}...`);
        } catch (err: unknown) {
          const firstLine = statement.split('\n').find(l => l.trim().length > 0) || '';
          const mysqlError = err as { code?: string; message?: string };
          // Skip common "already exists" errors
          if (mysqlError.code === 'ER_TABLE_EXISTS_ERROR' || mysqlError.code === 'ER_DUP_FIELDNAME' || mysqlError.code === 'ER_CANT_DROP_FIELD_OR_KEY') {
            results.push(`⏭️ [${schemaFile}] Already exists: ${firstLine.substring(0, 40)}...`);
          } else {
            results.push(`❌ [${schemaFile}] Error on: ${firstLine.substring(0, 40)}... - ${mysqlError.message}`);
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Unified migration completed',
      results
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Migration error:', err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
