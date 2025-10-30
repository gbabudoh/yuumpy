'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface ProductBannerAdProps {
  bannerAd: {
    title?: string;
    description?: string;
    image_url?: string;
    link_url?: string;
    duration?: string;
    is_repeating?: boolean;
    start_date?: string;
    end_date?: string;
    is_active?: boolean;
  };
}

export default function ProductBannerAd({ bannerAd }: ProductBannerAdProps) {
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    console.log('ProductBannerAd - bannerAd data:', bannerAd);
    
    if (!bannerAd || !bannerAd.is_active) {
      console.log('ProductBannerAd - not showing: bannerAd missing or not active');
      setShouldShow(false);
      return;
    }

    // For now, let's simplify the logic to always show if active
    // We can add date logic back later once we confirm the basic functionality works
    console.log('ProductBannerAd - showing banner ad');
    setShouldShow(true);
  }, [bannerAd]);

  const getDurationInMs = (duration: string): number => {
    switch (duration) {
      case '1_week':
        return 7 * 24 * 60 * 60 * 1000;
      case '2_weeks':
        return 14 * 24 * 60 * 60 * 1000;
      case '3_weeks':
        return 21 * 24 * 60 * 60 * 1000;
      case '4_weeks':
        return 28 * 24 * 60 * 60 * 1000;
      case '6_months':
        return 6 * 30 * 24 * 60 * 60 * 1000;
      default:
        return 7 * 24 * 60 * 60 * 1000;
    }
  };

  const handleBannerClick = () => {
    if (bannerAd.link_url) {
      window.open(bannerAd.link_url, '_blank', 'noopener,noreferrer');
    }
  };

  if (!shouldShow) {
    return null;
  }

  return (
    <div className="mt-6">
      <div 
        className="relative w-full h-32 bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
        onClick={handleBannerClick}
      >
        {bannerAd.image_url ? (
          <Image
            src={bannerAd.image_url}
            alt={bannerAd.title || 'Banner Advertisement'}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-gray-200">
            <div className="text-center">
              <div className="text-lg font-bold text-gray-600 mb-1">
                {bannerAd.title || 'Banner Ad'}
              </div>
              {bannerAd.description && (
                <div className="text-gray-500 text-xs">
                  {bannerAd.description}
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Overlay with title and description if image exists */}
        {bannerAd.image_url && (bannerAd.title || bannerAd.description) && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
            {bannerAd.title && (
              <h3 className="text-white font-semibold text-sm mb-1">
                {bannerAd.title}
              </h3>
            )}
            {bannerAd.description && (
              <p className="text-white/90 text-xs">
                {bannerAd.description}
              </p>
            )}
          </div>
        )}
        
        {/* Ad indicator */}
        <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
          Ad
        </div>
      </div>
    </div>
  );
}
