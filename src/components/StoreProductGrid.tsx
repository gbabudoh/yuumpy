'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Package, SlidersHorizontal, X } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  slug: string;
  price: string;
  original_price: string;
  image_url: string;
  category_name: string;
  product_condition: string;
}

interface StoreProductGridProps {
  products: Product[];
  storeName: string;
  storeSlug?: string;
}

export default function StoreProductGrid({ products, storeName, storeSlug }: StoreProductGridProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'newest' | 'price-low' | 'price-high'>('newest');

  // Extract unique categories from the seller's actual products
  const categories = useMemo(() => {
    const catMap = new Map<string, number>();
    products.forEach(p => {
      const cat = p.category_name || 'General';
      catMap.set(cat, (catMap.get(cat) || 0) + 1);
    });
    return Array.from(catMap.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count }));
  }, [products]);

  // Filter and sort
  const filtered = useMemo(() => {
    let result = [...products];

    if (activeCategory) {
      result = result.filter(p => (p.category_name || 'General') === activeCategory);
    }

    switch (sortBy) {
      case 'price-low':
        result.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
        break;
      case 'price-high':
        result.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
        break;
      default:
        break; // already newest first from DB
    }

    return result;
  }, [products, activeCategory, sortBy]);

  if (products.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
          <Package className="w-7 h-7 text-gray-300" />
        </div>
        <p className="text-gray-500 text-lg">This seller hasn&apos;t listed any products yet.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Category pills + sort */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveCategory(null)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              !activeCategory
                ? 'bg-gray-900 text-white shadow-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All ({products.length})
          </button>
          {categories.map(cat => (
            <button
              key={cat.name}
              onClick={() => setActiveCategory(activeCategory === cat.name ? null : cat.name)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeCategory === cat.name
                  ? 'bg-gray-900 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat.name} ({cat.count})
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <SlidersHorizontal className="w-4 h-4 text-gray-400" />
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as typeof sortBy)}
            className="text-sm text-gray-600 bg-gray-100 border-0 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900/10 cursor-pointer"
          >
            <option value="newest">Newest First</option>
            <option value="price-low">Price: Low → High</option>
            <option value="price-high">Price: High → Low</option>
          </select>
        </div>
      </div>

      {/* Active filter indicator */}
      {activeCategory && (
        <div className="flex items-center gap-2 mb-4">
          <span className="text-sm text-gray-500">Showing:</span>
          <button
            onClick={() => setActiveCategory(null)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 text-white text-sm font-medium rounded-full hover:bg-gray-700 transition-colors"
          >
            {activeCategory}
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Products grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No products in this category.</p>
          <button onClick={() => setActiveCategory(null)} className="text-sm text-gray-900 font-medium mt-2 hover:underline">
            View all products
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {filtered.map((product) => (
            <Link key={product.id} href={storeSlug ? `/products/${storeSlug}/${product.slug}` : `/products/${product.slug}`} className="group">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                <div className="aspect-square bg-gray-100 relative overflow-hidden">
                  {product.image_url ? (
                    <Image src={product.image_url} alt={product.name} fill className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl">📷</div>
                  )}
                  {product.product_condition !== 'new' && (
                    <span className="absolute top-2 left-2 bg-amber-100 text-amber-700 text-xs px-2 py-1 rounded-full capitalize">{product.product_condition}</span>
                  )}
                </div>
                <div className="p-4">
                  <p className="text-xs text-gray-500 mb-1">{product.category_name || 'General'}</p>
                  <h3 className="font-semibold text-gray-900 text-sm mb-2 line-clamp-2">{product.name}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-gray-900">£{parseFloat(product.price).toFixed(2)}</span>
                    {product.original_price && parseFloat(product.original_price) > parseFloat(product.price) && (
                      <>
                        <span className="text-sm text-gray-400 line-through">£{parseFloat(product.original_price).toFixed(2)}</span>
                        <span className="text-[10px] bg-red-50 text-red-600 px-1.5 py-0.5 rounded-full font-semibold">
                          {Math.round(((parseFloat(product.original_price) - parseFloat(product.price)) / parseFloat(product.original_price)) * 100)}% off
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
