import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

interface Variation {
  id: number;
  product_id: number;
  colour_name: string;
  colour_hex: string | null;
  main_image_url: string | null;
  gallery_images: string | string[] | null;
  sort_order: number;
}

interface InsertResult {
  insertId: number;
}

// GET all variations for a product
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;

    const products = await query(
      'SELECT id FROM products WHERE slug = ?',
      [slug]
    ) as { id: number }[];

    if (!Array.isArray(products) || products.length === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const productId = products[0].id;
    const variations = await query(
      'SELECT * FROM product_variations WHERE product_id = ? ORDER BY sort_order ASC, id ASC',
      [productId]
    ) as Variation[];

    // Parse gallery_images JSON for each variation
    const parsed = (Array.isArray(variations) ? variations : []).map(v => ({
      ...v,
      gallery_images: v.gallery_images
        ? (typeof v.gallery_images === 'string' ? JSON.parse(v.gallery_images) : v.gallery_images)
        : []
    }));

    return NextResponse.json(parsed);
  } catch (error) {
    console.error('Error fetching variations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch variations', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}


// POST - create or bulk-save variations for a product
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;
    const body = await request.json();
    const { variations } = body as { variations: Variation[] };

    if (!Array.isArray(variations)) {
      return NextResponse.json({ error: 'variations must be an array' }, { status: 400 });
    }

    const products = await query(
      'SELECT id FROM products WHERE slug = ?',
      [slug]
    ) as { id: number }[];

    if (!Array.isArray(products) || products.length === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const productId = products[0].id;

    // Delete existing variations and re-insert (simple bulk save approach)
    await query('DELETE FROM product_variations WHERE product_id = ?', [productId]);

    const insertedIds: number[] = [];
    for (let i = 0; i < variations.length; i++) {
      const v = variations[i];
      const galleryJson = v.gallery_images && Array.isArray(v.gallery_images) && v.gallery_images.length > 0
        ? JSON.stringify(v.gallery_images)
        : null;

      const result = await query(
        `INSERT INTO product_variations (product_id, colour_name, colour_hex, main_image_url, gallery_images, sort_order)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [productId, v.colour_name, v.colour_hex || null, v.main_image_url || null, galleryJson, i]
      ) as InsertResult;

      insertedIds.push(result.insertId);
    }

    return NextResponse.json({ success: true, count: insertedIds.length });
  } catch (error) {
    console.error('Error saving variations:', error);
    return NextResponse.json(
      { error: 'Failed to save variations', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}

// DELETE - remove a specific variation by id (query param ?id=X)
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    await context.params; // consume params
    const url = new URL(request.url);
    const variationId = url.searchParams.get('id');

    if (!variationId) {
      return NextResponse.json({ error: 'Variation id is required' }, { status: 400 });
    }

    await query('DELETE FROM product_variations WHERE id = ?', [variationId]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting variation:', error);
    return NextResponse.json(
      { error: 'Failed to delete variation', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}
