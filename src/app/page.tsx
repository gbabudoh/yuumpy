'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import BannerAd from '@/components/BannerAd';
import { 
  ShieldCheck, 
  BadgeCheck,
  Heart,
  Sparkles,
  PenTool,
  ArrowRight,
  ChevronRight
} from 'lucide-react';

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
  purchase_type?: 'affiliate' | 'direct';
  product_condition?: string;
  seller_name?: string;
  seller_store_slug?: string;
}

interface RawProduct {
  id: number;
  name: string;
  slug: string;
  price: string | number;
  original_price?: string | number;
  image_url?: string;
  is_featured?: boolean;
  is_bestseller?: boolean;
  affiliate_url?: string;
  purchase_type?: 'affiliate' | 'direct';
  product_condition?: string;
  seller_name?: string;
  store_slug?: string;
}

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const productsResponse = await fetch('/api/products?featured=true');
        if (productsResponse.ok) {
          const productsData = await productsResponse.json();
          const products = (Array.isArray(productsData) ? productsData : (productsData.products || [])) as RawProduct[];
          const mappedProducts = products.map((product) => ({
            id: product.id,
            name: product.name,
            slug: product.slug,
            price: parseFloat(String(product.price)) || 0,
            originalPrice: product.original_price ? parseFloat(String(product.original_price)) : undefined,
            image_url: (product.image_url as string) || '',
            isFeatured: Boolean(product.is_featured),
            isBestseller: Boolean(product.is_bestseller),
            affiliate_url: product.affiliate_url,
            purchase_type: product.purchase_type,
            product_condition: product.product_condition,
            seller_name: product.seller_name,
            seller_store_slug: product.store_slug,
          }));
          setFeaturedProducts(mappedProducts);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fafafa]">
        <Header />
        <div className="flex items-center justify-center min-h-[600px]">
          <div className="text-center">
            <div className="relative w-16 h-16 mx-auto mb-6">
              <div className="absolute inset-0 rounded-full border-t-2 border-indigo-600 animate-spin" />
            </div>
            <p className="text-sm font-bold tracking-[0.3em] uppercase text-neutral-400 animate-pulse">
              Curating Excellence
            </p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] selection:bg-indigo-100 selection:text-indigo-900">
      <Header />

      {/* 1. HERO BANNER - FIXED AT TOP PER USER REQUEST */}
      <section className="relative z-10 w-full overflow-hidden">
        <BannerAd />
      </section>

      {/* 2. TRUST STATS BAR */}
      <section className="bg-white border-b border-neutral-100 py-7">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-neutral-100">
            {[
              { value: '500+', label: 'Verified Artisans' },
              { value: '10K+', label: 'Handmade Pieces' },
              { value: '100%', label: 'Human Made' },
              { value: 'Escrow', label: 'Protected Payments' },
            ].map((stat, i) => (
              <div key={i} className="flex flex-col items-center gap-1 px-4 py-2">
                <span className="text-2xl md:text-3xl font-black text-neutral-900 tracking-tighter">{stat.value}</span>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. CATEGORY QUICK-NAV */}
      <section className="bg-[#fafafa] border-b border-neutral-100 py-8">
        <div className="container mx-auto px-6">
          <div className="flex items-center gap-3 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
            {[
              { label: 'All Crafts', href: '/products' },
              { label: 'Pottery', href: '/products?category=pottery' },
              { label: 'Textiles', href: '/products?category=textiles' },
              { label: 'Woodwork', href: '/products?category=woodwork' },
              { label: 'Jewellery', href: '/products?category=jewellery' },
              { label: 'Leather', href: '/products?category=leather' },
              { label: 'Glasswork', href: '/products?category=glasswork' },
              { label: 'Candles', href: '/products?category=candles' },
              { label: 'Prints', href: '/products?category=prints' },
            ].map((cat) => (
              <Link
                key={cat.label}
                href={cat.href}
                className="flex-shrink-0 px-6 py-3 rounded-full border border-neutral-200 bg-white text-xs font-black uppercase tracking-widest text-neutral-600 hover:bg-neutral-900 hover:text-white hover:border-neutral-900 transition-all duration-300 whitespace-nowrap"
              >
                {cat.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 4. THE MANIFESTO - SPLIT STORYTELLING */}
      <section className="relative py-24 md:py-40 overflow-hidden border-b border-neutral-100 bg-white">
        <div className="absolute top-0 left-0 w-full h-full opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #000 1px, transparent 0)', backgroundSize: '60px 60px' }} />
        <div className="container mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 md:gap-24 items-center">
            {/* Left: Content */}
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-[10px] font-black uppercase tracking-[0.2em] mb-10">
                <Sparkles className="w-3 h-3" /> The Human Touch
              </div>
              <h1 className="text-6xl md:text-8xl font-black text-neutral-900 mb-10 leading-[0.95] tracking-tighter">
                Crafted by Humans.<br />
                <span className="italic font-light text-neutral-400">For Humans.</span>
              </h1>
              <p className="text-xl md:text-2xl text-neutral-500 mb-12 leading-relaxed font-medium">
                Yuumpy is a curated sanctuary for master artisans. We believe that every object should possess soul, character, and a traceable journey.
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-8">
                <Link href="/products" className="group px-10 py-5 rounded-2xl bg-neutral-900 text-white font-bold text-sm uppercase tracking-widest hover:bg-indigo-600 transition-all duration-500 flex items-center gap-3 active:scale-95 shadow-xl shadow-neutral-200">
                  Explore The Fair
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link href="/about-yuumpy" className="text-sm font-black text-neutral-900 uppercase tracking-widest border-b-2 border-neutral-200 hover:border-indigo-600 transition-colors py-1">
                  Our Story
                </Link>
              </div>
            </div>

            {/* Right: Story Image */}
            <div className="relative group">
              <div className="aspect-[4/5] md:aspect-square rounded-[4rem] overflow-hidden bg-neutral-100 shadow-2xl relative">
                <Image 
                  src="/artisan_manifesto_hero_1778466280996.png" 
                  alt="Artisan at work" 
                  fill
                  className="object-cover transition-transform duration-1000 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/80 via-transparent to-transparent opacity-60" />
                <div className="absolute bottom-12 left-12 right-12">
                  <div className="p-8 bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400 mb-3">Episode 01</p>
                    <h3 className="text-2xl font-bold text-white mb-2 leading-tight">The Potter&apos;s Hands</h3>
                    <p className="text-sm text-neutral-300 font-medium leading-relaxed italic">
                      &quot;Every piece of clay holds a memory of the hands that shaped it. On Yuumpy, that memory is preserved forever.&quot;
                    </p>
                  </div>
                </div>
              </div>
              {/* Decorative elements */}
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-indigo-600/10 rounded-full blur-2xl" />
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-600/5 rounded-full blur-3xl" />
            </div>
          </div>
        </div>
      </section>

      {/* 3. THE ARTISAN COLLECTION - CURATED GRID */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-6">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 text-indigo-600 font-black text-[10px] uppercase tracking-[0.3em] mb-3">
                <PenTool className="w-4 h-4" /> Studio Selections
              </div>
              <h2 className="text-4xl md:text-6xl font-black text-neutral-900 tracking-tight leading-none uppercase">The Master <br />Collection</h2>
            </div>
            <Link href="/products" className="px-6 py-3 rounded-xl border border-neutral-200 text-xs font-black uppercase tracking-widest hover:bg-neutral-900 hover:text-white transition-all flex items-center gap-2 group">
              Browse Everything <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-12">
            {featuredProducts.length > 0 ? (
              featuredProducts.map((product) => (
                <div key={product.id} className="group">
                  <ProductCard product={product} />
                </div>
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center gap-6 py-24">
                <div className="w-16 h-16 rounded-2xl bg-neutral-100 flex items-center justify-center">
                  <PenTool className="w-7 h-7 text-neutral-300" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-black uppercase tracking-[0.2em] text-neutral-400 mb-2">No featured pieces yet</p>
                  <p className="text-xs text-neutral-300 font-medium">Our curators are selecting the finest artisan work</p>
                </div>
                <Link href="/products" className="px-8 py-3 rounded-xl border border-neutral-200 text-xs font-black uppercase tracking-widest text-neutral-600 hover:bg-neutral-900 hover:text-white hover:border-neutral-900 transition-all duration-300">
                  Browse All Products
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 4. THE CRAFT STORY - SLEEK & CATCHY MID-SECTION */}
      <section className="py-24 bg-neutral-900 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-indigo-600/10 blur-[120px] rounded-full translate-x-1/2" />
        <div className="container mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="relative group">
              <div className="aspect-[4/5] rounded-[3rem] bg-neutral-950 overflow-hidden relative">
                {/* Gradient mesh background */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/40 via-neutral-900 to-purple-900/30" />
                <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-indigo-600/25 rounded-full blur-[80px]" />
                <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-purple-600/20 rounded-full blur-[60px]" />
                <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '36px 36px' }} />

                {/* Floating accent cards */}
                <div className="absolute top-10 right-10 w-20 h-20 rounded-2xl border border-white/10 backdrop-blur-sm bg-white/5 flex items-center justify-center">
                  <PenTool className="w-8 h-8 text-indigo-400/70" />
                </div>
                <div className="absolute top-1/2 left-8 -translate-y-1/2 w-14 h-14 rounded-full border border-white/10 bg-white/5 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-purple-400/70" />
                </div>
                <div className="absolute top-1/3 right-1/3 w-10 h-10 rounded-full bg-indigo-500/20 border border-indigo-400/20" />

                {/* Quote overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent" />
                <div className="absolute bottom-8 left-8 right-8">
                  <p className="text-xs font-black uppercase tracking-[0.3em] text-indigo-400 mb-3">Provenance</p>
                  <p className="text-2xl font-bold italic tracking-tight leading-tight text-white">&quot;The beauty is in the <br /> imperfections.&quot;</p>
                </div>
              </div>
            </div>
            <div className="space-y-10">
              <div className="space-y-4">
                <h2 className="text-4xl md:text-7xl font-black leading-[1.1] tracking-tight">Meet the<br /><span className="text-indigo-500 italic font-light">Makers</span></h2>
                <p className="text-lg text-neutral-400 leading-relaxed max-w-lg">
                  Every artisan on Yuumpy is a master of their craft. From traditional pottery to modern textile design, we bring the studio directly to you.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                {[
                  { title: 'Authenticity', desc: 'Verified artisan stories and studio galleries.' },
                  { title: 'Quality', desc: 'Hand-inspected for durability and mastery.' },
                  { title: 'Direct', desc: 'Chat directly with the creator of your item.' },
                  { title: 'Bespoke', desc: 'Support for custom and made-to-order craft.' },
                ].map((item, i) => (
                  <div key={i} className="space-y-2 border-l border-neutral-800 pl-6">
                    <h4 className="font-bold text-indigo-400 text-sm uppercase tracking-widest">{item.title}</h4>
                    <p className="text-sm text-neutral-500 font-medium">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. THE ARTISAN GUARANTEE - SLEEK ICONS */}
      <section className="py-32 bg-white">
        <div className="container mx-auto px-6 text-center max-w-5xl">
          <div className="inline-flex items-center gap-2 text-indigo-600 font-black text-[10px] uppercase tracking-[0.3em] mb-6">
            <ShieldCheck className="w-4 h-4" /> Built on Trust
          </div>
          <h2 className="text-4xl md:text-7xl font-black text-neutral-900 mb-20 tracking-tighter uppercase leading-none">The Artisan <br /> <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent italic">Guarantee</span></h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { 
                icon: ShieldCheck, 
                title: 'Escrow Vault', 
                desc: 'Your funds are secured until delivery is confirmed. Protection for both maker and collector.' 
              },
              { 
                icon: BadgeCheck, 
                title: 'Verified Makers', 
                desc: 'A manual review of every studio to ensure genuine provenance and ethical craft.' 
              },
              { 
                icon: Heart, 
                title: 'Maker Direct', 
                desc: 'Dialogue directly with the artisan. No middlemen, no marketplace noise. Just craft.' 
              }
            ].map((feature, i) => (
              <div key={i} className="group p-10 rounded-[3rem] bg-[#fafafa] border border-neutral-100 hover:border-indigo-100 hover:shadow-2xl hover:shadow-indigo-500/5 transition-all duration-500">
                <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center mx-auto mb-8 group-hover:bg-indigo-600 group-hover:scale-110 shadow-sm transition-all duration-500">
                  <feature.icon className="w-8 h-8 text-indigo-600 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-xl font-bold text-neutral-900 mb-4 tracking-tight">{feature.title}</h3>
                <p className="text-neutral-500 leading-relaxed font-medium text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. FINAL CTA - SLEEK INVITATION */}
      <section className="pb-32 container mx-auto px-6">
        <div className="relative rounded-[4rem] overflow-hidden bg-neutral-900 py-24 px-10 text-center">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 0)', backgroundSize: '40px 40px' }} />
          <div className="relative z-10 max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-8xl font-black text-white mb-8 leading-[0.9] tracking-tighter uppercase italic">Ready to Join<br /> <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent not-italic">The Movement?</span></h2>
            <p className="text-xl text-neutral-400 mb-16 font-medium leading-relaxed max-w-2xl mx-auto">
              Whether you are a master creator or a conscious collector, Yuumpy is the home your story deserves.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
              <Link href="/account/register" className="px-12 py-6 rounded-[2rem] bg-indigo-600 text-white font-black text-lg hover:scale-105 active:scale-95 transition-all duration-500 shadow-2xl shadow-indigo-600/40 uppercase tracking-widest">
                Apply to Sell
              </Link>
              <Link href="/products" className="text-white font-black uppercase tracking-[0.2em] text-xs flex items-center gap-2 group">
                Browse Collections <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />

      <style jsx global>{`
        .animate-spin-slow {
          animation: spin 3s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
