'use client';

import { ShoppingCartIcon, ExternalLink } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/hooks/useCart';
import { Product, ColorOption } from '@/types/product';

interface AddToCartButtonProps {
  product: Product;
  isDirectSale: boolean;
  selectedColors?: string[];
}

export default function AddToCartButton({ product, isDirectSale, selectedColors }: AddToCartButtonProps) {
  const router = useRouter();
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    if (selectedColors && selectedColors.length > 0) {
      // Parse colors to find specific images
      let productColors: (string | ColorOption)[] = [];
      try {
        const parsed = typeof product.colors === 'string' ? JSON.parse(product.colors) : product.colors;
        productColors = Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        console.error('Failed to parse colors in AddToCartButton:', e);
      }

      // Add each selected color as a separate item
      selectedColors.forEach(colorName => {
        const colorOption = productColors.find(c => (typeof c === 'string' ? c : c.name) === colorName);
        const colorImageUrl = typeof colorOption === 'object' && colorOption !== null && 'image_url' in colorOption ? colorOption.image_url : undefined;

        addToCart({
          id: product.id,
          name: product.name,
          slug: product.slug,
          price: Number(product.price),
          originalPrice: product.original_price ? Number(product.original_price) : undefined,
          image_url: product.image_url,
          purchase_type: product.purchase_type,
          product_condition: product.product_condition,
          affiliate_url: product.affiliate_url,
          color: colorName,
          color_image: colorImageUrl
        });
      });
    } else {
      // Default behavior if no colors selected or available
      addToCart({
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: Number(product.price),
        originalPrice: product.original_price ? Number(product.original_price) : undefined,
        image_url: product.image_url,
        purchase_type: product.purchase_type,
        product_condition: product.product_condition,
        affiliate_url: product.affiliate_url,
      });
    }
    router.push('/cart');
  };

  if (!isDirectSale) {
    return (
      <a
        href={product.affiliate_url}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full text-white py-3 md:py-4 px-6 rounded-lg font-semibold text-base md:text-lg transition-colors flex items-center justify-center space-x-2 cursor-pointer hover:bg-amber-600 bg-amber-500"
      >
        <span>View Deal</span>
        <ExternalLink className="w-4 h-4 md:w-5 md:h-5" />
      </a>
    );
  }

  const isOutOfStock = product.stock_quantity !== null && product.stock_quantity !== undefined && product.stock_quantity <= 0;

  if (isOutOfStock) {
    return (
      <button
        disabled
        className="w-full text-white py-3 md:py-4 px-6 rounded-lg font-semibold text-base md:text-lg flex items-center justify-center space-x-2 cursor-not-allowed bg-gray-400"
      >
        <span>Out of Stock</span>
      </button>
    );
  }

  return (
    <button
      onClick={handleAddToCart}
      className="w-full text-white py-3 md:py-4 px-6 rounded-lg font-semibold text-base md:text-lg transition-colors flex items-center justify-center space-x-2 cursor-pointer hover:bg-purple-700 bg-purple-600"
    >
      <span>Add to Cart</span>
      <ShoppingCartIcon className="w-4 h-4 md:w-5 md:h-5" />
    </button>
  );
}
