'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';

interface Product {
  id: number;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  image_url: string;
  isFeatured?: boolean;
  isBestseller?: boolean;
  affiliate_url?: string;
}

interface ProductCardProps {
  product: Product;
  viewMode?: 'grid' | 'list';
  categoryId?: number;
}

export default function ProductCard({ product, viewMode = 'grid', categoryId }: ProductCardProps) {
  const discountPercentage = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  if (viewMode === 'list') {
    return (
      <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden group">
        <div className="flex items-center p-4 gap-4">
          {/* Product Image - Smaller for list view */}
          <Link href={`/products/${product.slug}`} className="w-24 h-24 flex-shrink-0 overflow-hidden rounded-lg relative">
            {product.image_url ? (
              <Image
                src={product.image_url}
                alt={product.name}
                fill
                className="object-cover"
                loading="lazy"
                sizes="96px"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-400 text-xs">No Image</span>
              </div>
            )}
          </Link>

          {/* Product Info - Takes remaining space */}
          <div className="flex-1 min-w-0 pr-4">
            <Link href={`/products/${product.slug}`}>
              <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1 hover:text-blue-600 transition-colors cursor-pointer">
                {product.name}
              </h3>
            </Link>

            {/* Price */}
            <div className="flex flex-col">
              <span className="text-lg font-bold text-gray-900">
                £{Number(product.price).toFixed(2)}
              </span>
              {product.originalPrice && (
                <span className="text-sm text-gray-500 line-through">
                  £{Number(product.originalPrice).toFixed(2)}
                </span>
              )}
            </div>
          </div>

          {/* Buy Now Button */}
          <div className="flex-shrink-0">
            <a
              href={product.affiliate_url || `/products/${product.slug}`}
              target={product.affiliate_url ? "_blank" : "_self"}
              rel={product.affiliate_url ? "noopener noreferrer" : undefined}
              className="text-white py-2 px-3 rounded-lg font-medium transition-colors flex items-center space-x-1 text-sm whitespace-nowrap hover:bg-purple-700 cursor-pointer"
              style={{ backgroundColor: '#8827ee' }}
              onClick={() => {
                // Track product click
                if (typeof window !== 'undefined') {
                  window.gtag?.('event', 'click', {
                    event_category: 'product',
                    event_label: product.name,
                    value: product.id
                  });
                }
              }}
            >
              <span>Buy Now</span>
              <ArrowTopRightOnSquareIcon className="w-4 h-4 text-white" />
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden group h-full flex flex-col">
      {/* Product Image */}
      <Link href={`/products/${product.slug}`} className="relative aspect-square overflow-hidden">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            className="object-cover"
            loading="lazy"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400 text-sm">No Image</span>
          </div>
        )}
      </Link>

      {/* Product Info */}
      <div className="p-3 sm:p-4 md:p-6 flex flex-col flex-grow">
        <Link href={`/products/${product.slug}`}>
          <h3 className="font-semibold text-gray-900 mb-1 sm:mb-2 line-clamp-2 hover:text-blue-600 transition-colors cursor-pointer text-sm sm:text-base">
            {product.name}
          </h3>
        </Link>

        {/* Price */}
        <div className="flex items-center space-x-1 sm:space-x-2 mb-2 sm:mb-4">
          <span className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
            £{Number(product.price).toFixed(2)}
          </span>
          {product.originalPrice && (
            <span className="text-sm sm:text-base md:text-lg text-gray-500 line-through">
              £{Number(product.originalPrice).toFixed(2)}
            </span>
          )}
        </div>

        {/* Buy Now Button - Always at bottom */}
        <div className="mt-auto">
          <a
            href={product.affiliate_url || `/products/${product.slug}`}
            target={product.affiliate_url ? "_blank" : "_self"}
            rel={product.affiliate_url ? "noopener noreferrer" : undefined}
            className="w-full text-white py-2 sm:py-3 px-3 sm:px-4 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-1 sm:space-x-2 text-xs sm:text-sm hover:bg-purple-700 cursor-pointer"
            style={{ backgroundColor: '#8827ee' }}
            onClick={() => {
              // Track product click
              if (typeof window !== 'undefined') {
                window.gtag?.('event', 'click', {
                  event_category: 'product',
                  event_label: product.name,
                  value: product.id
                });
              }
            }}
          >
            <span>Buy Now</span>
            <ArrowTopRightOnSquareIcon className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
          </a>
        </div>
      </div>
    </div>
  );
}
