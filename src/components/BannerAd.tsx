'use client';

import { useRef, useState, useEffect } from 'react';
import { ArrowTopRightOnSquareIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
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
}

export default function BannerAd() {
  const swiperRef = useRef<any>(null);
  const [bannerAds, setBannerAds] = useState<BannerAd[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    fetchBannerAds();
  }, []);

  const fetchBannerAds = async () => {
    try {
      const response = await fetch('/api/banner-ads?active=true');
      
      if (response.ok) {
        const data = await response.json();
        setBannerAds(Array.isArray(data) ? data : []);
      } else {
        setBannerAds([]);
      }
    } catch (error) {
      console.error('Error fetching banner ads:', error);
      setBannerAds([]);
    }
  };

  const handleSlideChange = (swiper: any) => {
    setCurrentSlide(swiper.activeIndex);
  };

  // Don't show banner section if no ads
  if (bannerAds.length === 0) {
    return null;
  }

  return (
    <div className="w-full">
      {/* Mobile: Complete banner slides (image + text + button together) */}
      <div className="md:hidden">
        <section className="relative w-full overflow-hidden">
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            spaceBetween={0}
            slidesPerView={1}
            navigation={bannerAds.length > 1 ? {
              nextEl: '.mobile-banner-button-next',
              prevEl: '.mobile-banner-button-prev' } : false}
            pagination={bannerAds.length > 1 ? {
              clickable: true,
              el: '.mobile-banner-pagination',
              bulletClass: 'banner-pagination-bullet',
              bulletActiveClass: 'banner-pagination-bullet-active' } : false}
            autoplay={bannerAds.length > 1 ? {
              delay: 6000,
              disableOnInteraction: false,
              pauseOnMouseEnter: true } : false}
            loop={bannerAds.length > 1}
            onSlideChange={handleSlideChange}
            className="w-full"
          >
            {bannerAds.map((ad, index) => (
              <SwiperSlide key={`mobile-complete-${ad.id}`}>
                <div className="w-full">
                  {/* Banner Image */}
                  <div className="relative w-full h-[200px] overflow-hidden">
                    <img
                      src={ad.image_url}
                      alt={ad.title}
                      className="w-full h-full object-cover object-center"
                      loading={index === 0 ? "eager" : "lazy"}
                    />
                  </div>

                  {/* Text Overlay - Below image */}
                  <div className="bg-gradient-to-r from-orange-200 via-orange-100 to-yellow-100 p-4">
                    <h1 className="text-lg font-bold text-gray-800 mb-2 leading-tight">
                      {ad.title}
                    </h1>
                    <p className="text-sm text-gray-600 leading-relaxed mb-3">
                      {ad.description}
                    </p>
                    
                    {/* Discover More Button */}
                    {ad.link_url && (
                      <div className="text-center">
                        <a
                          href={ad.link_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 bg-white text-gray-900 px-4 py-2 rounded-xl font-bold text-sm hover:bg-gray-100 hover:scale-105 transition-all duration-300 shadow-lg border border-gray-200 group/btn"
                        >
                          <span>{ad.cta_text || 'Discover More'}</span>
                          <ArrowTopRightOnSquareIcon className="w-4 h-4 transition-transform group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Mobile Navigation Buttons */}
          {bannerAds.length > 1 && (
            <>
              <button className="mobile-banner-button-prev absolute left-2 top-[100px] -translate-y-1/2 z-20 bg-black/30 backdrop-blur-sm hover:bg-black/50 text-white p-2 rounded-full transition-all duration-300 hover:scale-110 group">
                <ChevronLeftIcon className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
              </button>
              <button className="mobile-banner-button-next absolute right-2 top-[100px] -translate-y-1/2 z-20 bg-black/30 backdrop-blur-sm hover:bg-black/50 text-white p-2 rounded-full transition-all duration-300 hover:scale-110 group">
                <ChevronRightIcon className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </button>
            </>
          )}

          {/* Mobile Pagination */}
          {bannerAds.length > 1 && (
            <div className="mobile-banner-pagination absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-1"></div>
          )}
        </section>
      </div>

      {/* Desktop: Original layout */}
      <section className="hidden md:block relative w-full h-[450px] lg:h-[500px] overflow-hidden">
        <Swiper
          modules={[Navigation, Pagination, Autoplay, EffectFade]}
          spaceBetween={0}
          slidesPerView={1}
          effect={bannerAds.length > 1 ? "fade" : undefined}
          fadeEffect={bannerAds.length > 1 ? {
            crossFade: true
          } : undefined}
          navigation={bannerAds.length > 1 ? {
            nextEl: '.banner-button-next',
            prevEl: '.banner-button-prev' } : false}
          pagination={bannerAds.length > 1 ? {
            clickable: true,
            el: '.banner-pagination',
            bulletClass: 'banner-pagination-bullet',
            bulletActiveClass: 'banner-pagination-bullet-active' } : false}
          autoplay={bannerAds.length > 1 ? {
            delay: 6000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true } : false}
          loop={bannerAds.length > 1}
          onSlideChange={handleSlideChange}
          className="h-full w-full"
        >
          {bannerAds.map((ad, index) => (
            <SwiperSlide key={ad.id}>
              <div className="relative h-full w-full group">
                {/* Background: Your uploaded banner image */}
                <div className="absolute inset-0">
                  <img
                    src={ad.image_url}
                    alt={ad.title}
                    className="w-full h-full object-cover object-center"
                    loading={index === 0 ? "eager" : "lazy"}
                  />
                </div>

                {/* Desktop Layout: Three Column Layout */}
                <div className="relative z-10 h-full">
                  <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
                    <div className="grid grid-cols-3 gap-6 lg:gap-8 h-full items-center">
                      
                      {/* Left Column: Text Overlay */}
                      <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-6 lg:p-8 border border-white/10">
                        {/* Title */}
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3 lg:mb-4 leading-tight">
                          {ad.title}
                        </h1>
                        
                        {/* Description */}
                        <p className="text-sm sm:text-base lg:text-lg text-gray-200 leading-relaxed font-medium">
                          {ad.description}
                        </p>
                      </div>

                      {/* Center Column: Empty (image is in background) */}
                      <div></div>

                      {/* Right Column: Empty */}
                      <div></div>

                    </div>
                  </div>
                </div>

                {/* Desktop Bottom Right Corner: CTA Button */}
                {ad.link_url && (
                  <div className="absolute bottom-6 right-6 z-20">
                    <a
                      href={ad.link_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-3 bg-white text-gray-900 px-6 py-3 rounded-2xl font-bold text-sm lg:text-base hover:bg-gray-100 hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-3xl group/btn border-2 border-gray-200"
                    >
                      <span>{ad.cta_text || 'Discover More'}</span>
                      <ArrowTopRightOnSquareIcon className="w-4 h-4 lg:w-5 lg:h-5 transition-transform group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1" />
                    </a>
                  </div>
                )}

                {/* Slide Indicator */}
                {bannerAds.length > 1 && (
                  <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20">
                    <div className="bg-black/30 backdrop-blur-sm rounded-full px-3 py-1 text-white text-xs sm:text-sm font-medium">
                      {index + 1} / {bannerAds.length}
                    </div>
                  </div>
                )}
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

      {/* Custom Navigation Buttons */}
      {bannerAds.length > 1 && (
        <>
          <button className="banner-button-prev absolute left-2 sm:left-4 lg:left-6 top-1/2 -translate-y-1/2 z-20 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-2 sm:p-3 rounded-full transition-all duration-300 hover:scale-110 group">
            <ChevronLeftIcon className="w-5 h-5 sm:w-6 sm:h-6 transition-transform group-hover:-translate-x-0.5" />
          </button>
          <button className="banner-button-next absolute right-2 sm:right-4 lg:right-6 top-1/2 -translate-y-1/2 z-20 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-2 sm:p-3 rounded-full transition-all duration-300 hover:scale-110 group">
            <ChevronRightIcon className="w-5 h-5 sm:w-6 sm:h-6 transition-transform group-hover:translate-x-0.5" />
          </button>
        </>
      )}

      {/* Custom Pagination */}
      {bannerAds.length > 1 && (
        <div className="banner-pagination absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2 sm:gap-3"></div>
      )}
      </section>

      {/* Custom Styles */}
      <style jsx global>{`
        .banner-pagination-bullet {
          width: 12px;
          height: 12px;
          background: rgba(255, 255, 255, 0.4);
          border-radius: 50%;
          cursor: pointer;
          transition: all 0.3s ease;
          backdrop-filter: blur(4px);
        }
        
        .banner-pagination-bullet:hover {
          background: rgba(255, 255, 255, 0.6);
          transform: scale(1.1);
        }
        
        .banner-pagination-bullet-active {
          background: white !important;
          transform: scale(1.2);
          box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
        }
        
        @media (min-width: 640px) {
          .banner-pagination-bullet {
            width: 14px;
            height: 14px;
          }
        }
        
        @media (min-width: 1024px) {
          .banner-pagination-bullet {
            width: 16px;
            height: 16px;
          }
        }
      `}</style>
    </div>
  );
}