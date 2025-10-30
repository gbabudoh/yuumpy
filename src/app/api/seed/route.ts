import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    // First, let's check if we have any products
    const existingProducts = await query('SELECT COUNT(*) as count FROM products');
    
    if (existingProducts[0].count > 0) {
      return NextResponse.json({ 
        message: 'Database already has products', 
        count: existingProducts[0].count 
      });
    }

    // Insert sample products
    const sampleProducts = [
      {
        name: 'iPhone 15 Pro',
        slug: 'iphone-15-pro',
        description: 'Latest iPhone with advanced camera system, A17 Pro chip, and titanium design.',
        short_description: 'Premium smartphone with cutting-edge technology',
        price: 999.99,
        original_price: 1199.99,
        affiliate_url: 'https://apple.com/iphone-15-pro',
        image_url: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600',
        category_id: 2, // Electronics
        brand_id: 1, // Apple
        is_featured: true,
        is_bestseller: true,
        rating: 4.8,
        reviews: 1250
      },
      {
        name: 'Samsung Galaxy S24',
        slug: 'samsung-galaxy-s24',
        description: 'Powerful Android smartphone with AI features and premium camera system.',
        short_description: 'AI-powered smartphone with exceptional camera',
        price: 899.99,
        original_price: 1099.99,
        affiliate_url: 'https://samsung.com/galaxy-s24',
        image_url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600',
        category_id: 2, // Electronics
        brand_id: 2, // Samsung
        is_featured: true,
        is_bestseller: false,
        rating: 4.7,
        reviews: 980
      },
      {
        name: 'Nike Air Max 270',
        slug: 'nike-air-max-270',
        description: 'Comfortable running shoes with Max Air cushioning and modern design.',
        short_description: 'Comfortable running shoes with Max Air',
        price: 129.99,
        original_price: 159.99,
        affiliate_url: 'https://nike.com/air-max-270',
        image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600',
        category_id: 1, // Fashion
        brand_id: 3, // Nike
        is_featured: false,
        is_bestseller: true,
        rating: 4.5,
        reviews: 3200
      },
      {
        name: 'MacBook Pro M3',
        slug: 'macbook-pro-m3',
        description: 'Professional laptop with M3 chip, stunning display, and all-day battery life.',
        short_description: 'Professional laptop for creators and developers',
        price: 1999.99,
        original_price: 2299.99,
        affiliate_url: 'https://apple.com/macbook-pro',
        image_url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600',
        category_id: 2, // Electronics
        brand_id: 1, // Apple
        is_featured: true,
        is_bestseller: true,
        rating: 4.9,
        reviews: 2100
      },
      {
        name: 'Sony WH-1000XM5 Headphones',
        slug: 'sony-wh-1000xm5',
        description: 'Industry-leading noise canceling wireless headphones with exceptional sound quality.',
        short_description: 'Premium noise-canceling headphones',
        price: 399.99,
        original_price: 499.99,
        affiliate_url: 'https://sony.com/wh-1000xm5',
        image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600',
        category_id: 2, // Electronics
        brand_id: 5, // Sony
        is_featured: false,
        is_bestseller: true,
        rating: 4.6,
        reviews: 850
      }
    ];

    // Insert products
    for (const product of sampleProducts) {
      const sql = `
        INSERT INTO products (
          name, slug, description, short_description, price, original_price,
          affiliate_url, image_url, category_id, brand_id, is_featured, is_bestseller,
          rating, reviews
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      await query(sql, [
        product.name, product.slug, product.description, product.short_description,
        product.price, product.original_price, product.affiliate_url, product.image_url,
        product.category_id, product.brand_id, product.is_featured, product.is_bestseller,
        product.rating, product.reviews
      ]);
    }

    return NextResponse.json({ 
      message: 'Sample products added successfully',
      count: sampleProducts.length
    });

  } catch (error) {
    console.error('Error seeding database:', error);
    return NextResponse.json(
      { error: 'Failed to seed database' },
      { status: 500 }
    );
  }
}
