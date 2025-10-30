import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q');
    
    if (!q || q.trim().length < 2) {
      return NextResponse.json({ suggestions: [] });
    }

    const searchTerm = q.trim();
    const searchWords = searchTerm.split(/\s+/).filter(word => word.length > 0);
    
    // Get product suggestions with enhanced search
    const productSuggestions = await query(`
      SELECT DISTINCT p.name, p.slug, 'product' as type, p.price, p.image_url
      FROM products p
      WHERE p.is_active = 1 
        AND (
          p.name LIKE ? OR 
          p.name LIKE ? OR
          p.short_description LIKE ? OR
          p.description LIKE ?
        )
      ORDER BY 
        CASE WHEN p.name = ? THEN 1 
             WHEN p.name LIKE ? THEN 2 
             ELSE 3 END,
        p.is_featured DESC,
        p.created_at DESC
      LIMIT 8
    `, [
      `%${searchTerm}%`, 
      `${searchTerm}%`, 
      `%${searchTerm}%`, 
      `%${searchTerm}%`,
      searchTerm,
      `${searchTerm}%`
    ]);

    // Get category suggestions (reduced limit to prioritize products)
    const categorySuggestions = await query(`
      SELECT DISTINCT c.name, c.slug, 'category' as type
      FROM categories c
      WHERE c.is_active = 1 
        AND (
          c.name LIKE ? OR 
          c.name LIKE ?
        )
      ORDER BY 
        CASE WHEN c.name = ? THEN 1 ELSE 2 END,
        c.name
      LIMIT 2
    `, [`%${searchTerm}%`, `${searchTerm}%`, searchTerm]);

    // Get brand suggestions (reduced limit to prioritize products)
    const brandSuggestions = await query(`
      SELECT DISTINCT b.name, b.slug, 'brand' as type
      FROM brands b
      WHERE b.is_active = 1 
        AND (
          b.name LIKE ? OR 
          b.name LIKE ?
        )
      ORDER BY 
        CASE WHEN b.name = ? THEN 1 ELSE 2 END,
        b.name
      LIMIT 2
    `, [`%${searchTerm}%`, `${searchTerm}%`, searchTerm]);

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
