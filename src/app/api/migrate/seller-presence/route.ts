import { NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function POST() {
  try {
    // Add is_online column
    try {
      await query('ALTER TABLE sellers ADD COLUMN is_online BOOLEAN DEFAULT FALSE');
    } catch {
      // Column may already exist
    }

    // Add last_seen_at column
    try {
      await query('ALTER TABLE sellers ADD COLUMN last_seen_at TIMESTAMP NULL');
    } catch {
      // Column may already exist
    }

    // Add index
    try {
      await query('CREATE INDEX idx_sellers_online ON sellers(is_online)');
    } catch {
      // Index may already exist
    }

    return NextResponse.json({ success: true, message: 'Seller presence migration complete' });
  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json({ error: 'Migration failed' }, { status: 500 });
  }
}
