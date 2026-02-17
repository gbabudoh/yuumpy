'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { ExternalLink, Shield } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductBannerAd from '@/components/ProductBannerAd';
import ProductTabs from '@/components/ProductTabs';
import ProductImageGallery from '@/components/ProductImageGallery';
import AddToCartButton from '@/components/AddToCartButton';
import { generateStructuredData } from '@/lib/seo';
import { Product, ColorOption, ProductVariation } from '@/types/product';

interface ProductDetailViewProps {
  product: Product;
}

export default function ProductDetailView({ product }: ProductDetailViewProps) {
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
      { name: product.category_name, url: `${baseUrl}/products/${product.category_slug}` },
      { name: product.name, url: `${baseUrl}/products/${product.slug}` },
    ] });

  const discountPercentage = product.original_price 
    ? Math.round(((Number(product.original_price) - Number(product.price)) / Number(product.original_price)) * 100)
    : 0;

  const fallbackImage = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600';
  const mainImage = product.image_url || fallbackImage;
  
  // Parse gallery from JSON string if it exists
  const galleryImages = useMemo(() => {
    if (product.gallery) {
      try {
        const parsed = typeof product.gallery === 'string' ? JSON.parse(product.gallery) : product.gallery;
        return Array.isArray(parsed) ? parsed.filter((img: string) => img && img.trim() !== '') : [];
      } catch (e) {
        console.error('Failed to parse gallery:', e);
        return [];
      }
    }
    return [];
  }, [product.gallery]);
  
  // Parse colors (legacy support)
  const productColors = useMemo(() => {
    if (product.colors) {
      try {
        const parsed = typeof product.colors === 'string' ? JSON.parse(product.colors) : product.colors;
        if (Array.isArray(parsed)) {
          return parsed.map(c => {
            if (typeof c === 'string') return { name: c };
            return c as ColorOption;
          }).filter(c => c.name && c.name.trim() !== '');
        }
      } catch (e) {
        console.error('Failed to parse colors:', e);
        return [];
      }
    }
    return [];
  }, [product.colors]);

  // Parse new variations (from product_variations table)
  const productVariations: ProductVariation[] = useMemo(() => {
    if (product.variations && Array.isArray(product.variations)) {
      return product.variations;
    }
    return [];
  }, [product.variations]);

  // Use variations if available, otherwise fall back to legacy colors
  const hasVariations = productVariations.length > 0;

  // State for selected colors
  const [selectedColors, setSelectedColors] = useState<string[]>(
    hasVariations
      ? (productVariations.length > 0 ? [productVariations[0].colour_name] : [])
      : (productColors.length > 0 ? [productColors[0].name] : [])
  );

  // State for active gallery color
  const [activeGalleryColor, setActiveGalleryColor] = useState<string | null>(
    hasVariations
      ? (productVariations.length > 0 ? productVariations[0].colour_name : null)
      : (productColors.length > 0 ? productColors[0].name : null)
  );

  const toggleColor = (color: string) => {
    setSelectedColors(prev => 
      prev.includes(color) 
        ? prev.filter(c => c !== color) 
        : [...prev, color]
    );
    setActiveGalleryColor(color);
  };

  // Get current images based on active color
  const images = useMemo(() => {
    if (hasVariations) {
      const activeVariation = productVariations.find(v => v.colour_name === activeGalleryColor);
      if (activeVariation) {
        const varImages: string[] = [];
        if (activeVariation.main_image_url) varImages.push(activeVariation.main_image_url);
        if (activeVariation.gallery_images && Array.isArray(activeVariation.gallery_images)) {
          varImages.push(...activeVariation.gallery_images);
        }
        if (varImages.length > 0) return varImages;
      }
      // Fallback to default product images
      return [mainImage, ...galleryImages];
    }

    // Legacy color system
    const activeColor = productColors.find(c => c.name === activeGalleryColor);
    if (!activeColor) return [mainImage, ...galleryImages];

    const hasSpecificImage = activeColor.image_url && activeColor.image_url.trim() !== '';
    let colorGallery: string[] = [];
    if (activeColor.gallery) {
      try {
        const parsed = typeof activeColor.gallery === 'string' ? JSON.parse(activeColor.gallery) : activeColor.gallery;
        colorGallery = Array.isArray(parsed) ? parsed.filter((img: string) => img && img.trim() !== '') : [];
      } catch (e) {
        console.error('Failed to parse color gallery:', e);
      }
    }

    if (hasSpecificImage || colorGallery.length > 0) {
      const colorMain = activeColor.image_url || mainImage;
      return [colorMain, ...colorGallery].filter((img: string) => img && img.trim() !== '');
    }
    return [mainImage, ...galleryImages];
  }, [activeGalleryColor, productVariations, productColors, mainImage, galleryImages, hasVariations]);



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
                href={`/products/${product.category_slug}`} 
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
                href={`/products/${product.category_slug}`}
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

            {/* Color Selection - New Variations (colour swatches) */}
            {hasVariations && productVariations.length > 0 && (
              <div className="py-3">
                <h3 className="text-sm font-medium text-gray-900 mb-2">
                  Colour: <span className="text-gray-600 font-normal">
                    {activeGalleryColor || 'Select a colour'}
                  </span>
                </h3>
                <div className="flex flex-wrap gap-3">
                  {productVariations.map((variation) => (
                    <button
                      key={variation.id || variation.colour_name}
                      onClick={() => toggleColor(variation.colour_name)}
                      className={`group relative cursor-pointer`}
                      title={variation.colour_name}
                    >
                      <span
                        className={`block w-10 h-10 rounded-full border-2 transition-all ${
                          activeGalleryColor === variation.colour_name
                            ? 'border-purple-600 ring-2 ring-purple-300 ring-offset-1 scale-110'
                            : 'border-gray-300 hover:border-gray-400 hover:scale-105'
                        }`}
                        style={{ backgroundColor: variation.colour_hex || '#ccc' }}
                      />
                      {selectedColors.includes(variation.colour_name) && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-purple-600 rounded-full flex items-center justify-center">
                          <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </span>
                      )}
                      <span className="block text-xs text-center mt-1 text-gray-600">{variation.colour_name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Color Selection - Legacy (text buttons) */}
            {!hasVariations && productColors.length > 0 && (
              <div className="py-3">
                <h3 className="text-sm font-medium text-gray-900 mb-2">
                  Select Colors: <span className="text-gray-600 font-normal">
                    {selectedColors.length > 0 ? selectedColors.join(', ') : 'None selected'}
                  </span>
                </h3>
                <div className="flex flex-wrap gap-2">
                  {productColors.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => toggleColor(color.name)}
                      onMouseEnter={() => setActiveGalleryColor(color.name)}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                        selectedColors.includes(color.name)
                          ? 'bg-purple-600 text-white ring-2 ring-purple-600 ring-offset-2'
                          : 'bg-white text-gray-900 border border-gray-300 hover:bg-gray-50'
                      } ${activeGalleryColor === color.name ? 'border-purple-400' : ''}`}
                    >
                      {color.name}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2 italic">
                  * You can select multiple colors to add them to your cart at once.
                </p>
              </div>
            )}

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
            <AddToCartButton 
              product={product} 
              isDirectSale={product.purchase_type === 'direct' || !product.affiliate_url}
              selectedColors={selectedColors}
            />

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
