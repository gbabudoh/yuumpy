'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { ZoomIn, Play } from 'lucide-react';
import ImageLightbox from '@/components/ImageLightbox';
import { proxiedMediaUrl } from '@/lib/imgproxy';

interface ProductImageGalleryProps {
  images: string[];
  productName: string;
  videoUrl?: string;
}

export default function ProductImageGallery({ images, productName, videoUrl }: ProductImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [isZooming, setIsZooming] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    setZoomPosition({
      x: ((e.clientX - left) / width) * 100,
      y: ((e.clientY - top) / height) * 100,
    });
  };

  // Ensure we have at least one image
  const displayImages = images.length > 0 ? images : ['https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600'];

  // The video, when present, is one extra slide after the images — this index marks it
  const videoSlideIndex = videoUrl ? displayImages.length : -1;

  // MinIO serves http:// with no TLS — Firefox's HTTPS-Only Mode silently
  // upgrades and then fails to connect, dropping the video entirely. Routing
  // through our own same-origin proxy avoids that upgrade attempt.
  const proxiedVideoUrl = videoUrl ? proxiedMediaUrl(videoUrl) : undefined;

  // Reset selected image when images prop changes
  useEffect(() => {
    setSelectedImage(0);
  }, [images]);

  // Handle case where selected image index might be out of bounds after image update
  const maxIndex = videoUrl ? displayImages.length : displayImages.length - 1;
  const currentImageIndex = selectedImage <= maxIndex ? selectedImage : 0;
  const isVideoSelected = videoUrl !== undefined && currentImageIndex === videoSlideIndex;

  return (
    <div className="flex flex-col md:flex-row gap-4">
      {/* Thumbnail Gallery - Vertical on Desktop, Hidden on Mobile */}
      {(displayImages.length > 1 || videoUrl) && (
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
          {videoUrl && (
            <button
              onClick={() => setSelectedImage(videoSlideIndex)}
              className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 bg-gray-900 transition-all ${
                isVideoSelected
                  ? 'border-blue-600 shadow-md'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <video src={proxiedVideoUrl} muted preload="metadata" className="w-full h-full object-cover" />
              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                <Play className="w-6 h-6 text-white fill-white" />
              </div>
            </button>
          )}
        </div>
      )}

      {/* Main Image and Mobile Thumbnails */}
      <div className="flex-1 space-y-4 order-2">
        {/* Main Image / Video */}
        {isVideoSelected ? (
          <div className="relative aspect-square bg-black rounded-xl shadow-lg overflow-hidden">
            <video
              src={proxiedVideoUrl}
              controls
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div
            className="relative aspect-square bg-white rounded-xl shadow-lg overflow-hidden cursor-zoom-in group/zoom"
            onMouseEnter={() => setIsZooming(true)}
            onMouseLeave={() => setIsZooming(false)}
            onMouseMove={handleMouseMove}
            onClick={() => setLightboxOpen(true)}
          >
            <Image
              src={displayImages[currentImageIndex]}
              alt={productName}
              width={600}
              height={600}
              className="w-full h-full object-cover transition-transform duration-200 ease-out"
              style={isZooming ? { transform: 'scale(2)', transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%` } : undefined}
              priority
            />
            <div className="absolute bottom-3 right-3 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover/zoom:opacity-100 transition-opacity pointer-events-none">
              <ZoomIn className="w-4 h-4" />
            </div>
          </div>
        )}

        {/* Thumbnail Gallery - Horizontal on Mobile Only */}
        {(displayImages.length > 1 || videoUrl) && (
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
            {videoUrl && (
              <button
                onClick={() => setSelectedImage(videoSlideIndex)}
                className={`relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 bg-gray-900 transition-all ${
                  isVideoSelected ? 'border-blue-600 shadow-md' : 'border-gray-200'
                }`}
              >
                <video src={proxiedVideoUrl} muted preload="metadata" className="w-full h-full object-cover" />
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                  <Play className="w-5 h-5 text-white fill-white" />
                </div>
              </button>
            )}
          </div>
        )}
      </div>

      {lightboxOpen && (
        <ImageLightbox
          images={displayImages}
          initialIndex={currentImageIndex}
          productName={productName}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </div>
  );
}
