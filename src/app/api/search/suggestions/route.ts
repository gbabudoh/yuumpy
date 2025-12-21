import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q');
    
    if (!q || q.trim().length < 2) {
      return NextResponse.json({ suggestions: [] });
    }

    const searchTerm = q.trim().toLowerCase();
    const searchWords = searchTerm.split(/\s+/).filter(word => word.length > 0);
    
    // Get product suggestions with comprehensive search across all fields
    const productSuggestions = await query(`
      SELECT DISTINCT p.name, p.slug, 'product' as type, p.price, p.image_url, p.category_id,
             c.name as category_name, b.name as brand_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN brands b ON p.brand_id = b.id
      WHERE p.is_active = 1 
        AND (
          LOWER(p.name) LIKE ? OR 
          LOWER(p.short_description) LIKE ? OR
          LOWER(p.description) LIKE ? OR
          LOWER(p.long_description) LIKE ? OR
          LOWER(p.product_review) LIKE ? OR
          LOWER(c.name) LIKE ? OR
          LOWER(b.name) LIKE ? OR
          LOWER(p.slug) LIKE ? OR
          LOWER(p.product_condition) LIKE ?
        )
      ORDER BY 
        CASE 
          WHEN LOWER(p.name) = ? THEN 1 
          WHEN LOWER(p.name) LIKE ? THEN 2 
          WHEN LOWER(p.short_description) LIKE ? THEN 3
          WHEN LOWER(p.product_condition) LIKE ? THEN 4
          ELSE 5 
        END,
        p.is_featured DESC,
        p.is_bestseller DESC,
        p.created_at DESC
      LIMIT 8
    `, [
      `%${searchTerm}%`, 
      `%${searchTerm}%`, 
      `%${searchTerm}%`, 
      `%${searchTerm}%`,
      `%${searchTerm}%`,
      `%${searchTerm}%`,
      `%${searchTerm}%`,
      `%${searchTerm}%`,
      `%${searchTerm}%`,
      searchTerm,
      `${searchTerm}%`,
      `%${searchTerm}%`,
      `%${searchTerm}%`
    ]);

    // Get category suggestions with case-insensitive search
    const categorySuggestions = await query(`
      SELECT DISTINCT c.name, c.slug, 'category' as type
      FROM categories c
      WHERE c.is_active = 1 
        AND (
          LOWER(c.name) LIKE ? OR 
          LOWER(c.description) LIKE ?
        )
      ORDER BY 
        CASE 
          WHEN LOWER(c.name) = ? THEN 1 
          WHEN LOWER(c.name) LIKE ? THEN 2
          ELSE 3 
        END,
        c.name
      LIMIT 3
    `, [`%${searchTerm}%`, `%${searchTerm}%`, searchTerm, `${searchTerm}%`]);

    // Get brand suggestions with case-insensitive search
    const brandSuggestions = await query(`
      SELECT DISTINCT b.name, b.slug, 'brand' as type
      FROM brands b
      WHERE b.is_active = 1 
        AND (
          LOWER(b.name) LIKE ? OR 
          LOWER(b.description) LIKE ?
        )
      ORDER BY 
        CASE 
          WHEN LOWER(b.name) = ? THEN 1 
          WHEN LOWER(b.name) LIKE ? THEN 2
          ELSE 3 
        END,
        b.name
      LIMIT 3
    `, [`%${searchTerm}%`, `%${searchTerm}%`, searchTerm, `${searchTerm}%`]);

    // Combine and format suggestions (products first)
    const suggestions = [
      ...(productSuggestions as any[]).map(item => ({
        text: item.name,
        slug: item.slug,
        type: item.type,
        url: `/products/${item.slug}`,
        price: item.price,
        image: item.image_url
      })),
      ...(categorySuggestions as any[]).map(item => ({
        text: item.name,
        slug: item.slug,
        type: item.type,
        url: `/categories/${item.slug}`
      })),
      ...(brandSuggestions as any[]).map(item => ({
        text: item.name,
        slug: item.slug,
        type: item.type,
        url: `/products?brand=${item.slug}`
      }))
    ];

    // Remove duplicates and limit total results (prioritize products)
    const uniqueSuggestions = suggestions
      .filter((item, index, self) => 
        index === self.findIndex(t => t.text === item.text)
      )
      .slice(0, 10); // Increased limit to show more products

    return NextResponse.json({ suggestions: uniqueSuggestions });
  } catch (error) {
    console.error('Error fetching search suggestions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch search suggestions' },
      { status: 500 }
    );
  }
}
