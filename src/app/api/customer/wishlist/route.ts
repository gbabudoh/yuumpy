import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Helper function to get customer ID from token
function getCustomerId(request: NextRequest): number | null {
  try {
    const token = request.cookies.get('customer_token')?.value;
    
    if (!token) {
      return null;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return decoded.customerId || null;
  } catch (error) {
    return null;
  }
}

// GET - Get all wishlist items for the authenticated customer
export async function GET(request: NextRequest) {
  try {
    const customerId = getCustomerId(request);
    
    if (!customerId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const wishlistItems = await query(
      `SELECT 
        w.id,
        w.product_id,
        w.created_at,
        p.name,
        p.slug,
        p.price,
        p.original_price,
        p.image_url,
        p.affiliate_url,
        p.purchase_type,
        p.product_condition,
        p.stock_quantity,
        b.name as brand_name,
        c.name as category_name
      FROM wishlist w
      INNER JOIN products p ON w.product_id = p.id
      LEFT JOIN brands b ON p.brand_id = b.id
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE w.customer_id = ? AND p.is_active = TRUE
      ORDER BY w.created_at DESC`,
      [customerId]
    );

    return NextResponse.json({
      success: true,
      wishlist: Array.isArray(wishlistItems) ? wishlistItems : []
    });
  } catch (error: any) {
    console.error('Error fetching wishlist:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

// POST - Add product to wishlist
export async function POST(request: NextRequest) {
  try {
    const customerId = getCustomerId(request);
    
    if (!customerId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { product_id } = body;

    if (!product_id) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    // Check if product exists and is active
    const products = await query(
      `SELECT id FROM products WHERE id = ? AND is_active = TRUE`,
      [product_id]
    ) as any[];

    if (!Array.isArray(products) || products.length === 0) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Check if already in wishlist
    const existing = await query(
      `SELECT id FROM wishlist WHERE customer_id = ? AND product_id = ?`,
      [customerId, product_id]
    ) as any[];

    if (Array.isArray(existing) && existing.length > 0) {
      return NextResponse.json(
        { error: 'Product already in wishlist', success: true },
        { status: 200 }
      );
    }

    // Add to wishlist
    await query(
      `INSERT INTO wishlist (customer_id, product_id) VALUES (?, ?)`,
      [customerId, product_id]
    );

    return NextResponse.json({
      success: true,
      message: 'Product added to wishlist'
    });
  } catch (error: any) {
    console.error('Error adding to wishlist:', error);
    
    // Handle duplicate entry error
    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json(
        { error: 'Product already in wishlist', success: true },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Remove product from wishlist
export async function DELETE(request: NextRequest) {
  try {
    const customerId = getCustomerId(request);
    
    if (!customerId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const product_id = searchParams.get('product_id');

    if (!product_id) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    const result = await query(
      `DELETE FROM wishlist WHERE customer_id = ? AND product_id = ?`,
      [customerId, product_id]
    );

    const deleteResult = result as any;
    if (deleteResult.affectedRows === 0) {
      return NextResponse.json(
        { error: 'Product not found in wishlist' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Product removed from wishlist'
    });
  } catch (error: any) {
    console.error('Error removing from wishlist:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

