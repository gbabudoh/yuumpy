import { NextResponse } from 'next/server';
import { query } from '@/lib/database';
import fs from 'fs';
import path from 'path';

export async function POST() {
  try {
    const schemaPath = path.join(process.cwd(), 'src', 'lib', 'marketplace-schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf-8');

    // Split by semicolons and execute each statement
    const statements = schemaSql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    const results: string[] = [];

    for (const statement of statements) {
      try {
        await query(statement);
        const firstLine = statement.split('\n').find(l => l.trim().length > 0) || '';
        results.push(`✅ ${firstLine.substring(0, 80)}`);
      } catch (err: unknown) {
        const error = err as { code?: string; message?: string };
        // PostgreSQL codes: 42P07 = duplicate_table, 42701 = duplicate_column, 23505 = unique_violation
        if (['42P07', '42701', '23505'].includes(error.code || '')) {
          const firstLine = statement.split('\n').find(l => l.trim().length > 0) || '';
          results.push(`⏭️ Skipped (already exists): ${firstLine.substring(0, 60)}`);
        } else {
          const firstLine = statement.split('\n').find(l => l.trim().length > 0) || '';
          results.push(`❌ Error on: ${firstLine.substring(0, 60)} — ${error.message}`);
        }
      }
    }

    return NextResponse.json({ success: true, message: 'Marketplace migration completed', results });
  } catch (error: unknown) {
    console.error('Migration error:', error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ message: 'POST to this endpoint to run the marketplace migration' });
}
