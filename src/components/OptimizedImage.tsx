'use client';

import Image from 'next/image';
import { useState } from 'react';

// Helper function to generate Cloudinary optimized URLs
const getCloudinaryUrl = (src: string, width?: number, height?: number, quality: string = 'auto') => {
  // Check if it's already a Cloudinary URL
  if (src.includes('cloudinary.com')) {
    // Extract public_id from Cloudinary URL
    const urlParts = src.split('/');
    const publicId = urlParts[urlParts.length - 1].split('.')[0];
    
    // Build optimized URL
    const transformations = [];
    if (width) transformations.push(`w_${width}`);
    if (height) transformations.push(`h_${height}`);
    transformations.push(`q_${quality}`);
    transformations.push('f_auto');
    
    const transformationString = transformations.join(',');
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'your-cloud-name';
    
    return `https://res.cloudinary.com/${cloudName}/image/upload/${transformationString}/${publicId}`;
  }
  
  // Return original URL if not Cloudinary
  return src;
};

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  className?: string;
  sizes?: string;
  priority?: boolean;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  quality?: string;
  crop?: 'fill' | 'fit' | 'scale' | 'crop' | 'thumb';
}

export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  fill = false,
  className = '',
  sizes,
  priority = false,
  placeholder = 'empty',
  blurDataURL,
  quality = 'auto',
  crop = 'fit'
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Fallback image for errors
  const fallbackSrc = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDQwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNzUgMTUwSDIyNVYyNTBIMTc1VjE1MFoiIGZpbGw9IiM5Q0EzQUYiLz4KPHBhdGggZD0iTTE1MCAyMDBMMjAwIDE1MEwyNTAgMjAwVjI1MEgxNTBWMjAwWiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K';

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
  };

  // Generate optimized Cloudinary URL
  const optimizedSrc = getCloudinaryUrl(src, width, height, quality);

  const imageProps = {
    src: hasError ? fallbackSrc : optimizedSrc,
    alt,
    className: `${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`,
    onLoad: handleLoad,
    onError: handleError,
    loading: priority ? 'eager' as const : 'lazy' as const,
    placeholder,
    blurDataURL,
    sizes: sizes || '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
  };

  if (fill) {
    return (
      <Image
        {...imageProps}
        fill
      />
    );
  }

  return (
    <Image
      {...imageProps}
      width={width || 400}
      height={height || 400}
    />
  );
}