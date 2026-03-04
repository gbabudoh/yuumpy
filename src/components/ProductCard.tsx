'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Eye, ExternalLink } from 'lucide-react';
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
  seller_store_slug?: string;
}

interface ProductCardProps {
  product: Product;
  viewMode?: 'grid' | 'list';
}

export default function ProductCard({ product, viewMode = 'grid' }: ProductCardProps) {
  const router = useRouter();
  const { addToCart } = useCart();

  const productUrl = product.seller_store_slug
    ? `/products/${product.seller_store_slug}/${product.slug}`
    : `/products/${product.slug}`;

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
          <Link href={productUrl} className="w-24 h-24 flex-shrink-0 overflow-hidden rounded-lg relative cursor-pointer">
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
              <Link href={productUrl}>
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
              href={productUrl}
              className="bg-gray-100 text-gray-700 py-2 px-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-1 text-sm whitespace-nowrap hover:bg-gray-200 cursor-pointer"
            >
              <Eye className="w-4 h-4" />
              <span>View</span>
            </Link>

            {isDirectSale ? (
              <button
                onClick={handleAddToCart}
                className="bg-purple-600 text-white py-2 px-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-1 text-sm whitespace-nowrap hover:bg-purple-700 cursor-pointer shadow-sm shadow-purple-100"
              >
                <ShoppingCart className="w-4 h-4" />
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
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="group h-full flex flex-col glass border border-gray-100 rounded-[32px] overflow-hidden hover:shadow-[0_40px_80px_-20px_rgba(99,102,241,0.2)] transition-all duration-700 hover:-translate-y-2">
      <Link href={productUrl} className="relative aspect-square overflow-hidden m-2 rounded-[28px] cursor-pointer">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-1000 group-hover:scale-110"
            loading="lazy"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="w-full h-full bg-gray-50 flex items-center justify-center">
            <span className="text-gray-400 text-sm font-bold uppercase tracking-widest">No Image</span>
          </div>
        )}

        {/* Discount Badge */}
        {discountPercentage > 0 && (
          <div className="absolute top-4 left-4 bg-[#020617] text-white text-[10px] font-black px-3 py-1.5 rounded-full z-10 shadow-2xl">
            {discountPercentage}% OFF
          </div>
        )}

        {/* Floating Quick View Icon */}
        <div className="absolute inset-0 bg-[#020617]/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center scale-75 group-hover:scale-100 transition-transform duration-500">
               <Eye className="w-6 h-6 text-[#020617]" />
            </div>
        </div>
      </Link>

      {/* Product Info */}
      <div className="p-6 flex flex-col flex-grow">
        <div className="flex items-start justify-between gap-2 mb-4">
          <Link href={productUrl}>
            <h3 className="text-lg font-black text-gray-900 group-hover:text-primary transition-colors cursor-pointer leading-tight tracking-tight">
              {product.name}
            </h3>
          </Link>
        </div>

        {/* Price & Condition */}
        <div className="flex items-center justify-between mt-auto mb-6">
          <div className="flex flex-col">
            <span className="text-2xl font-black text-gray-900">
              £{Number(product.price).toFixed(2)}
            </span>
            {product.originalPrice && (
              <span className="text-sm text-gray-400 line-through font-bold">
                £{Number(product.originalPrice).toFixed(2)}
              </span>
            )}
          </div>
          {getConditionBadge()}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
            {isDirectSale ? (
              <button
                onClick={handleAddToCart}
                className="w-full bg-purple-600 text-white py-4 rounded-2xl font-black transition-all duration-300 flex items-center justify-center space-x-2 text-xs hover:scale-105 active:scale-95 shadow-xl cursor-pointer"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>SECURE CHECKOUT</span>
              </button>
            ) : (
              <a
                href={product.affiliate_url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-amber-500 text-white py-4 rounded-2xl font-black transition-all duration-300 flex items-center justify-center space-x-2 text-xs hover:scale-105 active:scale-95 shadow-xl cursor-pointer"
              >
                <span>VIEW DEAL</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
        </div>
      </div>
    </div>
  );
}
