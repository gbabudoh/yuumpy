import { NextResponse } from 'next/server';
import { getConnection } from '@/lib/database';
import fs from 'fs';
import path from 'path';

export async function POST() {
  let connection;
  try {
    connection = await getConnection();

    // Read the marketplace schema SQL file
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
        await connection.execute(statement);
        // Extract a short description from the statement
        const firstLine = statement.split('\n').find(l => l.trim().length > 0) || '';
        results.push(`✅ ${firstLine.substring(0, 80)}`);
      } catch (err: unknown) {
        const error = err as { code?: string; message?: string };
        // Skip "already exists" errors gracefully
        if (error.code === 'ER_TABLE_EXISTS_ERROR' || error.code === 'ER_DUP_FIELDNAME' || error.code === 'ER_DUP_ENTRY') {
          const firstLine = statement.split('\n').find(l => l.trim().length > 0) || '';
          results.push(`⏭️ Skipped (already exists): ${firstLine.substring(0, 60)}`);
        } else {
          const firstLine = statement.split('\n').find(l => l.trim().length > 0) || '';
          results.push(`❌ Error on: ${firstLine.substring(0, 60)} — ${error.message}`);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Marketplace migration completed',
      results
    });
  } catch (error: unknown) {
    console.error('Migration error:', error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'POST to this endpoint to run the marketplace migration'
  });
}
