import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

interface PartialProduct {
  purchase_type?: string;
  product_condition?: string;
  stock_quantity?: number;
}

interface CategoryCheck {
  id: number;
  name: string;
  slug: string;
  parent_id: number | null;
}

interface SubcategoryCheck {
  id: number;
  name: string;
  slug: string;
  category_id: number;
}

interface BrandCheck {
  id: number;
  name: string;
}

interface CurrentProduct {
  id: number;
  name: string;
  category_id: number;
  subcategory_id: number | null;
  brand_id: number | null;
  current_category_name: string;
  current_subcategory_name: string | null;
  current_brand_name: string | null;
}

interface CategoryInfo {
  category_name: string;
  subcategory_name: string | null;
  brand_name: string | null;
}

interface DeleteResult {
  affectedRows: number;
}


export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;
    const productSlug = slug;

    // Mock data for testing when database is not available
    const mockProducts = {
      'iphone-15-pro': {
        id: 1,
        name: 'iPhone 15 Pro',
        slug: 'iphone-15-pro',
        description: 'Latest iPhone with advanced camera system, A17 Pro chip, and titanium design. Features a 6.1-inch Super Retina XDR display, A17 Pro chip with 6-core CPU and 6-core GPU, and a pro camera system with 48MP main camera.',
        short_description: 'Premium smartphone with cutting-edge technology',
        price: 999.99,
        original_price: 1199.99,
        affiliate_url: 'https://apple.com/iphone-15-pro',
        image_url: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600',
        gallery: [
          'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600',
          'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600',
          'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600'
        ],
        category_id: 2,
        brand_id: 1,
        is_featured: true,
        is_bestseller: true,
        is_active: true,
        category_name: 'Electronics',
        category_slug: 'electronics',
        meta_title: 'iPhone 15 Pro - Premium Smartphone',
        meta_description: 'Latest iPhone with advanced camera system and A17 Pro chip'
      },
      'samsung-galaxy-s24': {
        id: 2,
        name: 'Samsung Galaxy S24',
        slug: 'samsung-galaxy-s24',
        description: 'Powerful Android smartphone with AI features and premium camera system. Features a 6.2-inch Dynamic AMOLED display, Snapdragon 8 Gen 3 processor, and a triple camera system with 50MP main camera.',
        short_description: 'AI-powered smartphone with exceptional camera',
        price: 899.99,
        original_price: 1099.99,
        affiliate_url: 'https://samsung.com/galaxy-s24',
        image_url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600',
        gallery: [
          'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600',
          'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600'
        ],
        category_id: 2,
        brand_id: 2,
        is_featured: true,
        is_bestseller: false,
        is_active: true,
        category_name: 'Electronics',
        category_slug: 'electronics',
        meta_title: 'Samsung Galaxy S24 - AI-Powered Smartphone',
        meta_description: 'Powerful Android smartphone with AI features and premium camera'
      },
      'nike-air-max-270': {
        id: 3,
        name: 'Nike Air Max 270',
        slug: 'nike-air-max-270',
        description: 'Comfortable running shoes with Max Air cushioning and modern design. Features a lightweight upper, responsive Max Air unit, and durable rubber outsole for all-day comfort.',
        short_description: 'Comfortable running shoes with Max Air',
        price: 129.99,
        original_price: 159.99,
        affiliate_url: 'https://nike.com/air-max-270',
        image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600',
        gallery: [
          'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600',
          'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600'
        ],
        category_id: 1,
        brand_id: 3,
        is_featured: false,
        is_bestseller: true,
        is_active: true,
        category_name: 'Fashion',
        category_slug: 'fashion',
        meta_title: 'Nike Air Max 270 - Comfortable Running Shoes',
        meta_description: 'Comfortable running shoes with Max Air cushioning'
      }
    };

    // Try database first, fallback to mock data
    try {
      const sql = `
        SELECT p.*, c.name as category_name, c.slug as category_slug,
               s.name as subcategory_name, s.slug as subcategory_slug
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        LEFT JOIN categories s ON p.subcategory_id = s.id
        WHERE p.slug = ? AND p.is_active = 1
      `;

      const products = await query(sql, [productSlug]);

      if (!Array.isArray(products) || products.length === 0) {
        return NextResponse.json(
          { error: 'Product not found' },
          { status: 404 }
        );
      }

      const product = products[0] as { id: number; [key: string]: unknown };

      // Fetch colour variations
      let variations: unknown[] = [];
      try {
        const variationRows = await query(
          'SELECT * FROM product_variations WHERE product_id = ? ORDER BY sort_order ASC, id ASC',
          [product.id]
        );
        if (Array.isArray(variationRows)) {
          variations = variationRows.map((v: { gallery_images?: string | string[] | null; [key: string]: unknown }) => ({
            ...v,
            gallery_images: v.gallery_images
              ? (typeof v.gallery_images === 'string' ? JSON.parse(v.gallery_images) : v.gallery_images)
              : []
          }));
        }
      } catch {
        // Table may not exist yet, that's fine
        console.log('product_variations table not available yet');
      }

      return NextResponse.json({ ...product, variations });
    } catch {
      console.log('Database not available, using mock data');
      
      // Use mock data as fallback
      const mockProduct = mockProducts[productSlug];
      if (!mockProduct) {
        return NextResponse.json(
          { error: 'Product not found' },
          { status: 404 }
        );
      }

      return NextResponse.json(mockProduct);
    }
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug: pathSlug } = await context.params;
    const productSlug = pathSlug;
    
    console.log('Product Slug:', productSlug);
    
    // Get the raw body text first to debug JSON parsing issues
    const bodyText = await request.text();
    console.log('Raw request body:', bodyText);
    
    let body;
    try {
      body = JSON.parse(bodyText);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      return NextResponse.json(
        { error: 'Invalid JSON in request body', details: parseError.message },
        { status: 400 }
      );
    }
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
      purchase_type,
      product_condition,
      stock_quantity,
      image_url,
      gallery,
      colors,
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

    console.log('Parsed body data:', body);

    // Fetch existing product to preserve values not explicitly provided
    const existingProductData = await query(
      'SELECT purchase_type, product_condition, stock_quantity FROM products WHERE slug = ?',
      [productSlug]
    );
    const existing = Array.isArray(existingProductData) && existingProductData.length > 0 ? existingProductData[0] as PartialProduct : null;

    // Use existing values if not provided in the update request
    const finalPurchaseType = purchase_type !== undefined ? purchase_type : (existing?.purchase_type || 'affiliate');
    const finalProductCondition = product_condition !== undefined ? product_condition : (existing?.product_condition || 'new');
    const finalStockQuantity = stock_quantity !== undefined ? stock_quantity : existing?.stock_quantity;

    // Validate required fields
    if (!name || !short_description || !price || !category_id) {
      return NextResponse.json(
        { error: 'Missing required fields: name, short_description, price, category_id' },
        { status: 400 }
      );
    }

    // Validate affiliate_url for affiliate products only
    if (finalPurchaseType === 'affiliate' && !affiliate_url) {
      return NextResponse.json(
        { error: 'Affiliate URL is required for affiliate products' },
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

    // CATEGORY VALIDATION - Prevent categorization issues
    console.log('🔍 Validating category and subcategory...');
    
    // 1. Validate that category_id is a main category (parent_id IS NULL)
    if (category_id) {
      const categoryCheck = await query(
        'SELECT id, name, slug, parent_id FROM categories WHERE id = ? AND is_active = 1',
        [category_id]
      );
      
      if (!Array.isArray(categoryCheck) || categoryCheck.length === 0) {
        return NextResponse.json(
          { error: `Invalid category_id: ${category_id}. Category not found or inactive.` },
          { status: 400 }
        );
      }
      
      const category = categoryCheck[0] as CategoryCheck;
      if (category.parent_id !== null) {
        return NextResponse.json(
          { 
            error: `Invalid category_id: ${category_id}. "${category.name}" is a subcategory, not a main category. Please select a main category.`,
            suggestion: `Use category_id for main categories only. "${category.name}" should be used as subcategory_id.`
          },
          { status: 400 }
        );
      }
      
      console.log(`✅ Valid main category: ${category.name} (ID: ${category.id})`);
    }

    // 2. Validate that subcategory_id belongs to the selected category
    if (subcategory_id && category_id) {
      // First try the categories table (for subcategories stored there)
      let subcategoryCheck = await query(
        'SELECT id, name, slug, parent_id as category_id FROM categories WHERE id = ? AND is_active = 1 AND parent_id IS NOT NULL',
        [subcategory_id]
      );
      
      // If not found in categories, try the subcategories table
      if (!Array.isArray(subcategoryCheck) || subcategoryCheck.length === 0) {
        subcategoryCheck = await query(
          'SELECT id, name, slug, category_id FROM subcategories WHERE id = ? AND is_active = 1',
          [subcategory_id]
        );
      }
      
      if (!Array.isArray(subcategoryCheck) || subcategoryCheck.length === 0) {
        return NextResponse.json(
          { error: `Invalid subcategory_id: ${subcategory_id}. Subcategory not found or inactive.` },
          { status: 400 }
        );
      }
      
      const subcategory = subcategoryCheck[0] as SubcategoryCheck;
      if (subcategory.category_id !== parseInt(category_id)) {
        return NextResponse.json(
          { 
            error: `Invalid subcategory assignment: "${subcategory.name}" (ID: ${subcategory_id}) does not belong to the selected category (ID: ${category_id}).`,
            suggestion: `Please select a subcategory that belongs to the chosen main category.`
          },
          { status: 400 }
        );
      }
      
      console.log(`✅ Valid subcategory: ${subcategory.name} (ID: ${subcategory.id}) under category ID: ${category_id}`);
    }

    // 3. Validate brand_id if provided
    if (brand_id) {
      const brandCheck = await query(
        'SELECT id, name FROM brands WHERE id = ? AND is_active = 1',
        [brand_id]
      );
      
      if (!Array.isArray(brandCheck) || brandCheck.length === 0) {
        return NextResponse.json(
          { error: `Invalid brand_id: ${brand_id}. Brand not found or inactive.` },
          { status: 400 }
        );
      }
      
      const brand = brandCheck[0] as BrandCheck;
      console.log(`✅ Valid brand: ${brand.name} (ID: ${brand.id})`);
    }

    // Generate slug if not provided
    const newSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    // Prepare colors JSON
    const colorsJson = colors && Array.isArray(colors) && colors.length > 0 ? JSON.stringify(colors) : null;

    // SQL with new columns (purchase_type, product_condition, stock_quantity)
    const sql = `
      UPDATE products SET
        name = ?, slug = ?, description = ?, short_description = ?, long_description = ?, product_review = ?,
        price = ?, original_price = ?, affiliate_url = ?, affiliate_partner_name = ?, external_purchase_info = ?,
        purchase_type = ?, product_condition = ?, stock_quantity = ?, image_url = ?, gallery = ?, colors = ?,
        category_id = ?, subcategory_id = ?, brand_id = ?, is_featured = ?, is_bestseller = ?, is_active = ?,
        meta_title = ?, meta_description = ?,
        banner_ad_title = ?, banner_ad_description = ?, banner_ad_image_url = ?, banner_ad_link_url = ?,
        banner_ad_duration = ?, banner_ad_is_repeating = ?, banner_ad_start_date = ?, banner_ad_end_date = ?, banner_ad_is_active = ?
      WHERE slug = ?
    `;

    // Fallback SQL without new columns
    const fallbackSql = `
      UPDATE products SET
        name = ?, slug = ?, description = ?, short_description = ?, long_description = ?, product_review = ?,
        price = ?, original_price = ?, affiliate_url = ?, affiliate_partner_name = ?, external_purchase_info = ?,
        image_url = ?, gallery = ?,
        category_id = ?, subcategory_id = ?, brand_id = ?, is_featured = ?, is_bestseller = ?, is_active = ?,
        meta_title = ?, meta_description = ?,
        banner_ad_title = ?, banner_ad_description = ?, banner_ad_image_url = ?, banner_ad_link_url = ?,
        banner_ad_duration = ?, banner_ad_is_repeating = ?, banner_ad_start_date = ?, banner_ad_end_date = ?, banner_ad_is_active = ?
      WHERE slug = ?
    `;

    const sqlParams = [
      name || null,
      newSlug || null,
      description || null,
      short_description || null,
      long_description || null,
      product_review || null,
      price || null,
      original_price || null,
      affiliate_url || '',
      affiliate_partner_name || null,
      external_purchase_info || null,
      finalPurchaseType,
      finalProductCondition,
      finalStockQuantity,
      image_url || null,
      gallery || null,
      colorsJson,
      category_id || null,
      subcategory_id || null,
      brand_id || null,
      is_featured !== undefined ? (is_featured ? 1 : 0) : 0,
      is_bestseller !== undefined ? (is_bestseller ? 1 : 0) : 0,
      is_active !== undefined ? (is_active ? 1 : 0) : 1,
      meta_title || null,
      meta_description || null,
      banner_ad_title || null,
      banner_ad_description || null,
      banner_ad_image_url || null,
      banner_ad_link_url || null,
      banner_ad_duration || '1_week',
      banner_ad_is_repeating !== undefined ? (banner_ad_is_repeating ? 1 : 0) : 0,
      banner_ad_start_date || null,
      banner_ad_end_date || null,
      banner_ad_is_active !== undefined ? (banner_ad_is_active ? 1 : 0) : 0,
      productSlug
    ];

    const fallbackParams = [
      name || null,
      newSlug || null,
      description || null,
      short_description || null,
      long_description || null,
      product_review || null,
      price || null,
      original_price || null,
      affiliate_url || '',
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
      banner_ad_title || null,
      banner_ad_description || null,
      banner_ad_image_url || null,
      banner_ad_link_url || null,
      banner_ad_duration || '1_week',
      banner_ad_is_repeating !== undefined ? (banner_ad_is_repeating ? 1 : 0) : 0,
      banner_ad_start_date || null,
      banner_ad_end_date || null,
      banner_ad_is_active !== undefined ? (banner_ad_is_active ? 1 : 0) : 0,
      productSlug
    ];

    // Flag to track which SQL to use
    // let useFallback = false;

    console.log('SQL params:', sqlParams);
    
    // Check if the product exists first and get current categorization
    const existingProductQuery = `
      SELECT p.id, p.name, p.category_id, p.subcategory_id, p.brand_id,
             c.name as current_category_name, c.slug as current_category_slug,
             s.name as current_subcategory_name, s.slug as current_subcategory_slug,
             b.name as current_brand_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN categories s ON p.subcategory_id = s.id
      LEFT JOIN brands b ON p.brand_id = b.id
      WHERE p.slug = ?
    `;
    
    const existingProduct = await query(existingProductQuery, [productSlug]);
    if (!Array.isArray(existingProduct) || existingProduct.length === 0) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    const currentProduct = existingProduct[0] as CurrentProduct;
    console.log('📋 Current product categorization:');
    console.log(`  Product: ${currentProduct.name} (ID: ${currentProduct.id})`);
    console.log(`  Current Category: ${currentProduct.current_category_name} (ID: ${currentProduct.category_id})`);
    console.log(`  Current Subcategory: ${currentProduct.current_subcategory_name || 'None'} (ID: ${currentProduct.subcategory_id || 'None'})`);
    console.log(`  Current Brand: ${currentProduct.current_brand_name || 'None'} (ID: ${currentProduct.brand_id || 'None'})`);
    
    console.log('🔄 New categorization:');
    console.log(`  New Category ID: ${category_id}`);
    console.log(`  New Subcategory ID: ${subcategory_id || 'None'}`);
    console.log(`  New Brand ID: ${brand_id || 'None'}`);

    // Log the change for audit purposes
    if (currentProduct.category_id !== parseInt(category_id)) {
      console.log(`⚠️  CATEGORY CHANGE: ${currentProduct.current_category_name} (${currentProduct.category_id}) → Category ID ${category_id}`);
    }
    if (currentProduct.subcategory_id !== (subcategory_id ? parseInt(subcategory_id) : null)) {
      console.log(`⚠️  SUBCATEGORY CHANGE: ${currentProduct.current_subcategory_name || 'None'} (${currentProduct.subcategory_id || 'None'}) → Subcategory ID ${subcategory_id || 'None'}`);
    }

    // Validate subcategory_id exists in categories table if provided
    if (subcategory_id) {
      const subcategoryExists = await query('SELECT id FROM categories WHERE id = ?', [subcategory_id]);
      if (!Array.isArray(subcategoryExists) || subcategoryExists.length === 0) {
        console.warn(`Subcategory ID ${subcategory_id} not found, setting to null`);
        sqlParams[sqlParams.length - 2] = null; // Set subcategory_id to null in params
      }
    }

    try {
      let result;
      try {
        result = await query(sql, sqlParams);
      } catch (columnError: unknown) {
        // If columns don't exist, use fallback SQL without purchase_type/stock_quantity
        if ((columnError as Error).message?.includes('Unknown column')) {
          console.log('Using fallback SQL without purchase_type/stock_quantity columns');
          result = await query(fallbackSql, fallbackParams);
          // useFallback = true;
        } else {
          throw columnError;
        }
      }
      console.log('✅ Product update successful:', result);
      
      // Get updated categorization info for confirmation
      const updatedCategoryInfo = await query(`
        SELECT c.name as category_name, s.name as subcategory_name, b.name as brand_name
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        LEFT JOIN categories s ON p.subcategory_id = s.id
        LEFT JOIN brands b ON p.brand_id = b.id
        WHERE p.slug = ?
      `, [newSlug || productSlug]);
      
      const categoryInfo = updatedCategoryInfo[0] as CategoryInfo;
      console.log('✅ Final categorization confirmed:');
      console.log(`  Category: ${categoryInfo?.category_name || 'None'}`);
      console.log(`  Subcategory: ${categoryInfo?.subcategory_name || 'None'}`);
      console.log(`  Brand: ${categoryInfo?.brand_name || 'None'}`);
      
      return NextResponse.json({ 
        success: true,
        message: 'Product updated successfully',
        categorization: {
          category: categoryInfo?.category_name || 'None',
          subcategory: categoryInfo?.subcategory_name || 'None',
          brand: categoryInfo?.brand_name || 'None'
        }
      });
    } catch (updateError: unknown) {
      console.error('Update error:', updateError);
      
      // If it's a foreign key constraint error, try without subcategory_id
      if (updateError instanceof Error && updateError.message && updateError.message.includes('foreign key constraint')) {
        console.log('Retrying update without subcategory_id due to constraint error');
        
        // Update SQL without subcategory_id
        const sqlWithoutSubcategory = `
          UPDATE products SET
            name = ?, slug = ?, description = ?, short_description = ?,
            price = ?, original_price = ?, affiliate_url = ?, affiliate_partner_name = ?, external_purchase_info = ?, image_url = ?,
            category_id = ?, brand_id = ?, is_featured = ?, is_bestseller = ?, is_active = ?,
            meta_title = ?, meta_description = ?,
            banner_ad_title = ?, banner_ad_description = ?, banner_ad_image_url = ?, banner_ad_link_url = ?,
            banner_ad_duration = ?, banner_ad_is_repeating = ?, banner_ad_start_date = ?, banner_ad_end_date = ?, banner_ad_is_active = ?
          WHERE slug = ?
        `;
        
        // Remove subcategory_id from params
        const paramsWithoutSubcategory = [
          name || null,
          newSlug || null,
          description || null,
          short_description || null,
          price || null,
          original_price || null,
          affiliate_url || null,
          affiliate_partner_name || null,
          external_purchase_info || null,
          image_url || null,
          category_id || null,
          brand_id || null,
          is_featured !== undefined ? (is_featured ? 1 : 0) : 0,
          is_bestseller !== undefined ? (is_bestseller ? 1 : 0) : 0,
          is_active !== undefined ? (is_active ? 1 : 0) : 1,
          meta_title || null,
          meta_description || null,
          banner_ad_title || null,
          banner_ad_description || null,
          banner_ad_image_url || null,
          banner_ad_link_url || null,
          banner_ad_duration || '1_week',
          banner_ad_is_repeating !== undefined ? (banner_ad_is_repeating ? 1 : 0) : 0,
          banner_ad_start_date || null,
          banner_ad_end_date || null,
          banner_ad_is_active !== undefined ? (banner_ad_is_active ? 1 : 0) : 0,
          productSlug
        ];
        
        const retryResult = await query(sqlWithoutSubcategory, paramsWithoutSubcategory);
        console.log('Retry update result:', retryResult);
        
        return NextResponse.json({ 
          success: true, 
          warning: 'Product updated successfully, but subcategory was not set due to database constraint issues. Please run the database migration to fix this.' 
        });
      }
      
      throw updateError;
    }
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;
    const productSlug = slug;

    if (!productSlug) {
      return NextResponse.json(
        { error: 'Product slug is required' },
        { status: 400 }
      );
    }

    // First, check if the product exists
    const checkSql = 'SELECT id FROM products WHERE slug = ?';
    const existingProduct = await query(checkSql, [productSlug]);
    
    if (!Array.isArray(existingProduct) || existingProduct.length === 0) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Delete the product (hard delete)
    const deleteSql = 'DELETE FROM products WHERE slug = ?';
    const result = await query(deleteSql, [productSlug]) as DeleteResult;

    // Check if deletion was successful
    if (result?.affectedRows === 0) {
      return NextResponse.json(
        { error: 'Product not found or already deleted' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { 
        error: 'Failed to delete product',
        details: errorMessage
      },
      { status: 500 }
    );
  }
}
