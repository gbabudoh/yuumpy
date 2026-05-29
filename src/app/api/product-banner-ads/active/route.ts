import { NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function GET() {
  try {
    const rows = await query(`
      SELECT * FROM product_banner_ads
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
    console.error('Error fetching active product banner ad:', error);
    return NextResponse.json({ error: 'Failed to fetch product banner ad' }, { status: 500 });
  }
}
