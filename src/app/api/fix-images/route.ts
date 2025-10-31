import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

// Sample product images from Unsplash
const productImages = [
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=500&fit=crop',
  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop',
  'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500&h=500&fit=crop',
  'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=500&h=500&fit=crop',
  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&h=500&fit=crop',
  'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500&h=500&fit=crop',
  'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=500&h=500&fit=crop',
  'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=500&h=500&fit=crop',
  'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=500&h=500&fit=crop',
  'https://images.unsplash.com/photo-1503602642458-232111445657?w=500&h=500&fit=crop',
  'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=500&h=500&fit=crop',
  'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500&h=500&fit=crop',
  'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&h=500&fit=crop',
  'https://images.unsplash.com/photo-1512374382149-233c42b6a83b?w=500&h=500&fit=crop',
  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&h=500&fit=crop'
];

// Category icons (emoji-based)
const categoryIcons: { [key: string]: string } = {
  'electronics': '📱',
  'fashion': '👗',
  'home-garden': '🏠',
  'sports': '⚽',
  'books': '📚',
  'toys': '🧸',
  'beauty': '💄',
  'automotive': '🚗',
  'health': '💊',
  'jewelry': '💍',
  'music': '🎵',
  'office': '🏢',
  'pet-supplies': '🐕',
  'travel': '✈️',
  'food': '🍕'
};

export async function POST(request: NextRequest) {
  try {
    const results = {
      productsUpdated: 0,
      categoriesUpdated: 0,
      errors: [] as string[]
    };

    // Fix product images
    try {
      const products = await query('SELECT id, name, image_url FROM products') as any[];
      
      for (let i = 0; i < products.length; i++) {
        const product = products[i];
        const newImageUrl = productImages[i % productImages.length];
        
        await query(
          'UPDATE products SET image_url = ? WHERE id = ?',
          [newImageUrl, product.id]
        );
        
        results.productsUpdated++;
      }
    } catch (error) {
      results.errors.push(`Product images error: ${error.message}`);
    }

    // Fix category icons
    try {
      const categories = await query('SELECT id, name, slug, icon_url FROM categories') as any[];
      
      for (const category of categories) {
        // Try to match category slug to our icon mapping
        let icon = categoryIcons[category.slug];
        
        // If no exact match, use a generic icon based on common keywords
        if (!icon) {
          const name = category.name.toLowerCase();
          if (name.includes('electronic') || name.includes('phone') || name.includes('computer')) {
            icon = '📱';
          } else if (name.includes('fashion') || name.includes('clothing') || name.includes('apparel')) {
            icon = '👗';
          } else if (name.includes('home') || name.includes('garden') || name.includes('furniture')) {
            icon = '🏠';
          } else if (name.includes('sport') || name.includes('fitness') || name.includes('outdoor')) {
            icon = '⚽';
          } else if (name.includes('book') || name.includes('education') || name.includes('learning')) {
            icon = '📚';
          } else if (name.includes('toy') || name.includes('game') || name.includes('kid')) {
            icon = '🧸';
          } else if (name.includes('beauty') || name.includes('cosmetic') || name.includes('skincare')) {
            icon = '💄';
          } else if (name.includes('car') || name.includes('auto') || name.includes('vehicle')) {
            icon = '🚗';
          } else if (name.includes('health') || name.includes('medical') || name.includes('wellness')) {
            icon = '💊';
          } else if (name.includes('jewelry') || name.includes('accessory') || name.includes('watch')) {
            icon = '💍';
          } else {
            icon = '🛍️'; // Default shopping icon
          }
        }
        
        await query(
          'UPDATE categories SET icon_url = ? WHERE id = ?',
          [icon, category.id]
        );
        
        results.categoriesUpdated++;
      }
    } catch (error) {
      results.errors.push(`Category icons error: ${error.message}`);
    }

    return NextResponse.json({
      success: true,
      message: 'Images and icons have been fixed!',
      results
    });

  } catch (error) {
    console.error('Error fixing images:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fix images',
        details: error.message
      },
      { status: 500 }
    );
  }
}