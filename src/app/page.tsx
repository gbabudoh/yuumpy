'use client';

import { StarIcon, ArrowTrendingUpIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useEffect, useState } from 'react';

// Components
import Header from '@/components/Header';
import BannerAd from '@/components/BannerAd';
import ProductCard from '@/components/ProductCard';
import CategoryCard from '@/components/CategoryCard';
import Footer from '@/components/Footer';

interface Product {
  id: number;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  image_url: string;
  isFeatured: boolean;
  isBestseller: boolean;
  affiliate_url?: string;
}

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  image_url?: string;
  icon_url?: string;
  product_count: number;
  is_active: boolean;
}

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch featured products
        const productsResponse = await fetch('/api/products?featured=true');
        if (productsResponse.ok) {
          const productsData = await productsResponse.json();
          const products = Array.isArray(productsData) ? productsData : (productsData.products || []);
          
          const mappedProducts = products.map((product: any) => ({
            id: product.id,
            name: product.name,
            slug: product.slug,
            price: parseFloat(product.price) || 0,
            originalPrice: product.original_price ? parseFloat(product.original_price) : undefined,
            image_url: product.image_url || '',
            isFeatured: Boolean(product.is_featured),
            isBestseller: Boolean(product.is_bestseller),
            affiliate_url: product.affiliate_url,
            purchase_type: product.purchase_type,
            product_condition: product.product_condition
          }));
          
          setFeaturedProducts(mappedProducts);
        }

        // Fetch categories
        const categoriesResponse = await fetch('/api/categories?parent_only=true');
        if (categoriesResponse.ok) {
          const categoriesData = await categoriesResponse.json();
          const mappedCategories = categoriesData.map((category: any) => ({
            id: category.id,
            name: category.name,
            slug: category.slug,
            description: category.description,
            image_url: category.image_url,
            icon_url: category.icon_url,
            product_count: category.product_count || 0,
            is_active: category.is_active
          }));
          
          setCategories(mappedCategories);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const bestsellers = featuredProducts.filter(p => p.isBestseller);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Banner Ad Section */}
      <BannerAd />

      {/* Categories Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Shop by Category
            </h2>
            <p className="text-gray-600 text-lg">
              Explore our wide range of product categories
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 md:gap-6">
            {categories.length > 0 ? (
              categories.map((category) => (
                <CategoryCard key={category.id} category={category} />
              ))
            ) : (
              <div className="col-span-full text-center py-8">
                <p className="text-gray-500">No categories found. Please check your database connection.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Featured Products
              </h2>
              <p className="text-gray-600 text-lg">
                Handpicked products just for you
              </p>
            </div>
            <Link 
              href="/products?featured=true" 
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold"
            >
              View All
              <ArrowTrendingUpIcon className="w-5 h-5" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
            {featuredProducts.length > 0 ? (
              featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            ) : (
              <div className="col-span-full text-center py-8">
                <p className="text-gray-500">No featured products found. Please check your database connection.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Best Sellers */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Best Sellers
              </h2>
              <p className="text-gray-600 text-lg">
                Our most popular products
              </p>
            </div>
            <Link 
              href="/products?bestseller=true" 
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold"
            >
              View All
              <StarIcon className="w-5 h-5" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
            {bestsellers.length > 0 ? (
              bestsellers.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            ) : (
              <div className="col-span-full text-center py-8">
                <p className="text-gray-500">No bestseller products found. Please check your database connection.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
