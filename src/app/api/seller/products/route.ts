import { NextResponse } from 'next/server';
import { getAuthenticatedSeller } from '@/lib/seller-session';
import { query } from '@/lib/database';


// Basic migration check
let migrationDone = false;
async function ensureColumns() {
  if (migrationDone) return;
  try {
    await query("ALTER TABLE products ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'USD' AFTER price");
    await query("ALTER TABLE products ADD COLUMN IF NOT EXISTS regions JSON DEFAULT NULL AFTER currency");
    await query("ALTER TABLE products ADD COLUMN IF NOT EXISTS colour_variants JSON DEFAULT NULL AFTER regions");
    await query("ALTER TABLE products ADD COLUMN IF NOT EXISTS clothing_sizes JSON DEFAULT NULL AFTER colour_variants");
    await query("ALTER TABLE products ADD COLUMN IF NOT EXISTS shoe_sizes JSON DEFAULT NULL AFTER clothing_sizes");
    migrationDone = true;
  } catch (e) {
    console.warn('Column migration failed (columns might already exist):', e.message);
    migrationDone = true;
  }
}

export async function GET(request: Request) {
  await ensureColumns();
  try {
    const seller = await getAuthenticatedSeller(request);
    if (!seller) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const products = await query(
      `SELECT p.*, c.name as category_name, b.name as brand_name 
       FROM products p 
       LEFT JOIN categories c ON p.category_id = c.id 
       LEFT JOIN brands b ON p.brand_id = b.id 
       WHERE p.seller_id = ? 
       ORDER BY p.created_at DESC`,
      [seller.id]
    );

    return NextResponse.json({ products });
  } catch (error) {
    console.error('Seller products error:', error);
    return NextResponse.json({ error: 'Failed to load products' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const seller = await getAuthenticatedSeller(request);
    if (!seller) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    if (seller.status !== 'approved') {
      return NextResponse.json({ error: 'Your account must be approved before listing products' }, { status: 403 });
    }

    const body = await request.json();
    const { name, description, shortDescription, price, originalPrice, currency, categoryId, brandId, imageUrl, productCondition, stockQuantity, regions, colourVariants, clothingSizes, shoeSizes } = body;

    if (!name || !price) {
      return NextResponse.json({ error: 'Name and price are required' }, { status: 400 });
    }

    // Generate slug: just the product name (store is in the URL path)
    const slug = name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim();

    const regionsJson = Array.isArray(regions) && regions.length > 0 ? JSON.stringify(regions) : null;
    const coloursJson = Array.isArray(colourVariants) && colourVariants.length > 0 ? JSON.stringify(colourVariants) : null;
    const clothingJson = Array.isArray(clothingSizes) && clothingSizes.length > 0 ? JSON.stringify(clothingSizes) : null;
    const shoeJson = shoeSizes && typeof shoeSizes === 'object' && !Array.isArray(shoeSizes) && shoeSizes.sizes?.length > 0 ? JSON.stringify(shoeSizes) : (Array.isArray(shoeSizes) && shoeSizes.length > 0 ? JSON.stringify(shoeSizes) : null);

    const result = await query(
      `INSERT INTO products (name, slug, description, short_description, price, original_price, currency, regions,
        colour_variants, clothing_sizes, shoe_sizes,
        category_id, brand_id, image_url, product_condition, stock_quantity, 
        purchase_type, seller_id, seller_approved, affiliate_url, is_active) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'direct', ?, 1, '', 1)`,
      [
        name, slug, description || null, shortDescription || null,
        price, originalPrice || null, currency || 'USD', regionsJson,
        coloursJson, clothingJson, shoeJson,
        categoryId || null, brandId || null,
        imageUrl || null, productCondition || 'new', stockQuantity || null,
        seller.id
      ]
    ) as { insertId: number };

    return NextResponse.json({
      success: true,
      productId: result.insertId,
      message: 'Product created and is now live!',
    });
  } catch (error) {
    console.error('Create product error:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const seller = await getAuthenticatedSeller(request);
    if (!seller) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const body = await request.json();
    const { id, name, description, shortDescription, price, originalPrice, currency, categoryId, brandId, imageUrl, productCondition, stockQuantity, regions, colourVariants, clothingSizes, shoeSizes } = body;

    if (!id) return NextResponse.json({ error: 'Product ID required' }, { status: 400 });

    // Verify ownership
    const existing = await query('SELECT id, slug FROM products WHERE id = ? AND seller_id = ?', [id, seller.id]) as { id: number; slug: string }[];
    if (existing.length === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Regenerate slug (just product name, store is in URL path)
    const newSlug = name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim();

    const regionsJson = Array.isArray(regions) && regions.length > 0 ? JSON.stringify(regions) : null;
    const coloursJson = Array.isArray(colourVariants) && colourVariants.length > 0 ? JSON.stringify(colourVariants) : null;
    const clothingJson = Array.isArray(clothingSizes) && clothingSizes.length > 0 ? JSON.stringify(clothingSizes) : null;
    const shoeJson = shoeSizes && typeof shoeSizes === 'object' && !Array.isArray(shoeSizes) && shoeSizes.sizes?.length > 0 ? JSON.stringify(shoeSizes) : (Array.isArray(shoeSizes) && shoeSizes.length > 0 ? JSON.stringify(shoeSizes) : null);

    await query(
      `UPDATE products SET name = ?, slug = ?, description = ?, short_description = ?, price = ?, 
        original_price = ?, currency = ?, regions = ?, colour_variants = ?, clothing_sizes = ?, shoe_sizes = ?,
        category_id = ?, brand_id = ?, image_url = ?, 
        product_condition = ?, stock_quantity = ? WHERE id = ? AND seller_id = ?`,
      [
        name, newSlug, description || null, shortDescription || null, price,
        originalPrice || null, currency || 'USD', regionsJson, coloursJson, clothingJson, shoeJson,
        categoryId || null, brandId || null,
        imageUrl || null, productCondition || 'new', stockQuantity || null,
        id, seller.id
      ]
    );

    return NextResponse.json({ success: true, message: 'Product updated' });
  } catch (error) {
    console.error('Update product error:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const seller = await getAuthenticatedSeller(request);
    if (!seller) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Product ID required' }, { status: 400 });

    await query('DELETE FROM products WHERE id = ? AND seller_id = ?', [id, seller.id]);
    return NextResponse.json({ success: true, message: 'Product removed' });
  } catch (error) {
    console.error('Delete product error:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const seller = await getAuthenticatedSeller(request);
    if (!seller) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) return NextResponse.json({ error: 'Product ID and status required' }, { status: 400 });
    if (!['active', 'pending', 'disabled'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status. Use: active, pending, disabled' }, { status: 400 });
    }

    // Verify ownership
    const existing = await query('SELECT id FROM products WHERE id = ? AND seller_id = ?', [id, seller.id]) as { id: number }[];
    if (existing.length === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const isActive = status !== 'disabled' ? 1 : 0;
    const sellerApproved = status === 'active' ? 1 : 0;

    await query(
      'UPDATE products SET seller_approved = ?, is_active = ? WHERE id = ? AND seller_id = ?',
      [sellerApproved, isActive, id, seller.id]
    );

    return NextResponse.json({ success: true, message: `Product set to ${status}` });
  } catch (error) {
    console.error('Update product status error:', error);
    return NextResponse.json({ error: 'Failed to update status' }, { status: 500 });
  }
}
