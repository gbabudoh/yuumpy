import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const position = searchParams.get('position');
    const active = searchParams.get('active');

    let sql = 'SELECT * FROM banner_ads WHERE 1=1';
    const params: any[] = [];

    if (position) {
      sql += ' AND position = ?';
      params.push(position);
    }

    if (active === 'true') {
      sql += ' AND is_active = TRUE';
    }

    sql += ' ORDER BY created_at DESC';

    console.log('🔍 Banner Ads Query:', sql);
    console.log('🔍 Banner Ads Params:', params);

    const bannerAds = await query(sql, params);
    
    console.log('🔍 Banner Ads Result:', bannerAds);

    return NextResponse.json(bannerAds);
  } catch (error) {
    console.error('Error fetching banner ads:', error);
    return NextResponse.json(
      { error: 'Failed to fetch banner ads' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      description,
      image_url,
      link_url,
      position,
      is_active,
      start_date,
      end_date,
      expires_at,
      duration,
      is_repeating,
      tag,
      cta_text,
      product_label,
      rating
    } = body;

    // First, check if the banner_ads table has the new columns, if not add them
    try {
      await query(`ALTER TABLE banner_ads ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP`);
      await query(`ALTER TABLE banner_ads ADD COLUMN IF NOT EXISTS duration VARCHAR(20)`);
      await query(`ALTER TABLE banner_ads ADD COLUMN IF NOT EXISTS is_repeating BOOLEAN DEFAULT FALSE`);
      await query(`ALTER TABLE banner_ads ADD COLUMN IF NOT EXISTS tag VARCHAR(100)`);
      await query(`ALTER TABLE banner_ads ADD COLUMN IF NOT EXISTS cta_text VARCHAR(100)`);
      await query(`ALTER TABLE banner_ads ADD COLUMN IF NOT EXISTS product_label VARCHAR(200)`);
      await query(`ALTER TABLE banner_ads ADD COLUMN IF NOT EXISTS rating INTEGER DEFAULT 5`);
    } catch (alterError) {
      console.log('Columns might already exist:', alterError.message);
    }

    const sql = `
      INSERT INTO banner_ads (
        title, description, image_url, link_url, position, is_active,
        start_date, end_date, tag, cta_text, product_label, rating
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const result = await query(sql, [
      title, description, image_url, link_url, position, is_active,
      start_date, end_date, tag || null, cta_text || null, product_label || null, rating ?? 5
    ]);

    console.log('🔍 Create result:', result);

    // Return the created banner ad with the new ID
    const newBannerAd = {
      id: (result as any).insertId,
      title,
      description,
      image_url,
      link_url,
      position,
      is_active,
      start_date,
      end_date,
      tag: tag || null,
      cta_text: cta_text || null,
      product_label: product_label || null,
      rating: rating ?? 5,
      created_at: new Date().toISOString()
    };

    console.log('🔍 Returning new banner ad:', newBannerAd);
    return NextResponse.json(newBannerAd);
  } catch (error) {
    console.error('Error creating banner ad:', error);
    return NextResponse.json(
      { error: 'Failed to create banner ad', details: error.message },
      { status: 500 }
    );
  }
}
