import { NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function GET() {
  try {
    // Add missing columns if they don't exist
    try {
      await query(`ALTER TABLE banner_ads ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP`);
      await query(`ALTER TABLE banner_ads ADD COLUMN IF NOT EXISTS duration VARCHAR(20)`);
      await query(`ALTER TABLE banner_ads ADD COLUMN IF NOT EXISTS is_repeating BOOLEAN DEFAULT FALSE`);
    } catch {
      // Columns may already exist
    }

    const rows = await query(`
      SELECT * FROM banner_ads
      WHERE is_active = TRUE
        AND (expires_at IS NULL OR expires_at > NOW())
      ORDER BY created_at DESC
      LIMIT 1
    `);

    const bannerAds = rows as any[];
    if (bannerAds.length === 0) {
      return NextResponse.json(null);
    }

    return NextResponse.json(bannerAds[0]);
  } catch (error) {
    console.error('Error fetching active banner ad:', error);
    return NextResponse.json({ error: 'Failed to fetch banner ad' }, { status: 500 });
  }
}
