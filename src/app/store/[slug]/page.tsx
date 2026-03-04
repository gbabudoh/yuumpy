import { query } from '@/lib/database';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import StoreProductGrid from '@/components/StoreProductGrid';
import SellerOnlineBadge from '@/components/SellerOnlineBadge';
import Link from 'next/link';
import Image from 'next/image';
import { Star, ShoppingBag, MapPin, Calendar, ShieldCheck, CheckCircle2, Store, CreditCard } from 'lucide-react';

interface PageProps {
  params: Promise<{ slug: string }>;
}

interface SellerRow {
  id: number;
  store_name: string;
  store_slug: string;
  business_name: string;
  description: string;
  logo_url: string;
  banner_url: string;
  is_verified: boolean;
  average_rating: number;
  total_reviews: number;
  city: string;
  state_province: string;
  created_at: string;
}

interface ProductRow {
  id: number;
  name: string;
  slug: string;
  price: string;
  original_price: string;
  image_url: string;
  category_name: string;
  product_condition: string;
}

interface ReviewRow {
  id: number;
  rating: number;
  title: string;
  review_text: string;
  first_name: string;
  last_name: string;
  created_at: string;
}

export default async function StorefrontPage({ params }: PageProps) {
  const { slug } = await params;

  // Fetch seller info
  const sellers = await query(
    'SELECT * FROM sellers WHERE store_slug = ? AND status = ?',
    [slug, 'approved']
  ) as SellerRow[];

  if (!sellers || sellers.length === 0) {
    return (
      <div className="min-h-screen bg-[#F8FAFC]">
        <Header />
        <div className="flex items-center justify-center min-h-[500px]">
          <div className="text-center p-8 bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 max-w-md mx-auto">
            <div className="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-slate-300">
              <Store className="w-10 h-10" />
            </div>
            <h1 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">Store Not Found</h1>
            <p className="text-slate-500 mb-8 leading-relaxed">The store you&apos;re looking for doesn&apos;t exist or is currently undergoing maintenance.</p>
            <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-indigo-500/20">
              Back to Marketplace
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const seller = sellers[0];

  // Fetch seller's products
  const products = await query(
    `SELECT p.*, c.name as category_name FROM products p 
     LEFT JOIN categories c ON p.category_id = c.id 
     WHERE p.seller_id = ? AND p.is_active = 1 AND p.seller_approved = 1 
     ORDER BY p.created_at DESC`,
    [seller.id]
  ) as ProductRow[];

  // Fetch seller reviews
  const reviews = await query(
    `SELECT sr.*, c.first_name, c.last_name FROM seller_reviews sr 
     JOIN customers c ON sr.customer_id = c.id 
     WHERE sr.seller_id = ? AND sr.is_visible = 1 
     ORDER BY sr.created_at DESC LIMIT 10`,
    [seller.id]
  ) as ReviewRow[];

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Header />

      {/* Hero Section */}
      <div className="relative pt-12 pb-24 overflow-hidden">
        {/* Animated Background Gradients */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[70%] bg-indigo-500/10 blur-[120px] rounded-full animate-pulse" />
          <div className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[70%] bg-purple-500/10 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="flex flex-col lg:flex-row gap-12 items-start">
            {/* Store Identity Card */}
            <div className="flex-1 w-full">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                {/* Logo Container */}
                <div className="relative group shrink-0">
                  <div className="absolute inset-0 bg-indigo-500 blur-3xl opacity-20 group-hover:opacity-40 transition-opacity duration-500" />
                  <div className="relative w-32 h-32 md:w-40 md:h-40 bg-white rounded-full p-2 shadow-2xl flex items-center justify-center border border-slate-100/50 overflow-hidden transform transition-transform duration-500 group-hover:scale-[1.02]">
                    {seller.logo_url ? (
                      <Image 
                        src={seller.logo_url} 
                        alt={seller.store_name} 
                        width={160} 
                        height={160} 
                        className="w-full h-full object-contain rounded-full" 
                        priority
                      />
                    ) : (
                      <div className="w-full h-full rounded-full flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-5xl font-black shadow-inner">
                        {seller.store_name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="text-center md:text-left flex-1 min-w-0">
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-4">
                    <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter leading-tight italic uppercase">
                      {seller.store_name}
                    </h1>
                    <div className="flex items-center gap-2">
                      {seller.is_verified && (
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-100/80 backdrop-blur-md border border-blue-200 text-blue-700 rounded-full">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span className="text-[10px] font-black uppercase tracking-widest">Verified</span>
                        </div>
                      )}
                      <SellerOnlineBadge storeSlug={seller.store_slug} />
                    </div>
                  </div>

                  {seller.description && (
                    <p className="text-slate-500 text-lg md:text-xl font-medium leading-relaxed max-w-2xl mb-8">
                      {seller.description}
                    </p>
                  )}

                  {/* Trust Pills */}
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                    <div className="flex items-center gap-2 px-4 py-2 bg-white/70 backdrop-blur-md border border-slate-200 shadow-sm rounded-2xl group hover:border-indigo-200 transition-colors">
                      <ShieldCheck className="w-4 h-4 text-indigo-500" />
                      <span className="text-xs font-bold text-slate-700">Yuumpy Guarantee</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-white/70 backdrop-blur-md border border-slate-200 shadow-sm rounded-2xl group hover:border-indigo-200 transition-colors">
                      <CreditCard className="w-4 h-4 text-purple-500" />
                      <span className="text-xs font-bold text-slate-700">Escrow Protected</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Panel */}
            <div className="w-full lg:w-[380px] shrink-0">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden group hover:scale-[1.02] transition-all duration-300">
                  <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Star className="w-12 h-12 text-amber-500 fill-amber-500" />
                  </div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Rating</p>
                  <p className="text-2xl font-black text-slate-900 tracking-tight">
                    {seller.average_rating > 0 ? Number(seller.average_rating).toFixed(1) : '5.0'}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <div className="flex text-amber-400">
                      <Star className="w-3 h-3 fill-amber-400" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-500">{seller.total_reviews} reviews</span>
                  </div>
                </div>

                <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden group hover:scale-[1.02] transition-all duration-300">
                  <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
                    <ShoppingBag className="w-12 h-12 text-indigo-500" />
                  </div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Inventory</p>
                  <p className="text-2xl font-black text-slate-900 tracking-tight">{products.length}</p>
                  <p className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-wider">Active Listings</p>
                </div>

                <div className="col-span-2 p-6 bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden group hover:scale-[1.02] transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Origin & Tenure</p>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 group-hover:text-indigo-500 transition-colors">
                            <MapPin className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-[13px] font-black text-slate-900 leading-none">
                              {seller.city || 'International'}, {seller.state_province || 'Yuumpy'}
                            </p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Location</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 group-hover:text-purple-500 transition-colors">
                            <Calendar className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-[13px] font-black text-slate-900 leading-none">
                              {new Date(seller.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                            </p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Active Since</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid with Category Filter */}
      <section className="pb-24 pt-4">
        <div className="container mx-auto px-6">
          <div className="flex items-center gap-4 mb-10">
            <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">Live Inventory</h2>
            <div className="h-px flex-1 bg-gradient-to-r from-slate-200 to-transparent" />
          </div>
          <StoreProductGrid products={products} storeName={seller.store_name} storeSlug={seller.store_slug} />
        </div>
      </section>

      {/* Reviews */}
      {reviews.length > 0 && (
        <section className="py-24 bg-white border-t border-slate-100 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-50/50 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2" />
          
          <div className="container mx-auto px-6 relative z-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
              <div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic mb-3">Seller Reliability</h2>
                <p className="text-slate-500 font-medium">Real feedback from actual customers who purchased from this store.</p>
              </div>
              <div className="flex items-center gap-4 px-6 py-4 bg-slate-50 rounded-3xl border border-slate-100">
                <div className="text-center">
                  <p className="text-2xl font-black text-slate-900">{Number(seller.average_rating || 5).toFixed(1)}</p>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Rating</p>
                </div>
                <div className="w-px h-10 bg-slate-200 mx-2" />
                <div className="text-center">
                  <p className="text-2xl font-black text-slate-900">{seller.total_reviews}</p>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Reviews</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {reviews.map((review) => (
                <div key={review.id} className="p-8 bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 group">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex text-amber-400 gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-amber-400' : 'text-slate-200 fill-slate-200'}`} />
                      ))}
                    </div>
                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{new Date(review.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                  {review.title && <p className="text-lg font-black text-slate-900 mb-3 tracking-tight italic uppercase">{review.title}</p>}
                  <p className="text-slate-600 font-medium leading-relaxed italic line-clamp-3">&quot;{review.review_text}&quot;</p>
                  <div className="mt-8 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-black text-slate-400 text-xs">
                      {review.first_name[0]}{review.last_name[0]}
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-900 leading-none">{review.first_name} {review.last_name?.charAt(0)}.</p>
                      <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mt-1">Verified Buyer</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}

