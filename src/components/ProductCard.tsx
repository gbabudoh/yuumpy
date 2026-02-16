'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ArrowTopRightOnSquareIcon, EyeIcon, ShoppingCartIcon } from '@heroicons/react/24/outline';
import { useCart } from '@/hooks/useCart';

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
  purchase_type?: 'affiliate' | 'direct';
  product_condition?: 'new' | 'refurbished' | 'used';
}

interface ProductCardProps {
  product: Product;
  viewMode?: 'grid' | 'list';
}

export default function ProductCard({ product, viewMode = 'grid' }: ProductCardProps) {
  const router = useRouter();
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    addToCart(product);
    router.push('/cart');
  };

  const discountPercentage = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  // Determine if this is a direct sale product (no affiliate_url or purchase_type is 'direct')
  const isDirectSale = product.purchase_type === 'direct' || !product.affiliate_url;

  // Get condition badge styling
  const getConditionBadge = () => {
    const condition = product.product_condition || 'new';
    
    if (condition === 'new') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-green-100 text-green-800">
          New
        </span>
      );
    }
    if (condition === 'refurbished') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-800">
          Refurbished
        </span>
      );
    }
    if (condition === 'used') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-amber-100 text-amber-800">
          Used
        </span>
      );
    }
    return null;
  };

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
            <div className="flex items-center gap-2 mb-1">
              <Link href={`/products/${product.slug}`}>
                <h3 className="font-semibold text-gray-900 line-clamp-1 hover:text-blue-600 transition-colors cursor-pointer">
                  {product.name}
                </h3>
              </Link>
              {getConditionBadge()}
            </div>

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

          {/* Actions */}
          <div className="flex-shrink-0 flex flex-col space-y-2">
            <Link
              href={`/products/${product.slug}`}
              className="bg-gray-100 text-gray-700 py-2 px-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-1 text-sm whitespace-nowrap hover:bg-gray-200 cursor-pointer"
            >
              <EyeIcon className="w-4 h-4" />
              <span>View</span>
            </Link>

            {isDirectSale ? (
              <button
                onClick={handleAddToCart}
                className="bg-purple-600 text-white py-2 px-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-1 text-sm whitespace-nowrap hover:bg-purple-700 cursor-pointer shadow-sm shadow-purple-100"
              >
                <ShoppingCartIcon className="w-4 h-4" />
                <span>Add to Cart</span>
              </button>
            ) : (
              <a
                href={product.affiliate_url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-amber-500 text-white py-2 px-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-1 text-sm whitespace-nowrap hover:bg-amber-600 cursor-pointer shadow-sm shadow-amber-100"
              >
                <span>View Deal</span>
                <ArrowTopRightOnSquareIcon className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden group h-full flex flex-col">
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

        {/* Discount Badge */}
        {discountPercentage > 0 && (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md shadow-sm z-10 transition-transform group-hover:scale-110">
            {discountPercentage}% OFF
          </div>
        )}
      </Link>

      {/* Product Info */}
      <div className="p-3 sm:p-4 md:p-6 flex flex-col flex-grow">
        <div className="flex items-start justify-between gap-2 mb-1 sm:mb-2">
          <Link href={`/products/${product.slug}`}>
            <h3 className="font-semibold text-gray-900 line-clamp-2 hover:text-blue-600 transition-colors cursor-pointer text-sm sm:text-base">
              {product.name}
            </h3>
          </Link>
          {getConditionBadge()}
        </div>

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

        {/* Actions */}
        <div className="mt-auto pt-4">
          <div className="flex flex-col gap-2">
            <Link
              href={`/products/${product.slug}`}
              className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2 text-xs hover:bg-gray-200 cursor-pointer border border-gray-200"
            >
              <EyeIcon className="w-4 h-4" />
              <span>View Product</span>
            </Link>

            {isDirectSale ? (
              <button
                onClick={handleAddToCart}
                className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2 text-xs hover:bg-purple-700 cursor-pointer shadow-sm shadow-purple-100"
              >
                <ShoppingCartIcon className="w-4 h-4" />
                <span>Add to Cart</span>
              </button>
            ) : (
              <a
                href={product.affiliate_url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-amber-500 text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2 text-xs hover:bg-amber-600 cursor-pointer shadow-sm shadow-amber-100"
              >
                <span>View Deal</span>
                <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
