import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ExternalLink, Shield } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductBannerAd from '@/components/ProductBannerAd';
import ProductTabs from '@/components/ProductTabs';
import ProductImageGallery from '@/components/ProductImageGallery';
import { generateMetadata as generateSEOMetadata, generateStructuredData } from '@/lib/seo';
import { query } from '@/lib/database';

interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  short_description: string;
  long_description?: string;
  product_review?: string;
  price: number;
  original_price?: number;
  affiliate_url: string;
  affiliate_partner_name?: string;
  external_purchase_info?: string;
  purchase_type?: 'affiliate' | 'direct';
  product_condition?: 'new' | 'refurbished' | 'used';
  stock_quantity?: number;
  image_url: string;
  gallery?: string | string[];
  category_name: string;
  category_slug: string;
  brand_name?: string;
  brand_slug?: string;
  is_featured: boolean;
  is_bestseller: boolean;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
  og_title?: string;
  og_description?: string;
  og_image?: string;
  twitter_title?: string;
  twitter_description?: string;
  twitter_image?: string;
  no_index?: boolean;
  no_follow?: boolean;
  banner_ad_title?: string;
  banner_ad_description?: string;
  banner_ad_image_url?: string;
  banner_ad_link_url?: string;
  banner_ad_duration?: number;
  banner_ad_is_repeating?: boolean;
  banner_ad_start_date?: string;
  banner_ad_end_date?: string;
  banner_ad_is_active?: boolean;
}

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  try {
    const { slug } = await params;
    const product = await getProduct(slug);
    
    if (!product) {
      return {
        title: 'Product Not Found | Yuumpy',
        description: 'The product you are looking for could not be found.' };
    }

    // Get SEO data for this product
    const seoData = await getProductSEO(product.id);
    
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yuumpy.com';
    
    return generateSEOMetadata({
      title: seoData?.meta_title || product.name,
      description: seoData?.meta_description || product.short_description || product.description,
      keywords: seoData?.meta_keywords || `${product.name}, ${product.category_name}, ${product.brand_name || ''}`.trim(),
      canonical: `${baseUrl}/products/${product.slug}`,
      ogTitle: seoData?.og_title || product.name,
      ogDescription: seoData?.og_description || product.short_description || product.description,
      ogImage: seoData?.og_image || product.image_url,
      twitterTitle: seoData?.twitter_title || product.name,
      twitterDescription: seoData?.twitter_description || product.short_description || product.description,
      twitterImage: seoData?.twitter_image || product.image_url,
      noIndex: seoData?.no_index || false,
      noFollow: seoData?.no_follow || false });
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Product | Yuumpy',
      description: 'Discover amazing products from our curated collection.' };
  }
}

async function getProduct(slug: string): Promise<Product | null> {
  try {
    const sql = `
      SELECT p.*, 
             c.name as category_name, c.slug as category_slug,
             b.name as brand_name, b.slug as brand_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN brands b ON p.brand_id = b.id
      WHERE p.slug = ? AND p.is_active = 1
    `;
    const result = await query(sql, [slug]);
    return Array.isArray(result) && result.length > 0 ? (result[0] as Product) : null;
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
}

async function getProductSEO(productId: number) {
  const sql = 'SELECT * FROM product_seo WHERE product_id = ?';
  const result = await query(sql, [productId]);
  return Array.isArray(result) && result.length > 0 ? (result[0] as any) : null;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProduct(slug);
  
  if (!product) {
    notFound();
  }

  const seoData = await getProductSEO(product.id);
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yuumpy.com';
  
  // Generate structured data
  const productSchema = generateStructuredData('product', {
    ...product,
    rating: 4.5, // You can add actual rating system later
    review_count: 10, // You can add actual review system later
  });

  const breadcrumbSchema = generateStructuredData('breadcrumb', {
    items: [
      { name: 'Home', url: baseUrl },
      { name: 'Products', url: `${baseUrl}/products` },
      { name: product.category_name, url: `${baseUrl}/categories/${product.category_slug}` },
      { name: product.name, url: `${baseUrl}/products/${product.slug}` },
    ] });

  const discountPercentage = product.original_price 
    ? Math.round(((Number(product.original_price) - Number(product.price)) / Number(product.original_price)) * 100)
    : 0;

  const fallbackImage = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600';
  const mainImage = product.image_url || fallbackImage;
  
  // Parse gallery from JSON string if it exists
  let galleryImages: string[] = [];
  if (product.gallery) {
    try {
      const parsed = typeof product.gallery === 'string' ? JSON.parse(product.gallery) : product.gallery;
      galleryImages = Array.isArray(parsed) ? parsed.filter(img => img && img.trim() !== '') : [];
    } catch (e) {
      console.error('Failed to parse gallery:', e);
      galleryImages = [];
    }
  }
  
  const images = [mainImage, ...galleryImages];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Structured Data */}
      {productSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(productSchema) }}
        />
      )}
      {breadcrumbSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(breadcrumbSchema) }}
        />
      )}

      <Header />
      
      <div className="container mx-auto px-4 py-4 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12">
          {/* Product Images */}
          <div>
            <ProductImageGallery images={images} productName={product.name} />
          </div>

          {/* Product Info */}
          <div className="space-y-4 md:space-y-6">
            {/* Breadcrumb - Hidden on mobile */}
            <nav className="hidden md:flex items-center space-x-2 text-sm">
              <Link href="/" className="text-gray-500 hover:text-blue-600 transition-colors">
                Home
              </Link>
              <span className="text-gray-300">/</span>
              <Link href="/products" className="text-gray-500 hover:text-blue-600 transition-colors">
                Products
              </Link>
              <span className="text-gray-300">/</span>
              <Link 
                href={`/categories/${product.category_slug}`} 
                className="text-gray-500 hover:text-blue-600 transition-colors"
              >
                {product.category_name.replace(/00/g, '')}
              </Link>
              <span className="text-gray-300">/</span>
              <span className="text-gray-900 font-medium truncate">{product.name}</span>
            </nav>

            {/* Layer 1: Category & Status Badges */}
            <div className="flex items-center gap-2 flex-wrap pb-3 md:pb-4 border-b border-gray-100">
              <Link 
                href={`/categories/${product.category_slug}`}
                className="inline-flex items-center px-3 py-1 rounded-md text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              >
                {product.category_name.replace(/00/g, '')}
              </Link>
              {(!product.product_condition || product.product_condition === 'new') && (
                <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-semibold bg-green-100 text-green-800">
                  New
                </span>
              )}
              {product.product_condition === 'refurbished' && (
                <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-semibold bg-blue-100 text-blue-800">
                  Refurbished
                </span>
              )}
              {product.product_condition === 'used' && (
                <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-semibold bg-amber-100 text-amber-800">
                  Used
                </span>
              )}
              {Boolean(product.is_featured) && (
                <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-semibold bg-amber-500 text-white">
                  Featured
                </span>
              )}
              {Boolean(product.is_bestseller) && (
                <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-semibold bg-green-600 text-white">
                  Bestseller
                </span>
              )}
            </div>

            {/* Layer 2: Product Title */}
            <div className="py-2 md:py-3">
              <h1 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900 leading-tight">
                {product.name}
              </h1>
            </div>

            {/* Layer 3: Price Section */}
            <div className="py-3 md:py-4 border-y border-gray-200">
              <div className="flex items-baseline gap-3 md:gap-4 flex-wrap">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl md:text-3xl font-bold text-gray-900">
                    £{Number(product.price).toFixed(2)}
                  </span>
                  {product.original_price && (
                    <span className="text-base md:text-lg text-gray-400 line-through">
                      £{Number(product.original_price).toFixed(2)}
                    </span>
                  )}
                </div>
                {product.original_price && (
                  <span className="inline-flex items-center px-2.5 md:px-3 py-1 md:py-1.5 rounded-md text-xs font-bold bg-red-600 text-white">
                    Save {discountPercentage}%</span>
                )}
              </div>
            </div>

            {/* Layer 4: Short Description */}
            <div className="py-3 md:py-4">
              <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                {product.short_description}
              </p>
            </div>

            {/* Stock Availability for Direct Sale Products */}
            {(product.purchase_type === 'direct' || !product.affiliate_url) && (
              <div className="py-2">
                {product.stock_quantity !== null && product.stock_quantity !== undefined ? (
                  product.stock_quantity > 0 ? (
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center px-3 py-1.5 rounded-md text-sm font-semibold bg-green-100 text-green-800">
                        <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        In Stock
                      </span>
                      <span className="text-sm text-gray-600">
                        ({product.stock_quantity} available)
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center px-3 py-1.5 rounded-md text-sm font-semibold bg-red-100 text-red-800">
                        <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        Out of Stock
                      </span>
                    </div>
                  )
                ) : (
                  <span className="inline-flex items-center px-3 py-1.5 rounded-md text-sm font-semibold bg-green-100 text-green-800">
                    <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    In Stock
                  </span>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="space-y-3 md:space-y-4">
              {(product.purchase_type === 'direct' || !product.affiliate_url) ? (
                product.stock_quantity === null || product.stock_quantity === undefined || product.stock_quantity > 0 ? (
                  <Link
                    href={`/checkout/${product.slug}`}
                    className="w-full text-white py-3 md:py-4 px-6 rounded-lg font-semibold text-base md:text-lg transition-colors flex items-center justify-center space-x-2 cursor-pointer hover:opacity-90"
                    style={{ backgroundColor: '#16a34a' }}
                  >
                    <span>Buy Now</span>
                    <Shield className="w-4 h-4 md:w-5 md:h-5" />
                  </Link>
                ) : (
                  <button
                    disabled
                    className="w-full text-white py-3 md:py-4 px-6 rounded-lg font-semibold text-base md:text-lg flex items-center justify-center space-x-2 cursor-not-allowed bg-gray-400"
                  >
                    <span>Out of Stock</span>
                  </button>
                )
              ) : (
                <a
                  href={product.affiliate_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full text-white py-3 md:py-4 px-6 rounded-lg font-semibold text-base md:text-lg transition-colors flex items-center justify-center space-x-2 cursor-pointer hover:bg-purple-700"
                  style={{ backgroundColor: '#8827ee' }}
                >
                  <span>Buy Now</span>
                  <ExternalLink className="w-4 h-4 md:w-5 md:h-5" />
                </a>
              )}
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
              {(product.purchase_type === 'direct' || !product.affiliate_url) ? (
                <>
                  <div className="flex items-start space-x-3 p-3 md:p-4 bg-green-50 rounded-lg">
                    <Shield className="w-5 h-5 md:w-6 md:h-6 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-sm md:text-base text-gray-900">Secure Checkout</h4>
                      <p className="text-xs md:text-sm text-gray-600 mt-1">
                        Pay securely with Stripe on Yuumpy
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 p-3 md:p-4 bg-green-50 rounded-lg">
                    <Shield className="w-5 h-5 md:w-6 md:h-6 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-sm md:text-base text-gray-900">Order Tracking</h4>
                      <p className="text-xs md:text-sm text-gray-600 mt-1">
                        Track your order status in your account
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-start space-x-3 p-3 md:p-4 bg-blue-50 rounded-lg">
                    <Shield className="w-5 h-5 md:w-6 md:h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-sm md:text-base text-gray-900">Affiliate Partner</h4>
                      <p className="text-xs md:text-sm text-gray-600 mt-1">
                        {product.affiliate_partner_name || 'This product is sold by our trusted affiliate partner'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 p-3 md:p-4 bg-orange-50 rounded-lg">
                    <ExternalLink className="w-5 h-5 md:w-6 md:h-6 text-orange-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-sm md:text-base text-gray-900">External Purchase</h4>
                      <p className="text-xs md:text-sm text-gray-600 mt-1">
                        {product.external_purchase_info || 'You will be redirected to complete your purchase'}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Product Banner Ad */}
            {product.banner_ad_title && (
              <ProductBannerAd 
                bannerAd={{
                  title: product.banner_ad_title,
                  description: product.banner_ad_description,
                  image_url: product.banner_ad_image_url,
                  link_url: product.banner_ad_link_url,
                  duration: product.banner_ad_duration?.toString(),
                  is_repeating: product.banner_ad_is_repeating,
                  start_date: product.banner_ad_start_date,
                  end_date: product.banner_ad_end_date,
                  is_active: product.banner_ad_is_active
                }}
              />
            )}
          </div>
        </div>

        {/* Product Details Tabs */}
        <ProductTabs 
          longDescription={product.long_description}
          productReview={product.product_review}
        />
      </div>

      <Footer />
    </div>
  );
}