import { NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function GET(
  request: Request,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;
    
    interface SellerStats {
      total_sold?: number;
      avg_rating?: number;
      total_reviews?: number;
      revenue?: number;
    }

    // 1. Fetch seller profile
    interface Seller {
      id: number;
      store_name: string;
      store_slug: string;
      business_name: string;
      description: string;
      artisan_story: string;
      studio_images: unknown;
      specialties: unknown;
      social_links: unknown;
      profile_video_url: string;
      logo_url: string;
      banner_url: string;
      city: string;
      state_province: string;
      country: string;
      total_sales: number;
      total_orders: number;
      average_rating: number;
      total_reviews: number;
      is_verified: boolean;
      created_at: string;
    }

    const sellers = await query(
      `SELECT id, store_name, store_slug, business_name, description, 
              artisan_story, studio_images, specialties, social_links, profile_video_url,
              logo_url, banner_url, city, state_province, country,
              is_verified, created_at
       FROM sellers 
       WHERE store_slug = ? AND status = 'approved'`,
      [slug]
    ) as Seller[];

    if (!sellers || sellers.length === 0) {
      return NextResponse.json({ error: 'Artisan not found' }, { status: 404 });
    }

    const seller = sellers[0];

    // 2. Fetch their active products
    const products = await query(
      `SELECT p.*, c.name as category_name, b.name as brand_name 
       FROM products p 
       LEFT JOIN categories c ON p.category_id = c.id 
       LEFT JOIN brands b ON p.brand_id = b.id 
       WHERE p.seller_id = ? AND p.is_active = TRUE
       ORDER BY p.created_at DESC`,
      [seller.id]
    );

    // 3. Fetch Dynamic Stats
    try {
      // Total Items Sold
      const soldResult = await query(
        'SELECT SUM(quantity)::float as total_sold FROM order_items WHERE seller_id = ?',
        [seller.id]
      ) as SellerStats[];
      seller.total_orders = Number(soldResult[0]?.total_sold || 0);

      // Average Rating & Review Count
      const reviewsResult = await query(
        'SELECT AVG(rating)::float as avg_rating, COUNT(*)::int as total_reviews FROM seller_reviews WHERE seller_id = ? AND is_visible = TRUE',
        [seller.id]
      ) as SellerStats[];
      seller.average_rating = Number(reviewsResult[0]?.avg_rating || 0);
      seller.total_reviews = Number(reviewsResult[0]?.total_reviews || 0);
      
      // Total Sales Revenue
      const salesResult = await query(
        'SELECT SUM(total_price)::float as revenue FROM order_items WHERE seller_id = ?',
        [seller.id]
      ) as SellerStats[];
      seller.total_sales = Number(salesResult[0]?.revenue || 0);
    } catch (err) {
      console.error('Error fetching dynamic seller stats:', err);
    }

    // 4. Parse JSON fields
    if (seller.studio_images && typeof seller.studio_images === 'string') {
      try { seller.studio_images = JSON.parse(seller.studio_images); } catch { seller.studio_images = []; }
    }
    if (seller.specialties && typeof seller.specialties === 'string') {
      try { seller.specialties = JSON.parse(seller.specialties); } catch { seller.specialties = []; }
    }
    if (seller.social_links && typeof seller.social_links === 'string') {
      try { seller.social_links = JSON.parse(seller.social_links); } catch { seller.social_links = {}; }
    }

    return NextResponse.json({
      seller,
      products
    });
  } catch (error) {
    console.error('Public seller profile error:', error);
    return NextResponse.json({ error: 'Failed to load artisan profile' }, { status: 500 });
  }
}
