import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categories = searchParams.getAll('category');
    const subcategories = searchParams.getAll('subcategory');
    const brands = searchParams.getAll('brand');
    const featured = searchParams.get('featured');
    const bestseller = searchParams.get('bestseller');
    const search = searchParams.get('search');
    const minPrice = searchParams.get('min_price');
    const maxPrice = searchParams.get('max_price');
    const sort = searchParams.get('sort') || 'newest';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const offset = (page - 1) * limit;
    const admin = searchParams.get('admin') === 'true';

    console.log('Products API - Categories:', categories);
    console.log('Products API - Subcategories:', subcategories);

    let sql = `
      SELECT p.id, p.name, p.slug, p.description, p.short_description, p.long_description, p.product_review,
             p.price, p.original_price, 
             p.affiliate_url, p.affiliate_partner_name, p.external_purchase_info, p.image_url, p.gallery,
             p.category_id, p.subcategory_id, p.brand_id, p.is_featured, p.is_bestseller, p.is_active, 
             p.meta_title, p.meta_description, p.created_at,
             p.banner_ad_title, p.banner_ad_description, p.banner_ad_image_url, p.banner_ad_link_url,
             p.banner_ad_duration, p.banner_ad_is_repeating, p.banner_ad_start_date, p.banner_ad_end_date, p.banner_ad_is_active,
             c.name as category_name, c.slug as category_slug, 
             b.name as brand_name, b.slug as brand_slug,
             s.name as subcategory_name, s.slug as subcategory_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN brands b ON p.brand_id = b.id
      LEFT JOIN categories s ON p.subcategory_id = s.id
    `;
    const params: any[] = [];
    const whereConditions = [];

    // Only filter by is_active for non-admin requests
    if (!admin) {
      whereConditions.push('p.is_active = 1');
    }

    // Handle category filtering
    if (categories.length > 0) {
      const categoryConditions = categories.map(() => 'c.slug = ?').join(' OR ');
      whereConditions.push(`(${categoryConditions})`);
      categories.forEach(category => {
        params.push(category);
      });
    }

    // Handle subcategory filtering
    if (subcategories.length > 0) {
      const subcategoryConditions = subcategories.map(() => 's.slug = ?').join(' OR ');
      whereConditions.push(`(${subcategoryConditions})`);
      subcategories.forEach(subcategory => {
        params.push(subcategory);
      });
    }

    if (featured === 'true') {
      whereConditions.push('p.is_featured = 1');
    }

    if (bestseller === 'true') {
      whereConditions.push('p.is_bestseller = 1');
    }

    if (search) {
      // Advanced search across all text fields with intelligent matching
      const searchTerm = search.trim().toLowerCase();
      
      // Split search term into individual words for better matching
      const searchWords = searchTerm.split(/\s+/).filter(word => word.length > 0);
      
      if (searchWords.length === 1) {
        // Single word search - comprehensive field coverage
        const word = searchWords[0];
        whereConditions.push(`(
          LOWER(p.name) LIKE ? OR 
          LOWER(p.description) LIKE ? OR
          LOWER(p.short_description) LIKE ? OR
          LOWER(p.long_description) LIKE ? OR
          LOWER(p.product_review) LIKE ? OR
          LOWER(c.name) LIKE ? OR
          LOWER(b.name) LIKE ? OR
          LOWER(s.name) LIKE ? OR
          LOWER(p.slug) LIKE ?
        )`);
        
        // Add wildcard search for all fields
        const wildcardWord = `%${word}%`;
        params.push(wildcardWord, wildcardWord, wildcardWord, wildcardWord, wildcardWord, wildcardWord, wildcardWord, wildcardWord, wildcardWord);
      } else {
        // Multi-word search - each word must be found in at least one field
        const wordConditions = searchWords.map(() => `(
          LOWER(p.name) LIKE ? OR 
          LOWER(p.description) LIKE ? OR
          LOWER(p.short_description) LIKE ? OR
          LOWER(p.long_description) LIKE ? OR
          LOWER(p.product_review) LIKE ? OR
          LOWER(c.name) LIKE ? OR
          LOWER(b.name) LIKE ? OR
          LOWER(s.name) LIKE ? OR
          LOWER(p.slug) LIKE ?
        )`).join(' AND ');
        
        whereConditions.push(`(${wordConditions})`);
        
        // For each word, add all field variations
        searchWords.forEach(word => {
          const wildcardWord = `%${word}%`;
          params.push(wildcardWord, wildcardWord, wildcardWord, wildcardWord, wildcardWord, wildcardWord, wildcardWord, wildcardWord, wildcardWord);
        });
      }
    }

    if (minPrice) {
      whereConditions.push('p.price >= ?');
      params.push(parseFloat(minPrice));
    }

    if (maxPrice) {
      whereConditions.push('p.price <= ?');
      params.push(parseFloat(maxPrice));
    }

    // Brand filtering
    if (brands.length > 0) {
      const brandConditions = brands.map(() => 'b.slug = ?').join(' OR ');
      whereConditions.push(`(${brandConditions})`);
      brands.forEach(brand => {
        params.push(brand);
      });
    }

    // Add WHERE clause if we have conditions
    if (whereConditions.length > 0) {
      sql += ' WHERE ' + whereConditions.join(' AND ');
    }

    // Add sorting with search relevance
    if (search) {
      // For search results, prioritize relevance
      const searchTerm = search.trim();
      const searchWords = searchTerm.split(/\s+/).filter(word => word.length > 0);
      
      // Create relevance scoring based on exact matches and field importance
      let relevanceOrder = '';
      if (searchWords.length === 1) {
        const word = searchWords[0];
        relevanceOrder = `
          ORDER BY 
            CASE 
              WHEN p.name = ? THEN 1
              WHEN p.name LIKE ? THEN 2
              WHEN p.description LIKE ? THEN 3
              WHEN p.short_description LIKE ? THEN 4
              WHEN c.name LIKE ? THEN 5
              WHEN b.name LIKE ? THEN 6
              WHEN s.name LIKE ? THEN 7
              ELSE 8
            END,
            p.is_featured DESC,
            p.is_bestseller DESC,
            p.created_at DESC
        `;
        // Add relevance parameters
        params.unshift(word, `%${word}%`, `%${word}%`, `%${word}%`, `%${word}%`, `%${word}%`, `%${word}%`);
      } else {
        // For multi-word searches, prioritize products that match more words
        relevanceOrder = `
          ORDER BY 
            (CASE WHEN p.name LIKE ? THEN 1 ELSE 0 END +
             CASE WHEN p.description LIKE ? THEN 1 ELSE 0 END +
             CASE WHEN p.short_description LIKE ? THEN 1 ELSE 0 END +
             CASE WHEN c.name LIKE ? THEN 1 ELSE 0 END +
             CASE WHEN b.name LIKE ? THEN 1 ELSE 0 END +
             CASE WHEN s.name LIKE ? THEN 1 ELSE 0 END) DESC,
            p.is_featured DESC,
            p.is_bestseller DESC,
            p.created_at DESC
        `;
        // Add relevance parameters for multi-word search
        const fullSearchTerm = `%${searchTerm}%`;
        params.unshift(fullSearchTerm, fullSearchTerm, fullSearchTerm, fullSearchTerm, fullSearchTerm, fullSearchTerm);
      }
      sql += relevanceOrder;
    } else {
      // Regular sorting when not searching
      switch (sort) {
        case 'price_low':
          sql += ' ORDER BY p.price ASC';
          break;
        case 'price_high':
          sql += ' ORDER BY p.price DESC';
          break;
        case 'oldest':
          sql += ' ORDER BY p.created_at ASC';
          break;
        case 'newest':
        default:
          sql += ' ORDER BY p.created_at DESC';
          break;
      }
    }

    sql += ' LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const products = await query(sql, params);

    // Get total count for pagination
    let countSql = `
      SELECT COUNT(*) as total
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN brands b ON p.brand_id = b.id
      LEFT JOIN categories s ON p.subcategory_id = s.id
    `;
    const countParams: any[] = [];
    const countWhereConditions = [];

    // Only filter by is_active for non-admin requests
    if (!admin) {
      countWhereConditions.push('p.is_active = 1');
    }

    // Apply the same filtering logic for count query
    if (categories.length > 0) {
      const categoryConditions = categories.map(() => 'c.slug = ?').join(' OR ');
      countWhereConditions.push(`(${categoryConditions})`);
      categories.forEach(category => {
        countParams.push(category);
      });
    }

    if (subcategories.length > 0) {
      const subcategoryConditions = subcategories.map(() => 's.slug = ?').join(' OR ');
      countWhereConditions.push(`(${subcategoryConditions})`);
      subcategories.forEach(subcategory => {
        countParams.push(subcategory);
      });
    }

    if (featured === 'true') {
      countWhereConditions.push('p.is_featured = 1');
    }

    if (bestseller === 'true') {
      countWhereConditions.push('p.is_bestseller = 1');
    }

    if (search) {
      // Match the same advanced search logic for count query
      const searchTerm = search.trim().toLowerCase();
      const searchWords = searchTerm.split(/\s+/).filter(word => word.length > 0);
      
      if (searchWords.length === 1) {
        const word = searchWords[0];
        countWhereConditions.push(`(
          LOWER(p.name) LIKE ? OR 
          LOWER(p.description) LIKE ? OR
          LOWER(p.short_description) LIKE ? OR
          LOWER(p.long_description) LIKE ? OR
          LOWER(p.product_review) LIKE ? OR
          LOWER(c.name) LIKE ? OR
          LOWER(b.name) LIKE ? OR
          LOWER(s.name) LIKE ? OR
          LOWER(p.slug) LIKE ?
        )`);
        const wildcardWord = `%${word}%`;
        countParams.push(wildcardWord, wildcardWord, wildcardWord, wildcardWord, wildcardWord, wildcardWord, wildcardWord, wildcardWord, wildcardWord);
      } else {
        const wordConditions = searchWords.map(() => `(
          LOWER(p.name) LIKE ? OR 
          LOWER(p.description) LIKE ? OR
          LOWER(p.short_description) LIKE ? OR
          LOWER(p.long_description) LIKE ? OR
          LOWER(p.product_review) LIKE ? OR
          LOWER(c.name) LIKE ? OR
          LOWER(b.name) LIKE ? OR
          LOWER(s.name) LIKE ? OR
          LOWER(p.slug) LIKE ?
        )`).join(' AND ');
        countWhereConditions.push(`(${wordConditions})`);
        searchWords.forEach(word => {
          const wildcardWord = `%${word}%`;
          countParams.push(wildcardWord, wildcardWord, wildcardWord, wildcardWord, wildcardWord, wildcardWord, wildcardWord, wildcardWord, wildcardWord);
        });
      }
    }

    if (minPrice) {
      countWhereConditions.push('p.price >= ?');
      countParams.push(parseFloat(minPrice));
    }

    if (maxPrice) {
      countWhereConditions.push('p.price <= ?');
      countParams.push(parseFloat(maxPrice));
    }

    // Brand filtering for count query
    if (brands.length > 0) {
      const brandConditions = brands.map(() => 'b.slug = ?').join(' OR ');
      countWhereConditions.push(`(${brandConditions})`);
      brands.forEach(brand => {
        countParams.push(brand);
      });
    }

    // Add WHERE clause if we have conditions
    if (countWhereConditions.length > 0) {
      countSql += ' WHERE ' + countWhereConditions.join(' AND ');
    }

    const [countResult] = await query(countSql, countParams) as any[];
    const total = countResult.total;

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('POST /api/products - Received body:', body);
    const {
      name,
      slug,
      description,
      short_description,
      long_description,
      product_review,
      price,
      original_price,
      affiliate_url,
      affiliate_partner_name,
      external_purchase_info,
      image_url,
      gallery,
      category_id,
      subcategory_id,
      brand_id,
      is_featured,
      is_bestseller,
      is_active,
      meta_title,
      meta_description,
      // Banner ad fields
      banner_ad_title,
      banner_ad_description,
      banner_ad_image_url,
      banner_ad_link_url,
      banner_ad_duration,
      banner_ad_is_repeating,
      banner_ad_start_date,
      banner_ad_end_date,
      banner_ad_is_active
    } = body;

    // Validate required fields
    if (!name || !short_description || !price || !affiliate_url || !category_id) {
      return NextResponse.json(
        { error: 'Missing required fields: name, short_description, price, affiliate_url, category_id' },
        { status: 400 }
      );
    }

    // Validate price is a valid number
    const numericPrice = parseFloat(price);
    if (isNaN(numericPrice) || numericPrice <= 0) {
      return NextResponse.json(
        { error: 'Price must be a valid positive number' },
        { status: 400 }
      );
    }

    // Generate slug if not provided
    const productSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const sql = `
      INSERT INTO products (
        name, slug, description, short_description, long_description, product_review, price, original_price,
        affiliate_url, affiliate_partner_name, external_purchase_info, image_url, gallery, category_id, subcategory_id, brand_id, is_featured, is_bestseller, is_active,
        meta_title, meta_description, banner_ad_title, banner_ad_description, banner_ad_image_url, banner_ad_link_url,
        banner_ad_duration, banner_ad_is_repeating, banner_ad_start_date, banner_ad_end_date, banner_ad_is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const result = await query(sql, [
      name || null,
      productSlug || null,
      description || null,
      short_description || null,
      long_description || null,
      product_review || null,
      price || null,
      original_price || null,
      affiliate_url || null,
      affiliate_partner_name || null,
      external_purchase_info || null,
      image_url || null,
      gallery || null,
      category_id || null,
      subcategory_id || null,
      brand_id || null,
      is_featured !== undefined ? (is_featured ? 1 : 0) : 0,
      is_bestseller !== undefined ? (is_bestseller ? 1 : 0) : 0,
      is_active !== undefined ? (is_active ? 1 : 0) : 1,
      meta_title || null,
      meta_description || null,
      // Banner ad fields
      banner_ad_title || null,
      banner_ad_description || null,
      banner_ad_image_url || null,
      banner_ad_link_url || null,
      banner_ad_duration || '1_week',
      banner_ad_is_repeating !== undefined ? (banner_ad_is_repeating ? 1 : 0) : 0,
      banner_ad_start_date || null,
      banner_ad_end_date || null,
      banner_ad_is_active !== undefined ? (banner_ad_is_active ? 1 : 0) : 0
    ]);

    return NextResponse.json({
      success: true,
      product: { id: (result as any).insertId, ...body }
    });
  } catch (error) {
    console.error('Error creating product:', error);
    console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      { 
        error: 'Failed to create product',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
