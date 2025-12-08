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
    <div className="flex gap-4">
      {/* Thumbnail Gallery - Vertical on Left */}
      <div className="flex flex-col gap-3 w-20">
        {displayImages.slice(0, 4).map((image, index) => (
          <button
            key={index}
            onClick={() => setSelectedImage(index)}
            className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
              selectedImage === index
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

      {/* Main Image */}
      <div className="flex-1 aspect-square bg-white rounded-xl shadow-lg overflow-hidden">
        <Image
          src={displayImages[selectedImage]}
          alt={productName}
          width={600}
          height={600}
          className="w-full h-full object-cover"
          priority
        />
      </div>
    </div>
  );
}
