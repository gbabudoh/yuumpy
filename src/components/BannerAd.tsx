'use client';

import { useState, useEffect } from 'react';
import { 
  ArrowUpRight, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles 
} from 'lucide-react';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, EffectFade } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

interface BannerAd {
  id: number;
  title: string;
  description: string;
  image_url: string;
  link_url?: string;
  cta_text?: string;
  tag?: string;
  product_label?: string;
  rating?: number;
}

export default function BannerAd() {
  const [bannerAds, setBannerAds] = useState<BannerAd[]>([]);
  const [activeId, setActiveId] = useState<number | null>(null);

  useEffect(() => {
    fetchBannerAds();
  }, []);

  const fetchBannerAds = async () => {
    try {
      const response = await fetch('/api/banner-ads?active=true');
      if (response.ok) {
        const data = await response.json();
        const ads = Array.isArray(data) ? data : [];
        setBannerAds(ads);
        if (ads.length > 0) setActiveId(ads[0].id);
      }
    } catch (error) {
      console.error('Error fetching banner ads:', error);
    }
  };

  if (bannerAds.length === 0) return null;

  return (
    <div className="relative group/banner overflow-hidden bg-[#020617]">
      <Swiper
        modules={[Navigation, Pagination, Autoplay, EffectFade]}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        spaceBetween={0}
        slidesPerView={1}
        autoplay={{ delay: 8000, disableOnInteraction: false }}
        loop={bannerAds.length > 1}
        navigation={{
          nextEl: '.banner-next',
          prevEl: '.banner-prev',
        }}
        pagination={{
          clickable: true,
          el: '.banner-dots',
          bulletClass: 'dot',
          bulletActiveClass: 'dot-active',
        }}
        onSlideChange={(swiper) => setActiveId(bannerAds[swiper.realIndex]?.id)}
        className="h-[500px] md:h-[600px] lg:h-[700px]"
      >
        {bannerAds.map((ad) => (
          <SwiperSlide key={ad.id}>
            <div className="relative h-full w-full flex items-center">
              {/* Background — dark with mesh only, no image */}
              <div className="absolute inset-0 bg-[#020617]" />

              {/* Ambient mesh — above image overlays, below text content */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none z-[1]">
                <div className="absolute -top-[10%] -left-[5%] w-[45%] h-[70%] rounded-full bg-indigo-600/20 blur-[120px] animate-mesh" />
                <div className="absolute bottom-0 right-[5%] w-[35%] h-[55%] rounded-full bg-purple-600/15 blur-[100px] animate-mesh" style={{ animationDelay: '-7s' }} />
              </div>

              {/* Content Container */}
              <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className={`transition-all duration-1000 ${activeId === ad.id ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'}`}>
                  {/* Badge */}
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-morphism mb-6 border border-white/10">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    <span className="text-xs font-bold tracking-widest text-white uppercase">{ad.tag || 'Marketplace Choice'}</span>
                  </div>

                  {/* Title */}
                  <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white mb-6 leading-[1.1] tracking-tight">
                    {ad.title.split(' ').map((word, i, arr) => (
                      <span key={i} className={i === arr.length - 1 ? 'text-gradient' : ''}>
                        {word}{' '}
                      </span>
                    ))}
                  </h1>

                  {/* Description */}
                  <p className="text-lg md:text-xl text-gray-300 mb-10 max-w-xl leading-relaxed">
                    {ad.description}
                  </p>

                  {/* CTA Buttons */}
                  <div className="flex flex-wrap gap-4">
                    {ad.link_url && (
                      <a
                        href={ad.link_url}
                        className="group/btn relative px-8 py-4 rounded-2xl bg-white text-[#020617] font-black text-lg flex items-center gap-3 overflow-hidden transition-all duration-300 hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                      >
                        <span>{ad.cta_text || 'Shop Now'}</span>
                        <ArrowUpRight className="w-5 h-5 transition-transform group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1" />
                      </a>
                    )}
                    <button className="px-8 py-4 rounded-2xl glass-morphism text-white font-bold text-lg hover:bg-white/10 transition-all active:scale-95">
                      Learn More
                    </button>
                  </div>
                </div>

                {/* Optional Right Side Asset / Floating Element */}
                <div className={`hidden lg:block transition-all duration-1000 delay-300 ${activeId === ad.id ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
                  <div className="relative aspect-square max-w-lg ml-auto">
                    <div className="absolute inset-0 rounded-3xl glass shadow-2xl animate-float border border-white/20 p-4">
                      <div className="w-full h-full rounded-2xl overflow-hidden relative">
                        <Image
                          src={ad.image_url}
                          alt="feature"
                          fill
                          className="object-cover"
                        />
                        <div className="absolute bottom-4 left-4 right-4 glass-morphism p-4 rounded-xl border border-white/10">
                          <p className="text-white font-bold text-sm">{ad.product_label || 'Verified Premium Item'}</p>
                          <div className="flex items-center gap-1 mt-1">
                            {Array.from({ length: ad.rating ?? 5 }, (_, i) => (
                              <span key={i} className="text-yellow-400 text-xs text-shadow-sm">★</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Circle glow */}
                    <div className="absolute -z-10 -top-10 -right-10 w-64 h-64 bg-indigo-500/30 rounded-full blur-3xl" />
                  </div>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Navigation Controls */}
      <div className="absolute bottom-12 left-6 md:left-12 z-20 flex items-center gap-6">
        <div className="flex gap-2">
          <button className="banner-prev w-12 h-12 rounded-full glass-morphism flex items-center justify-center text-white hover:bg-white hover:text-[#020617] transition-all duration-500 disabled:opacity-30 group">
            <ChevronLeft className="w-6 h-6 transition-transform group-hover:-translate-x-1" />
          </button>
          <button className="banner-next w-12 h-12 rounded-full glass-morphism flex items-center justify-center text-white hover:bg-white hover:text-[#020617] transition-all duration-500 disabled:opacity-30 group">
            <ChevronRight className="w-6 h-6 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
        
        {/* Pagination Dots */}
        <div className="banner-dots flex gap-2"></div>
      </div>

      <style jsx global>{`
        .dot {
          width: 8px;
          height: 8px;
          border-radius: 4px;
          background: rgba(255, 255, 255, 0.2);
          cursor: pointer;
          transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .dot-active {
          width: 32px;
          background: white;
          box-shadow: 0 0 15px rgba(255, 255, 255, 0.5);
        }
      `}</style>
    </div>
  );
}

