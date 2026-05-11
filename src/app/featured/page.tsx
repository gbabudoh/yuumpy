import React from 'react';
import { StarIcon, ArrowTrendingUpIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

// Components
import Header from '@/components/Header';
import ProductCard from '@/components/ProductCard';
import Footer from '@/components/Footer';
import { Product } from '@/types/product';

// Fetch featured products from API
async function getFeaturedProducts(): Promise<Product[]> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/products?featured=true`, {
      cache: 'no-store'
    });
    
    if (response.ok) {
      const data = await response.json();
      const products = Array.isArray(data) ? data : (data.products || []);
      
      return products.map((product: Product): Product => ({
        id: Number(product.id),
        name: product.name,
        slug: product.slug,
        description: product.description || '',
        short_description: product.short_description || '',
        price: Number(product.price) || 0,
        original_price: product.original_price ? Number(product.original_price) : undefined,
        image_url: product.image_url || '',
        category_name: product.category_name || '',
        category_slug: product.category_slug || '',
        is_featured: Boolean(product.is_featured),
        is_bestseller: Boolean(product.is_bestseller),
        is_active: true,
        affiliate_url: product.affiliate_url || '',
        purchase_type: product.purchase_type as Product['purchase_type'],
        product_condition: product.product_condition as Product['product_condition'],
        seller_store_name: product.seller_store_name,
        seller_store_slug: product.seller_store_slug,
        seller_city: product.seller_city,
        seller_country: product.seller_country,
        seller_processing_time: product.seller_processing_time
      }));
    }
  } catch (error) {
    console.error('Error fetching featured products:', error);
  }
  
  return [];
}

export default async function FeaturedPage() {
  const featuredProducts = await getFeaturedProducts();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center mb-4">
            <StarIcon className="w-12 h-12 text-yellow-400 mr-3" />
            <h1 className="text-4xl md:text-6xl font-bold">Featured Products</h1>
          </div>
          <p className="text-xl md:text-2xl text-blue-100 mb-8">
            Handpicked products that we love and recommend
          </p>
          <div className="flex items-center justify-center space-x-4 text-blue-200">
            <ArrowTrendingUpIcon className="w-6 h-6" />
            <span className="text-lg">Trending • Popular • Recommended</span>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Our Featured Collection
              </h2>
              <p className="text-gray-600 text-lg">
                {featuredProducts.length} carefully selected products just for you
              </p>
            </div>
            <Link 
              href="/products" 
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold"
            >
              View All Products
              <ArrowTrendingUpIcon className="w-5 h-5" />
            </Link>
          </div>

          {featuredProducts.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <StarIcon className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">No Featured Products</h3>
              <p className="text-gray-600 mb-8">
                We&apos;re currently updating our featured collection. Check back soon!
              </p>
              <Link 
                href="/products"
                className="text-white px-8 py-3 rounded-lg transition-colors hover:bg-purple-700 cursor-pointer"
                style={{ backgroundColor: '#8827ee' }}
              >
                Browse All Products
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-gray-100 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Looking for something specific?
          </h2>
          <p className="text-gray-600 text-lg mb-8">
            Browse our full catalog or search for exactly what you need
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/products"
              className="text-white px-8 py-3 rounded-lg transition-colors hover:bg-purple-700 cursor-pointer"
              style={{ backgroundColor: '#8827ee' }}
            >
              Browse All Products
            </Link>
            <Link 
              href="/categories"
              className="bg-white text-blue-600 border-2 border-blue-600 px-8 py-3 rounded-lg hover:bg-blue-50 transition-colors"
            >
              Shop by Category
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}