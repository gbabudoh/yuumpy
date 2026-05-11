'use client';

import React from 'react';
import Image from 'next/image';
import ProductCard from './ProductCard';
import { Star, MapPin, Globe, Instagram, Twitter, PenTool, Award, Users, Package } from 'lucide-react';

interface MakerProfileProps {
  seller: {
    id: number;
    store_name: string;
    store_slug: string;
    business_name: string;
    description: string;
    artisan_story: string;
    studio_images: string[];
    specialties: string[];
    social_links: {
      instagram?: string;
      twitter?: string;
      facebook?: string;
      pinterest?: string;
    };
    profile_video_url?: string;
    logo_url: string;
    banner_url: string;
    website: string;
    city: string;
    state_province: string;
    country: string;
    total_sales: number;
    total_orders: number;
    average_rating: number;
    total_reviews: number;
    is_verified: boolean;
    created_at: string;
  };
  products: {
    id: number;
    name: string;
    slug: string;
    price: number;
    originalPrice?: number;
    image_url: string;
    product_condition?: string;
    seller_store_slug?: string;
  }[];
}

export const MakerProfile: React.FC<MakerProfileProps> = ({ seller, products }) => {
  return (
    <div className="min-h-screen bg-neutral-50 pb-20">
      {/* Banner Section */}
      <div className="relative h-64 md:h-80 w-full overflow-hidden">
        {seller.banner_url ? (
          <Image 
            src={seller.banner_url} 
            alt={seller.store_name}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-indigo-500 to-purple-600" />
        )}
        <div className="absolute inset-0 bg-black/30" />
      </div>

      {/* Profile Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10">
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-6 md:p-8 border border-white/20">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
            <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-2xl overflow-hidden border-4 border-white shadow-lg bg-white">
              {seller.logo_url ? (
                <Image 
                  src={seller.logo_url} 
                  alt={seller.store_name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-neutral-200 flex items-center justify-center text-4xl font-bold text-neutral-400">
                  {seller.store_name[0]}
                </div>
              )}
            </div>

            <div className="flex-1 text-center md:text-left pt-2">
              <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-2">
                <h1 className="text-3xl md:text-4xl font-bold text-neutral-900">{seller.store_name}</h1>
                {seller.is_verified && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                    <Award className="w-3 h-3 mr-1" />
                    Verified Artisan
                  </span>
                )}
              </div>
              
              <div className="flex flex-wrap justify-center md:justify-start items-center gap-4 text-neutral-600 mb-4">
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  {seller.city}, {seller.country}
                </div>
                <div className="flex items-center">
                  <Star className="w-4 h-4 mr-1 text-yellow-400 fill-yellow-400" />
                  {seller.average_rating} ({seller.total_reviews} reviews)
                </div>
                <div className="flex items-center text-neutral-500 text-sm">
                  <Users className="w-4 h-4 mr-1" />
                  Member since {new Date(seller.created_at).getFullYear()}
                </div>
              </div>

              <div className="flex justify-center md:justify-start gap-3">
                {seller.social_links?.instagram && (
                  <a href={seller.social_links.instagram} className="p-2 bg-neutral-100 hover:bg-pink-50 text-neutral-600 hover:text-pink-600 rounded-full transition-colors">
                    <Instagram className="w-5 h-5" />
                  </a>
                )}
                {seller.social_links?.twitter && (
                  <a href={seller.social_links.twitter} className="p-2 bg-neutral-100 hover:bg-blue-50 text-neutral-600 hover:text-blue-400 rounded-full transition-colors">
                    <Twitter className="w-5 h-5" />
                  </a>
                )}
                {seller.website && (
                  <a href={seller.website} className="p-2 bg-neutral-100 hover:bg-indigo-50 text-neutral-600 hover:text-indigo-600 rounded-full transition-colors">
                    <Globe className="w-5 h-5" />
                  </a>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-3 w-full md:w-auto">
              <button className="w-full md:w-auto px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-md transition-all">
                Follow Maker
              </button>
              <button className="w-full md:w-auto px-8 py-3 bg-white border border-neutral-200 hover:bg-neutral-50 text-neutral-700 font-semibold rounded-xl transition-all flex items-center justify-center gap-2">
                <PenTool className="w-4 h-4" />
                Custom Request
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="space-y-16">
          {/* Main Story Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-black uppercase tracking-widest">
                <PenTool className="w-3 h-3" />
                The Maker&apos;s Journey
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-neutral-900 leading-tight">Crafting with Passion & Purpose</h2>
              <div className="prose prose-lg text-neutral-600 leading-relaxed max-w-none">
                {seller.artisan_story || seller.description}
              </div>
              
              {seller.specialties && seller.specialties.length > 0 && (
                <div className="pt-4">
                  <p className="text-xs font-black text-neutral-400 uppercase tracking-[0.2em] mb-3">Masteries</p>
                  <div className="flex flex-wrap gap-2">
                    {seller.specialties.map((specialty, idx) => (
                      <span key={idx} className="px-4 py-2 bg-white border border-neutral-200 rounded-xl text-sm font-bold text-neutral-700 shadow-sm hover:border-indigo-200 transition-colors">
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Studio Showcase */}
            <div className="relative">
              {seller.studio_images && seller.studio_images.length > 0 ? (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div className="relative aspect-[3/4] rounded-3xl overflow-hidden shadow-2xl">
                      <Image src={seller.studio_images[0]} alt="Studio" fill className="object-cover" />
                    </div>
                    {seller.studio_images[2] && (
                      <div className="relative aspect-square rounded-3xl overflow-hidden shadow-xl">
                        <Image src={seller.studio_images[2]} alt="Process" fill className="object-cover" />
                      </div>
                    )}
                  </div>
                  <div className="space-y-4 pt-8">
                    {seller.studio_images[1] && (
                      <div className="relative aspect-square rounded-3xl overflow-hidden shadow-xl">
                        <Image src={seller.studio_images[1]} alt="Work" fill className="object-cover" />
                      </div>
                    )}
                    {seller.studio_images[3] && (
                      <div className="relative aspect-[3/4] rounded-3xl overflow-hidden shadow-2xl">
                        <Image src={seller.studio_images[3]} alt="Tools" fill className="object-cover" />
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="aspect-[4/3] bg-neutral-200 rounded-3xl flex items-center justify-center text-neutral-400 italic">
                  No studio photos shared yet.
                </div>
              )}
              {/* Decorative Elements */}
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-indigo-600/10 rounded-full blur-3xl -z-10" />
              <div className="absolute -top-6 -left-6 w-32 h-32 bg-purple-600/10 rounded-full blur-3xl -z-10" />
            </div>
          </div>

          <hr className="border-neutral-200" />

          {/* Products Section */}
          <section>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
              <div>
                <h2 className="text-2xl md:text-3xl font-black text-neutral-900 tracking-tight">The Collection</h2>
                <p className="text-neutral-500 font-medium mt-1">Unique handcrafted creations by {seller.store_name}</p>
              </div>
              <div className="px-4 py-2 bg-white rounded-full border border-neutral-100 text-xs font-bold text-neutral-500 shadow-sm">
                {products.length} Artisan Items
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {products.length === 0 && (
              <div className="text-center py-24 bg-white rounded-[3rem] border border-dashed border-neutral-300">
                <div className="w-16 h-16 bg-neutral-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Package className="w-8 h-8 text-neutral-300" />
                </div>
                <h3 className="text-lg font-bold text-neutral-900">No items listed yet</h3>
                <p className="text-neutral-500 mt-1">This artisan is currently working on new creations.</p>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};
