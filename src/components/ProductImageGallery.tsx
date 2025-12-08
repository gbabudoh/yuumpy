'use client';

import { useState } from 'react';
import Image from 'next/image';

interface ProductImageGalleryProps {
  images: string[];
  productName: string;
}

export default function ProductImageGallery({ images, productName }: ProductImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0);

  // Ensure we have at least one image
  const displayImages = images.length > 0 ? images : ['https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600'];

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="aspect-square bg-white rounded-xl shadow-lg overflow-hidden">
        <Image
          src={displayImages[selectedImage]}
          alt={productName}
          width={600}
          height={600}
          className="w-full h-full object-cover"
          priority
        />
      </div>

      {/* Thumbnail Gallery - Horizontal on Mobile, Vertical on Desktop */}
      <div className="flex md:hidden gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {displayImages.slice(0, 5).map((image, index) => (
          <button
            key={index}
            onClick={() => setSelectedImage(index)}
            className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
              selectedImage === index
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
    </div>
  );
}
