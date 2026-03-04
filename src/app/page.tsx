'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import BannerAd from '@/components/BannerAd';
import { 
  ShieldCheck, 
  Star,
  ShoppingBag,
  Globe,
  BadgeCheck
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
  product_condition?: 'new' | 'refurbished' | 'used';
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
          const products = Array.isArray(productsData) ? productsData : (productsData.products || []);
          const mappedProducts = products.map((product: Record<string, unknown>) => ({
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
            store_slug: product.store_slug,
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
      <div className="min-h-screen bg-white">
        <Header />
        <div className="flex items-center justify-center min-h-[600px]">
          <div className="text-center">
            <div className="relative w-20 h-20 mx-auto mb-8">
              <div className="absolute inset-0 rounded-full border-t-4 border-indigo-600 animate-spin" />
              <div className="absolute inset-2 rounded-full border-r-4 border-purple-500 animate-spin-slow" />
            </div>
            <p className="text-xl font-medium tracking-tight bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Preparing Your Experience...
            </p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white selection:bg-indigo-100 selection:text-indigo-900">
      <Header />

      {/* High-Fidelity Banner Section (Top) */}
      <section className="relative z-10 w-full overflow-hidden border-b border-gray-100">
        <BannerAd />
      </section>

      {/* Simplified Call to Action Section */}
      <section className="py-16 bg-white border-b border-gray-50">
        <div className="container mx-auto px-6 text-center">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link href="/products" className="group px-12 py-5 rounded-3xl bg-purple-600 text-white font-black text-xl shadow-2xl hover:scale-105 active:scale-95 transition-all duration-500 flex items-center gap-3">
              <span>Start Exploring</span>
              <ShoppingBag className="w-6 h-6 group-hover:rotate-12 transition-transform" />
            </Link>
            <Link href="/account/register" className="px-12 py-5 rounded-3xl border-2 border-gray-200 text-gray-900 font-bold text-xl hover:border-[#020617] hover:bg-[#020617] hover:text-white active:scale-95 transition-all duration-500">
              Become a Seller
            </Link>
          </div>
        </div>
      </section>




      {/* Featured Products Display */}
      <section className="py-24 bg-gray-50/50">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* The Guarantee Section */}
      <section className="py-32 relative">
        <div className="container mx-auto px-6 text-center max-w-5xl">
          <h2 className="text-4xl md:text-7xl font-black text-gray-900 mb-10 tracking-tight leading-tight">THE YUUMPY <br /> <span className="text-gradient">GUARANTEE</span></h2>
          <p className="text-2xl text-gray-500 mb-20 font-medium leading-relaxed">We protect every dollar, every item, every time. Experience commerce with total peace of mind.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { 
                icon: ShieldCheck, 
                title: 'Escrow Vault', 
                desc: 'Your funds are secured until delivery is confirmed. If it doesn\'t arrive, your money is safe.' 
              },
              { 
                icon: BadgeCheck, 
                title: 'Quality Check', 
                desc: 'Every seller must pass a 24-point verification process before joining the network.' 
              },
              { 
                icon: Star, 
                title: 'Dispute Support', 
                desc: 'Access our dedicated North American arbitration team 24/7 for any order issues.' 
              }
            ].map((feature, i) => (
              <div key={i} className="group p-10 rounded-[40px] bg-white border border-gray-100 hover:border-primary/20 hover:shadow-[0_40px_80px_-20px_rgba(99,102,241,0.15)] transition-all duration-500">
                <div className="w-20 h-20 rounded-3xl bg-gray-50 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-primary transition-all duration-500 ring-8 ring-transparent group-hover:ring-primary/10">
                  <feature.icon className="w-10 h-10 text-gray-900 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-4 tracking-tight">{feature.title}</h3>
                <p className="text-gray-500 leading-relaxed font-medium">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final Sell CTA */}
      <section className="pb-32 container mx-auto px-6">
        <div className="relative rounded-[60px] overflow-hidden bg-[#020617] py-24 px-6 text-center">
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
          <div className="relative z-10 max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-7xl font-black text-white mb-8 leading-tight tracking-tight">READY TO <br /> <span className="text-gradient"> SCALE YOUR STORE?</span></h2>
            <p className="text-xl text-gray-400 mb-16 font-medium leading-relaxed">Join the most trusted vendor network in North America. Low fees, instant trust, global reach.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link href="/account/register" className="px-12 py-6 rounded-3xl bg-white text-[#020617] font-black text-xl hover:scale-110 active:scale-95 transition-all duration-500 shadow-2xl">
                Apply to Sell
              </Link>
              <p className="text-gray-500 font-bold uppercase tracking-widest text-xs flex items-center gap-2">
                <Globe className="w-4 h-4" /> Global Fulfillment Network
              </p>
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

