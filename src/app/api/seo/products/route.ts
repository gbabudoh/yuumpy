import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

// Get SEO data for a specific product
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('product_id');

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    const sql = 'SELECT * FROM product_seo WHERE product_id = ?';
    const result = await query(sql, [productId]);

    const isArray = Array.isArray(result);
    const hasData = isArray && result.length > 0;

    return NextResponse.json({
      success: true,
      data: hasData ? result[0] : null,
      message: !hasData ? 'No SEO data found for this product' : 'Product SEO data fetched successfully'
    });

  } catch (error) {
    console.error('Error fetching product SEO:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product SEO' },
      { status: 500 }
    );
  }
}

// Update SEO data for a specific product
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      product_id,
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

    if (!product_id) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    const sql = `
      INSERT INTO product_seo (
        product_id, meta_title, meta_description, meta_keywords,
        og_title, og_description, og_image, twitter_title, twitter_description, twitter_image,
        no_index, no_follow
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        meta_title = VALUES(meta_title),
        meta_description = VALUES(meta_description),
        meta_keywords = VALUES(meta_keywords),
        og_title = VALUES(og_title),
        og_description = VALUES(og_description),
        og_image = VALUES(og_image),
        twitter_title = VALUES(twitter_title),
        twitter_description = VALUES(twitter_description),
        twitter_image = VALUES(twitter_image),
        no_index = VALUES(no_index),
        no_follow = VALUES(no_follow),
        updated_at = CURRENT_TIMESTAMP
    `;

    await query(sql, [
      product_id, meta_title, meta_description, meta_keywords,
      og_title, og_description, og_image, twitter_title, twitter_description, twitter_image,
      no_index || false, no_follow || false
    ]);

    return NextResponse.json({
      success: true,
      message: 'Product SEO updated successfully'
    });

  } catch (error) {
    console.error('Error updating product SEO:', error);
    return NextResponse.json(
      { error: 'Failed to update product SEO' },
      { status: 500 }
    );
  }
}
