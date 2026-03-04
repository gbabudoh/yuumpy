'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Heart, ShoppingBag, Trash2, ExternalLink, Sparkles,
  Package, ArrowLeft
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface WishlistItem {
  id: number; product_id: number; name: string; slug: string; price: number;
  original_price?: number; image_url: string; affiliate_url: string;
  purchase_type: string; product_condition: string; stock_quantity?: number;
  brand_name?: string; category_name?: string; created_at: string;
}

export default function WishlistPage() {
  const router = useRouter();
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<number | null>(null);

  useEffect(() => { checkAuth(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/customer/auth/me');
      if (!res.ok) { router.push('/account/login'); return; }
      fetchWishlist();
    } catch { router.push('/account/login'); }
  };

  const fetchWishlist = async () => {
    try {
      const res = await fetch('/api/customer/wishlist');
      if (res.ok) { const d = await res.json(); setWishlist(d.wishlist || []); }
    } catch {} finally { setLoading(false); }
  };

  const handleRemove = async (productId: number) => {
    setRemovingId(productId);
    try {
      const res = await fetch(`/api/customer/wishlist?product_id=${productId}`, { method: 'DELETE' });
      if (res.ok) setWishlist(prev => prev.filter(i => i.product_id !== productId));
    } catch {} finally { setRemovingId(null); }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f8fa] flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-14 h-14 mx-auto">
            <div className="w-14 h-14 border-[3px] border-gray-200 rounded-full animate-spin border-t-gray-900" />
            <Sparkles className="w-5 h-5 text-gray-900 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="mt-4 text-gray-400 text-sm">Loading your wishlist...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f8fa]">
      <Header />
      <div className="bg-white border-b border-gray-100/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5 sm:py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/account" className="p-2 -ml-2 rounded-xl hover:bg-gray-50 transition-colors" aria-label="Back to account">
                <ArrowLeft className="w-5 h-5 text-gray-400" />
              </Link>
              <div>
                <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 tracking-tight">My Wishlist</h1>
                <p className="text-[13px] text-gray-400 mt-0.5">{wishlist.length} saved {wishlist.length === 1 ? 'item' : 'items'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {wishlist.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 px-6 py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-4">
              <Heart className="w-7 h-7 text-gray-300" />
            </div>
            <p className="text-sm font-medium text-gray-900 mb-1">Your wishlist is empty</p>
            <p className="text-[13px] text-gray-400 mb-5">Save products you love for easy access later</p>
            <Link href="/products" className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition-colors">
              <ShoppingBag className="w-4 h-4" /> Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {wishlist.map((item) => (
              <div key={item.id} className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:border-gray-200 hover:shadow-lg hover:shadow-gray-200/60 transition-all duration-300">
                <Link href={item.seller_store_slug ? `/products/${item.seller_store_slug}/${item.slug}` : `/products/${item.slug}`} className="block relative aspect-square bg-gray-50">
                  {item.image_url ? (
                    <Image src={item.image_url} alt={item.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"><Package className="w-12 h-12 text-gray-200" /></div>
                  )}
                  <button onClick={(e) => { e.preventDefault(); handleRemove(item.product_id); }} disabled={removingId === item.product_id}
                    className="absolute top-3 right-3 w-9 h-9 bg-white/90 backdrop-blur-sm hover:bg-red-50 rounded-full flex items-center justify-center transition-colors shadow-sm" aria-label="Remove from wishlist">
                    {removingId === item.product_id ? (
                      <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4 text-gray-500 hover:text-red-500 transition-colors" />
                    )}
                  </button>
                  {item.product_condition && (
                    <span className="absolute top-3 left-3 px-2 py-0.5 bg-white/90 backdrop-blur-sm text-[11px] font-medium text-gray-600 rounded-full capitalize">{item.product_condition}</span>
                  )}
                </Link>
                <div className="p-4">
                  {item.brand_name && <p className="text-[11px] text-gray-400 mb-1 uppercase tracking-wider">{item.brand_name}</p>}
                  <Link href={item.seller_store_slug ? `/products/${item.seller_store_slug}/${item.slug}` : `/products/${item.slug}`}>
                    <h3 className="text-sm font-medium text-gray-900 line-clamp-2 hover:text-gray-600 transition-colors leading-snug">{item.name}</h3>
                  </Link>
                  <div className="flex items-center gap-2 mt-2.5">
                    <span className="text-base font-bold text-gray-900">£{Number(item.price).toFixed(2)}</span>
                    {item.original_price && item.original_price > item.price && (
                      <>
                        <span className="text-[12px] text-gray-400 line-through">£{Number(item.original_price).toFixed(2)}</span>
                        <span className="text-[10px] bg-red-50 text-red-600 px-1.5 py-0.5 rounded-full font-semibold">{Math.round(((item.original_price - item.price) / item.original_price) * 100)}% off</span>
                      </>
                    )}
                  </div>
                  <a href={item.affiliate_url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 w-full mt-3 py-2.5 bg-gray-900 text-white text-[13px] font-medium rounded-xl hover:bg-gray-800 transition-colors">
                    <ExternalLink className="w-3.5 h-3.5" /> {item.purchase_type === 'direct' ? 'Buy Now' : 'View Deal'}
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
