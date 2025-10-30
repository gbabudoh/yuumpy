import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ExternalLink, Shield } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductBannerAd from '@/components/ProductBannerAd';
import { generateMetadata as generateSEOMetadata, generateStructuredData } from '@/lib/seo';
import { query } from '@/lib/database';

interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  short_description: string;
  price: number;
  original_price?: number;
  affiliate_url: string;
  affiliate_partner_name?: string;
  external_purchase_info?: string;
  image_url: string;
  gallery?: string[];
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
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  try {
    const product = await getProduct(params.slug);
    
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
  const product = await getProduct(params.slug);
  
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
  const galleryImages = product.gallery?.filter(img => img && img.trim() !== '') || [];
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
      
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="aspect-square bg-white rounded-xl shadow-lg overflow-hidden">
              <Image
                src={images[0] || fallbackImage}
                alt={product.name}
                width={600}
                height={600}
                className="w-full h-full object-cover"
                priority
              />
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Breadcrumb */}
            <nav className="flex items-center space-x-2 text-sm text-gray-600">
              <Link href="/" className="hover:text-blue-600">Home</Link>
              <span>/</span>
              <Link href="/products" className="hover:text-blue-600">Products</Link>
              <span>/</span>
              <Link href={`/categories/${product.category_slug}`} className="hover:text-blue-600">
                {product.category_name}
              </Link>
              <span>/</span>
              <span className="text-gray-900">{product.name}</span>
            </nav>

            {/* Product Title */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
            </div>

            {/* Price */}
            <div className="flex items-center space-x-4">
              <span className="text-4xl font-bold text-gray-900">
                £{Number(product.price).toFixed(2)}
              </span>
              {product.original_price && (
                <>
                  <span className="text-2xl text-gray-500 line-through">
                    £{Number(product.original_price).toFixed(2)}
                  </span>
                  <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-sm font-semibold">
                    Save {discountPercentage}%
                  </span>
                </>
              )}
            </div>

            {/* Short Description */}
            <p className="text-lg text-gray-700">{product.short_description}</p>

            {/* Actions */}
            <div className="space-y-4">
              <div className="flex space-x-4">
                <a
                  href={product.affiliate_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 text-white py-4 px-6 rounded-lg font-semibold text-lg transition-colors flex items-center justify-center space-x-2 cursor-pointer hover:bg-purple-700"
                  style={{ backgroundColor: '#8827ee' }}
                >
                  <span>Buy Now</span>
                  <ExternalLink className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg">
                <Shield className="w-6 h-6 text-blue-600" />
                <div>
                  <h4 className="font-semibold text-gray-900">Affiliate Partner</h4>
                  <p className="text-sm text-gray-600">
                    {product.affiliate_partner_name || 'This product is sold by our trusted affiliate partner'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-4 bg-orange-50 rounded-lg">
                <ExternalLink className="w-6 h-6 text-orange-600" />
                <div>
                  <h4 className="font-semibold text-gray-900">External Purchase</h4>
                  <p className="text-sm text-gray-600">
                    {product.external_purchase_info || 'You will be redirected to complete your purchase'}
                  </p>
                </div>
              </div>
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

        {/* Product Description */}
        <div className="mt-16">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Product Description</h2>
            <div className="prose max-w-none">
              <p className="text-gray-700 leading-relaxed">{product.description}</p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}