import { StarIcon, ArrowTrendingUpIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

// Components
import Header from '@/components/Header';
import BannerAd from '@/components/BannerAd';
import ProductCard from '@/components/ProductCard';
import CategoryCard from '@/components/CategoryCard';
import Footer from '@/components/Footer';

// Fetch featured products from API
async function getFeaturedProducts() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/products?featured=true`, {
      cache: 'no-store'
    });
    
    if (response.ok) {
      const data = await response.json();
      const products = Array.isArray(data) ? data : (data.products || []);
      
      return products.map((product: any) => ({
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: parseFloat(product.price) || 0,
        originalPrice: product.original_price ? parseFloat(product.original_price) : undefined,
        image_url: product.image_url || '',
        isFeatured: Boolean(product.is_featured),
        isBestseller: Boolean(product.is_bestseller)
      }));
    }
  } catch (error) {
    console.error('Error fetching featured products:', error);
  }
  
  // Fallback to empty array if API fails
  return [];
}

async function getCategories() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/categories?parent_only=true`, {
      cache: 'no-store'
    });
    
    if (response.ok) {
      const categories = await response.json();
      return categories.map((category: any) => ({
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description,
        image_url: category.image_url,
        icon_url: category.icon_url,
        product_count: category.product_count || 0,
        is_active: category.is_active
      }));
    }
  } catch (error) {
    console.error('Error fetching categories:', error);
  }
  
  // Fallback to empty array if API fails
  return [];
}


export default async function Home() {
  const featuredProducts = await getFeaturedProducts();
  const categories = await getCategories();
  const bestsellers = featuredProducts.filter(p => p.isBestseller);

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
            {categories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
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
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
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
            {bestsellers.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
