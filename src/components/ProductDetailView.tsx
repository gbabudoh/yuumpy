'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ExternalLink, Shield, MapPin, Package, Star, Store,
  ChevronRight, MessageCircle, ShieldCheck, Truck, RotateCcw, BadgeCheck, Sparkles, Globe
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductBannerAd from '@/components/ProductBannerAd';
import ProductTabs from '@/components/ProductTabs';
import ProductImageGallery from '@/components/ProductImageGallery';
import AddToCartButton from '@/components/AddToCartButton';
import SellerContact from '@/components/SellerContact';
import { generateStructuredData } from '@/lib/seo';
import { Product, ColorOption, ProductVariation } from '@/types/product';

interface ProductDetailViewProps {
  product: Product;
}

export default function ProductDetailView({ product }: ProductDetailViewProps) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yuumpy.com';

  const productSchema = generateStructuredData('product', {
    ...product, rating: 4.5, review_count: 10,
  });
  const breadcrumbSchema = generateStructuredData('breadcrumb', {
    items: [
      { name: 'Home', url: baseUrl },
      { name: 'Products', url: `${baseUrl}/products` },
      { name: product.category_name, url: `${baseUrl}/products/${product.category_slug}` },
      { name: product.name, url: product.seller_store_slug ? `${baseUrl}/products/${product.seller_store_slug}/${product.slug}` : `${baseUrl}/products/${product.slug}` },
    ],
  });

  const discountPercentage = product.original_price
    ? Math.round(((Number(product.original_price) - Number(product.price)) / Number(product.original_price)) * 100)
    : 0;

  const fallbackImage = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600';
  const mainImage = product.image_url || fallbackImage;

  const galleryImages = useMemo(() => {
    if (product.gallery) {
      try {
        const parsed = typeof product.gallery === 'string' ? JSON.parse(product.gallery) : product.gallery;
        return Array.isArray(parsed) ? parsed.filter((img: string) => img && img.trim() !== '') : [];
      } catch { return []; }
    }
    return [];
  }, [product.gallery]);

  const productColors = useMemo(() => {
    if (product.colors) {
      try {
        const parsed = typeof product.colors === 'string' ? JSON.parse(product.colors) : product.colors;
        if (Array.isArray(parsed)) {
          return parsed.map(c => typeof c === 'string' ? { name: c } : c as ColorOption).filter(c => c.name && c.name.trim() !== '');
        }
      } catch { return []; }
    }
    return [];
  }, [product.colors]);

  const productVariations: ProductVariation[] = useMemo(() => {
    if (product.variations && Array.isArray(product.variations)) return product.variations;
    return [];
  }, [product.variations]);

  const hasVariations = productVariations.length > 0;

  const [selectedColors, setSelectedColors] = useState<string[]>(
    hasVariations
      ? (productVariations.length > 0 ? [productVariations[0].colour_name] : [])
      : (productColors.length > 0 ? [productColors[0].name] : [])
  );
  const [activeGalleryColor, setActiveGalleryColor] = useState<string | null>(
    hasVariations
      ? (productVariations.length > 0 ? productVariations[0].colour_name : null)
      : (productColors.length > 0 ? productColors[0].name : null)
  );

  const toggleColor = (color: string) => {
    setSelectedColors([color]);
    setActiveGalleryColor(color);
  };

  const images = useMemo(() => {
    if (hasVariations) {
      const av = productVariations.find(v => v.colour_name === activeGalleryColor);
      if (av) {
        const vi: string[] = [];
        if (av.main_image_url) vi.push(av.main_image_url);
        if (av.gallery_images && Array.isArray(av.gallery_images)) vi.push(...av.gallery_images);
        if (vi.length > 0) return vi;
      }
      return [mainImage, ...galleryImages];
    }
    const ac = productColors.find(c => c.name === activeGalleryColor);
    if (!ac) return [mainImage, ...galleryImages];
    const hasImg = ac.image_url && ac.image_url.trim() !== '';
    let cg: string[] = [];
    if (ac.gallery) {
      try {
        const p = typeof ac.gallery === 'string' ? JSON.parse(ac.gallery) : ac.gallery;
        cg = Array.isArray(p) ? p.filter((i: string) => i && i.trim() !== '') : [];
      } catch { /* ignore */ }
    }
    if (hasImg || cg.length > 0) {
      return [ac.image_url || mainImage, ...cg].filter((i: string) => i && i.trim() !== '');
    }
    return [mainImage, ...galleryImages];
  }, [activeGalleryColor, productVariations, productColors, mainImage, galleryImages, hasVariations]);

  // Seller data
  const seller = product.seller_id && product.seller_store_name ? {
    store_name: product.seller_store_name,
    store_slug: product.seller_store_slug || '',
    logo_url: product.seller_logo_url,
    city: product.seller_city,
    state_province: product.seller_state_province,
    country: product.seller_country,
    total_orders: product.seller_total_orders || 0,
    average_rating: product.seller_average_rating || 0,
    total_reviews: product.seller_total_reviews || 0,
    is_verified: product.seller_is_verified || false,
  } : {
    store_name: 'Yuumpy Store',
    store_slug: '',
    logo_url: undefined as string | undefined,
    city: 'Toronto',
    state_province: 'Ontario',
    country: 'Canada',
    total_orders: 0,
    average_rating: 0,
    total_reviews: 0,
    is_verified: true,
  };

  const sellerLocation = [seller.city, seller.state_province, seller.country].filter(Boolean).join(', ');

  // Seller online status
  const [sellerOnline, setSellerOnline] = useState<boolean | null>(null);
  useEffect(() => {
    if (!seller.store_slug) return;
    const check = async () => {
      try {
        const res = await fetch(`/api/seller/presence?store_slug=${encodeURIComponent(seller.store_slug)}`);
        if (res.ok) { const d = await res.json(); setSellerOnline(d.online); }
      } catch { setSellerOnline(false); }
    };
    check();
    const iv = setInterval(check, 30000);
    return () => clearInterval(iv);
  }, [seller.store_slug]);

  // Parse product regions
  const productRegions = useMemo(() => {
    if (!product.regions) return [];
    try {
      const parsed = typeof product.regions === 'string' ? JSON.parse(product.regions) : product.regions;
      return Array.isArray(parsed) ? parsed : [];
    } catch { return []; }
  }, [product.regions]);

  const conditionBadge = () => {
    if (!product.product_condition || product.product_condition === 'new') 
      return { label: 'New', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' };
    if (product.product_condition === 'refurbished') 
      return { label: 'Refurbished', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' };
    if (product.product_condition === 'used') 
      return { label: 'Used', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' };
    return { label: product.product_condition, bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200' };
  };

  const cond = conditionBadge();

  return (
    <div className="min-h-screen bg-slate-50">
      {productSchema && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />
      )}
      {breadcrumbSchema && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      )}

      <Header />

      <div className="container mx-auto px-4 py-6 md:py-8 max-w-7xl">
        {/* Breadcrumb */}
        <nav className="hidden md:flex items-center gap-2 text-[13px] mb-8">
          <Link href="/" className="text-slate-400 hover:text-indigo-600 transition-colors font-medium">Home</Link>
          <ChevronRight className="w-3 h-3 text-slate-300" />
          <Link href="/products" className="text-slate-400 hover:text-indigo-600 transition-colors font-medium">Products</Link>
          <ChevronRight className="w-3 h-3 text-slate-300" />
          <Link href={`/products/${product.category_slug}`} className="text-slate-400 hover:text-indigo-600 transition-colors font-medium">
            {(product.category_name || 'Uncategorised').replace(/00/g, '')}
          </Link>
          <ChevronRight className="w-3 h-3 text-slate-300" />
          <span className="text-slate-800 font-bold truncate max-w-[250px]">{product.name}</span>
        </nav>

        {/* Main Grid: Image | Product Info | Seller Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* LEFT: Product Image */}
          <div className="lg:col-span-5">
            <ProductImageGallery images={images} productName={product.name} />
          </div>

          {/* MIDDLE: Product Details */}
          <div className="lg:col-span-4 space-y-6">
            {/* Badges */}
            <div className="flex items-center gap-2 flex-wrap">
              <Link href={`/products/${product.category_slug}`}
                className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-indigo-600 text-white hover:bg-indigo-700 transition-all shadow-sm shadow-indigo-600/20">
                {(product.category_name || 'Uncategorised').replace(/00/g, '')}
              </Link>
              <span className={`px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider border ${cond.bg} ${cond.text} ${cond.border}`}>
                {cond.label}
              </span>
              {Boolean(product.is_featured) && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200">
                  <Sparkles className="w-3 h-3" /> Featured
                </span>
              )}
              {Boolean(product.is_bestseller) && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <BadgeCheck className="w-3 h-3" /> Bestseller
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 leading-tight tracking-tight">{product.name}</h1>

            {/* Price Block */}
            <div className="flex items-end gap-3 flex-wrap">
              <span className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
                £{Number(product.price).toFixed(2)}
              </span>
              {product.original_price && (
                <span className="text-lg text-slate-400 line-through font-medium mb-1">
                  £{Number(product.original_price).toFixed(2)}
                </span>
              )}
              {product.original_price && discountPercentage > 0 && (
                <span className="px-2.5 py-1 rounded-lg text-[11px] font-black bg-rose-500 text-white shadow-sm shadow-rose-500/20 mb-1">
                  -{discountPercentage}% OFF
                </span>
              )}
            </div>

            {/* Short Description */}
            {product.short_description && (
              <p className="text-sm text-slate-500 leading-relaxed font-medium">{product.short_description}</p>
            )}

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-slate-200 via-slate-100 to-transparent" />

            {/* Color Variations */}
            {hasVariations && productVariations.length > 0 && (
              <div className="space-y-3">
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  Colour: <span className="text-slate-700 normal-case tracking-normal text-xs font-bold">{activeGalleryColor || 'Select'}</span>
                </p>
                <div className="flex flex-wrap gap-2.5">
                  {productVariations.map((v) => (
                    <button key={v.id || v.colour_name} onClick={() => toggleColor(v.colour_name)} title={v.colour_name} className="group relative cursor-pointer">
                      <span className={`block w-10 h-10 rounded-xl border-2 transition-all duration-200 shadow-sm ${
                        activeGalleryColor === v.colour_name ? 'border-indigo-500 ring-4 ring-indigo-500/10 scale-110' : 'border-slate-200 hover:border-slate-400 hover:scale-105'
                      }`} style={{ backgroundColor: v.colour_hex || '#ccc' }} />
                      <span className="block text-[9px] text-center mt-1 text-slate-400 font-bold">{v.colour_name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Legacy Colors */}
            {!hasVariations && productColors.length > 0 && (
              <div className="space-y-3">
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  Colour: <span className="text-slate-700 normal-case tracking-normal text-xs font-bold">{selectedColors.join(', ') || 'None'}</span>
                </p>
                <div className="flex flex-wrap gap-2.5">
                  {productColors.map((color) => (
                    <button key={color.name} onClick={() => toggleColor(color.name)}
                      onMouseEnter={() => setActiveGalleryColor(color.name)}
                      title={color.name}
                      className="group relative cursor-pointer">
                      <span className={`block w-10 h-10 rounded-xl border-2 transition-all duration-200 shadow-sm ${
                        selectedColors.includes(color.name)
                          ? 'border-indigo-500 ring-4 ring-indigo-500/10 scale-110'
                          : 'border-slate-200 hover:border-slate-400 hover:scale-105'
                      }`} style={{ backgroundColor: color.name.toLowerCase() }} />
                      <span className="block text-[9px] text-center mt-1 text-slate-400 font-bold capitalize">{color.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Stock */}
            {(product.purchase_type === 'direct' || !product.affiliate_url) && (
              <div>
                {product.stock_quantity !== null && product.stock_quantity !== undefined ? (
                  product.stock_quantity > 0 ? (
                    <span className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black bg-emerald-50 text-emerald-700 border border-emerald-100">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                      </span>
                      In Stock ({product.stock_quantity})
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black bg-red-50 text-red-700 border border-red-100">
                      <span className="w-2 h-2 rounded-full bg-red-500" /> Out of Stock
                    </span>
                  )
                ) : (
                  <span className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black bg-emerald-50 text-emerald-700 border border-emerald-100">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                    </span>
                    In Stock
                  </span>
                )}
              </div>
            )}

            {/* Add to Cart */}
            <AddToCartButton product={product} isDirectSale={product.purchase_type === 'direct' || !product.affiliate_url} selectedColors={selectedColors} />

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-2.5">
              {(product.purchase_type === 'direct' || !product.affiliate_url) ? (
                <>
                  <div className="flex flex-col items-center gap-2 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center">
                      <ShieldCheck className="w-4.5 h-4.5 text-emerald-600" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 text-center leading-tight">Secure Checkout</span>
                  </div>
                  <div className="flex flex-col items-center gap-2 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
                      <Truck className="w-4.5 h-4.5 text-blue-600" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 text-center leading-tight">Order Tracking</span>
                  </div>
                  <div className="flex flex-col items-center gap-2 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center">
                      <RotateCcw className="w-4.5 h-4.5 text-purple-600" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 text-center leading-tight">Easy Returns</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex flex-col items-center gap-2 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
                      <Shield className="w-4.5 h-4.5 text-blue-600" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 text-center leading-tight">Affiliate Partner</span>
                  </div>
                  <div className="flex flex-col items-center gap-2 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                    <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center">
                      <ExternalLink className="w-4.5 h-4.5 text-amber-600" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 text-center leading-tight">External Purchase</span>
                  </div>
                  <div className="flex flex-col items-center gap-2 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center">
                      <ShieldCheck className="w-4.5 h-4.5 text-emerald-600" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 text-center leading-tight">Trusted Source</span>
                  </div>
                </>
              )}
            </div>

            {/* Banner Ad */}
            {product.banner_ad_title && (
              <ProductBannerAd bannerAd={{
                title: product.banner_ad_title, description: product.banner_ad_description,
                image_url: product.banner_ad_image_url, link_url: product.banner_ad_link_url,
                duration: product.banner_ad_duration?.toString(), is_repeating: product.banner_ad_is_repeating,
                start_date: product.banner_ad_start_date, end_date: product.banner_ad_end_date,
                is_active: product.banner_ad_is_active,
              }} />
            )}
          </div>

          {/* RIGHT: Seller Sidebar */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm sticky top-4 overflow-hidden">
              {/* Seller Header */}
              <div className="p-5 relative overflow-hidden" style={{
                background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)',
              }}>
                <div className="absolute inset-0 opacity-20" style={{
                  backgroundImage: 'radial-gradient(circle at 80% 20%, rgba(129,140,248,.4) 0%, transparent 50%)',
                }} />
                <div className="relative flex items-center gap-3.5">
                  {seller.logo_url ? (
                    <Image src={seller.logo_url} alt={seller.store_name} width={56} height={56}
                      className="w-14 h-14 rounded-2xl object-cover border-2 border-white/20 shadow-lg" />
                  ) : (
                    <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20 backdrop-blur-sm shadow-lg">
                      <span className="text-xl font-black text-white">{seller.store_name.charAt(0).toUpperCase()}</span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-[15px] font-black text-white truncate tracking-tight">{seller.store_name}</h3>
                      {seller.is_verified && (
                        <BadgeCheck className="w-4.5 h-4.5 text-blue-300 flex-shrink-0" />
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${sellerOnline ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`} />
                      <span className={`text-[10px] font-bold ${sellerOnline ? 'text-green-300' : 'text-indigo-300/60'}`}>
                        {sellerOnline === null ? 'Checking...' : sellerOnline ? 'Online' : 'Offline'}
                      </span>
                    </div>
                    {sellerLocation && (
                      <div className="flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3 text-indigo-300/70" />
                        <span className="text-[11px] text-indigo-200/80 truncate font-medium">{sellerLocation}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 divide-x divide-slate-50 border-b border-slate-50">
                <div className="py-4 text-center group hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    <Package className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="text-lg font-black text-slate-900">{seller.total_orders}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Sold</p>
                </div>
                <div className="py-4 text-center group hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    <span className="text-lg font-black text-slate-900">
                      {seller.average_rating > 0 ? seller.average_rating.toFixed(1) : 'N/A'}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Rating</p>
                </div>
                <div className="py-4 text-center group hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    <MessageCircle className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="text-lg font-black text-slate-900">{seller.total_reviews}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Reviews</p>
                </div>
              </div>

              {/* Contact */}
              <div className="p-5 space-y-3">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Contact Seller</p>
                <SellerContact
                  sellerName={seller.store_name}
                  sellerSlug={seller.store_slug || 'yuumpy-store'}
                />
              </div>

              {/* Regions */}
              {productRegions.length > 0 && (
                <div className="px-5 pb-4 space-y-2">
                  <div className="flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-slate-400" />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Ships To</p>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {productRegions.map((region: string) => (
                      <span key={region} className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                        {region}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Store Link */}
              <div className="px-5 pb-5">
                {seller.store_slug ? (
                  <Link href={`/store/${seller.store_slug}`}
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl text-sm font-black transition-all active:scale-95 shadow-lg shadow-indigo-600/20 cursor-pointer text-white"
                    style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}>
                    <Store className="w-4 h-4" /> Visit Storefront
                  </Link>
                ) : (
                  <div className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl text-sm font-black transition-all text-white cursor-pointer"
                    style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}>
                    <Store className="w-4 h-4" /> Official Store
                  </div>
                )}
              </div>

              {/* Yuumpy Guarantee mini */}
              <div className="mx-5 mb-5 p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100/50">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center shadow-sm shadow-indigo-600/20 flex-shrink-0">
                    <ShieldCheck className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-[11px] font-black text-indigo-700">Yuumpy Guarantee</p>
                    <p className="text-[10px] text-indigo-500/70 font-medium mt-0.5">Escrow-protected payment</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <ProductTabs longDescription={product.long_description || product.description} productReview={product.product_review} />
      </div>

      <Footer />
    </div>
  );
}
