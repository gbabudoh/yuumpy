import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q');

    if (!q || q.trim().length < 2) {
      return NextResponse.json({ suggestions: [] });
    }

    const term = `%${q.trim()}%`;
    const exactTerm = q.trim();

    // Products — ILIKE for case-insensitive matching; wrap in subquery to allow ORDER BY on non-SELECT cols
    const productSuggestions = await query(`
      SELECT name, slug, price, image_url, product_condition, category_name
      FROM (
        SELECT DISTINCT ON (p.id) p.name, p.slug, p.price, p.image_url, p.product_condition,
               c.name as category_name, p.is_featured, p.is_bestseller, p.created_at,
               CASE WHEN p.name ILIKE ? THEN 1 WHEN p.name ILIKE ? THEN 2 ELSE 3 END as relevance
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        LEFT JOIN brands b ON p.brand_id = b.id
        WHERE p.is_active = TRUE
          AND (
            p.name ILIKE ? OR
            p.short_description ILIKE ? OR
            p.description ILIKE ? OR
            p.long_description ILIKE ? OR
            c.name ILIKE ? OR
            b.name ILIKE ? OR
            p.product_condition ILIKE ?
          )
      ) sub
      ORDER BY relevance ASC, is_featured DESC, is_bestseller DESC, created_at DESC
      LIMIT 6
    `, [exactTerm, term, term, term, term, term, term, term, term]);

    // Categories
    const categorySuggestions = await query(`
      SELECT name, slug FROM (
        SELECT DISTINCT ON (c.id) c.name, c.slug,
               CASE WHEN c.name ILIKE ? THEN 1 ELSE 2 END as relevance
        FROM categories c
        WHERE c.is_active = TRUE
          AND (c.name ILIKE ? OR c.description ILIKE ?)
      ) sub
      ORDER BY relevance ASC, name ASC
      LIMIT 3
    `, [term, term, term]);

    const suggestions = [
      ...(productSuggestions as any[]).map(item => ({
        text: item.name,
        slug: item.slug,
        type: 'product',
        url: `/products/${item.slug}`,
        price: item.price ? Number(item.price) : null,
        image: item.image_url || null,
        category: item.category_name || null,
      })),
      ...(categorySuggestions as any[]).map(item => ({
        text: item.name,
        slug: item.slug,
        type: 'category',
        url: `/products?category=${item.slug}`,
        price: null,
        image: null,
        category: null,
      })),
    ];

    return NextResponse.json({ suggestions: suggestions.slice(0, 8) });
  } catch (error) {
    console.error('Error fetching search suggestions:', error);
    return NextResponse.json({ error: 'Failed to fetch suggestions' }, { status: 500 });
  }
}

