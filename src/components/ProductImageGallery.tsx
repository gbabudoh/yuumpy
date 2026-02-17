'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface ProductImageGalleryProps {
  images: string[];
  productName: string;
}

export default function ProductImageGallery({ images, productName }: ProductImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0);

  // Ensure we have at least one image
  const displayImages = images.length > 0 ? images : ['https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600'];

  // Reset selected image when images prop changes
  useEffect(() => {
    setSelectedImage(0);
  }, [images]);

  // Handle case where selected image index might be out of bounds after image update
  const currentImageIndex = selectedImage < displayImages.length ? selectedImage : 0;

  return (
    <div className="flex flex-col md:flex-row gap-4">
      {/* Thumbnail Gallery - Vertical on Desktop, Hidden on Mobile */}
      {displayImages.length > 1 && (
        <div className="hidden md:flex md:flex-col gap-2 order-1">
          {displayImages.slice(0, 5).map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedImage(index)}
              className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                currentImageIndex === index
                  ? 'border-blue-600 shadow-md'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Image
                src={image}
                alt={`${productName} - Image ${index + 1}`}
                width={80}
                height={80}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Main Image and Mobile Thumbnails */}
      <div className="flex-1 space-y-4 order-2">
        {/* Main Image */}
        <div className="aspect-square bg-white rounded-xl shadow-lg overflow-hidden">
          <Image
            src={displayImages[currentImageIndex]}
            alt={productName}
            width={600}
            height={600}
            className="w-full h-full object-cover"
            priority
          />
        </div>

        {/* Thumbnail Gallery - Horizontal on Mobile Only */}
        {displayImages.length > 1 && (
          <div className="flex md:hidden gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {displayImages.slice(0, 5).map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                  currentImageIndex === index
                    ? 'border-blue-600 shadow-md'
                    : 'border-gray-200'
                }`}
              >
                <Image
                  src={image}
                  alt={`${productName} - Image ${index + 1}`}
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
