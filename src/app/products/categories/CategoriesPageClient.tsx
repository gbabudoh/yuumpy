'use client';

import { useState } from 'react';
import { Search, X, List, LayoutGrid } from 'lucide-react';
import CategoryCard from '@/components/CategoryCard';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export interface CategoriesCategory {
  id: number;
  name: string;
  slug: string;
  description: string;
  image_url?: string;
  icon_url?: string;
  product_count: number;
  is_active: boolean;
}

interface CategoriesPageClientProps {
  initialCategories: CategoriesCategory[];
}

export default function CategoriesPageClient({ initialCategories }: CategoriesPageClientProps) {
  const [categories] = useState<CategoriesCategory[]>(initialCategories);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'count'>('name');
  const [viewMode, setViewMode] = useState<'grid' | 'compact'>('grid');

  const filteredCategories = categories
    .filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'count') return b.product_count - a.product_count;
      return a.name.localeCompare(b.name);
    });

  const totalProducts = categories.reduce((sum, c) => sum + c.product_count, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Hero Header */}
        <div className="relative rounded-2xl overflow-hidden mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-purple-900 to-gray-900" />
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(139,92,246,0.4) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(99,102,241,0.4) 0%, transparent 50%)',
          }} />
          <div className="relative px-6 py-10 md:px-10 md:py-14">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Browse Categories</h1>
            <p className="text-gray-400 text-sm md:text-base max-w-xl">
              Explore {categories.length} categories with {totalProducts} products from verified sellers across the marketplace.
            </p>

            {/* Search Bar */}
            <div className="mt-6 max-w-lg">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-10 py-3 bg-white/10 backdrop-blur-sm border border-white/15 rounded-xl text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-400/50 transition-all"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded-lg transition-colors cursor-pointer">
                    <X className="w-4 h-4 text-gray-400" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <p className="text-sm text-gray-500">
              {filteredCategories.length} {filteredCategories.length === 1 ? 'category' : 'categories'}
              {searchQuery && <span className="text-purple-600 font-medium"> matching &ldquo;{searchQuery}&rdquo;</span>}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'name' | 'count')}
              className="text-xs px-3 py-2 bg-white border border-gray-200 rounded-lg text-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500/20 cursor-pointer"
            >
              <option value="name">A — Z</option>
              <option value="count">Most Products</option>
            </select>

            {/* View Toggle */}
            <div className="flex bg-white border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 transition-colors cursor-pointer ${viewMode === 'grid' ? 'bg-purple-50 text-purple-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('compact')}
                className={`p-2 transition-colors cursor-pointer ${viewMode === 'compact' ? 'bg-purple-50 text-purple-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Categories Grid */}
        {filteredCategories.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Search className="w-7 h-7 text-gray-300" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">No categories found</h3>
            <p className="text-sm text-gray-500 mb-4">Try a different search term</p>
            <button onClick={() => setSearchQuery('')}
              className="text-sm text-purple-600 hover:text-purple-700 font-medium cursor-pointer">
              Clear search
            </button>
          </div>
        ) : (
          <div className={`grid gap-3 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2'}`}>
            {filteredCategories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
