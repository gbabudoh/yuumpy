import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

// Get SEO settings for a specific page type
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pageType = searchParams.get('page_type');

    if (!pageType) {
      return NextResponse.json(
        { error: 'Page type is required' },
        { status: 400 }
      );
    }

    const sql = 'SELECT * FROM seo_settings WHERE page_type = ?';
    const result = await query(sql, [pageType]);

    if (!Array.isArray(result) || result.length === 0) {
      return NextResponse.json({
        success: true,
        data: null,
        message: 'SEO settings not found - table may not exist yet'
      });
    }

    return NextResponse.json({
      success: true,
      data: result[0]
    });

  } catch (error) {
    console.error('Error fetching SEO settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch SEO settings' },
      { status: 500 }
    );
  }
}

// Update SEO settings for a specific page type
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      page_type,
      meta_title,
      meta_description,
      meta_keywords,
      og_title,
      og_description,
      og_image,
      twitter_title,
      twitter_description,
      twitter_image,
      no_index,
      no_follow
    } = body;

    if (!page_type) {
      return NextResponse.json(
        { error: 'Page type is required' },
        { status: 400 }
      );
    }

    const sql = `
      INSERT INTO seo_settings (
        page_type, meta_title, meta_description, meta_keywords,
        og_title, og_description, og_image, twitter_title, twitter_description, twitter_image,
        no_index, no_follow
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT (page_type) DO UPDATE SET
        meta_title = EXCLUDED.meta_title,
        meta_description = EXCLUDED.meta_description,
        meta_keywords = EXCLUDED.meta_keywords,
        og_title = EXCLUDED.og_title,
        og_description = EXCLUDED.og_description,
        og_image = EXCLUDED.og_image,
        twitter_title = EXCLUDED.twitter_title,
        twitter_description = EXCLUDED.twitter_description,
        twitter_image = EXCLUDED.twitter_image,
        no_index = EXCLUDED.no_index,
        no_follow = EXCLUDED.no_follow,
        updated_at = CURRENT_TIMESTAMP
    `;

    await query(sql, [
      page_type, meta_title, meta_description, meta_keywords,
      og_title, og_description, og_image, twitter_title, twitter_description, twitter_image,
      no_index || false, no_follow || false
    ]);

    return NextResponse.json({
      success: true,
      message: 'SEO settings updated successfully'
    });

  } catch (error) {
    console.error('Error updating SEO settings:', error);
    return NextResponse.json(
      { error: 'Failed to update SEO settings' },
      { status: 500 }
    );
  }
}

// Get all SEO settings
export async function POST(request: NextRequest) {
  try {
    const sql = 'SELECT * FROM seo_settings ORDER BY page_type';
    const result = await query(sql);

    const isArray = Array.isArray(result);
    const hasData = isArray && result.length > 0;

    return NextResponse.json({
      success: true,
      data: result,
      message: !hasData ? 'No SEO settings found - tables may not exist yet' : 'SEO settings fetched successfully'
    });

  } catch (error) {
    console.error('Error fetching all SEO settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch SEO settings' },
      { status: 500 }
    );
  }
}
