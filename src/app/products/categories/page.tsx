'use client';

import { useState, useEffect } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import CategoryCard from '@/components/CategoryCard';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  image_url?: string;
  icon_url?: string;
  product_count: number;
  is_active: boolean;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      // Fetch only main categories (parent_id IS NULL)
      const response = await fetch('/api/categories?parent_only=true');
      if (response.ok) {
        const data = await response.json();
        setCategories(Array.isArray(data) ? data : []);
      } else {
        console.error('Failed to fetch categories:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle category checkbox changes
  const handleCategoryChange = (categorySlug: string, checked: boolean) => {
    if (checked) {
      setSelectedCategories([...selectedCategories, categorySlug]);
    } else {
      setSelectedCategories(selectedCategories.filter(slug => slug !== categorySlug));
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategories([]);
  };

  const filteredCategories = categories.filter(category => {
    // Search filter
    const matchesSearch = category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         category.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Category filter
    const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(category.slug);
    
    return matchesSearch && matchesCategory;
  });




  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Main Categories</h1>
          <p className="text-gray-600">Browse products by main category</p>
        </div>

        {/* Mobile Layout: Stack vertically */}
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Filters Section - Top on mobile, Sidebar on desktop */}
          <div className="w-full lg:w-80 lg:flex-shrink-0">
            <div className="bg-white rounded-xl shadow-lg p-4 lg:p-6 lg:sticky lg:top-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 lg:mb-6">Filters</h3>
              
              {/* Search */}
              <div className="mb-4 lg:mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Search Categories</label>
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search categories..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>
              </div>

              {/* Categories Filter */}
              <div className="mb-4 lg:mb-6">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Categories</h4>
                <div className="space-y-2 lg:space-y-2">
                  <div className="grid grid-cols-2 gap-2 lg:grid-cols-1 lg:gap-0">
                    {categories.slice(0, Math.ceil(categories.length / 2)).map((category) => (
                      <label key={category.id} className="flex items-center space-x-1 lg:space-x-2 text-xs lg:text-sm">
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(category.slug)}
                          onChange={(e) => handleCategoryChange(category.slug, e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 flex-shrink-0"
                        />
                        <span className="text-gray-700 truncate">{category.name}</span>
                        <span className="text-gray-500 flex-shrink-0">({category.product_count})</span>
                      </label>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-2 lg:grid-cols-1 lg:gap-0">
                    {categories.slice(Math.ceil(categories.length / 2)).map((category) => (
                      <label key={category.id} className="flex items-center space-x-1 lg:space-x-2 text-xs lg:text-sm">
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(category.slug)}
                          onChange={(e) => handleCategoryChange(category.slug, e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 flex-shrink-0"
                        />
                        <span className="text-gray-700 truncate">{category.name}</span>
                        <span className="text-gray-500 flex-shrink-0">({category.product_count})</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Clear Filters */}
              <button 
                onClick={clearFilters}
                className="w-full text-sm text-gray-600 hover:text-gray-800 underline"
              >
                Clear All Filters
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Main Categories</h2>
                <p className="text-gray-600 text-sm">
                  {filteredCategories.length} main categories found
                </p>
              </div>
            </div>

            {/* Categories Grid */}
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 md:gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-xl shadow-lg overflow-hidden animate-pulse">
                    <div className="h-32 md:h-48 bg-gray-200"></div>
                    <div className="p-3 md:p-6">
                      <div className="h-4 md:h-6 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 md:h-4 bg-gray-200 rounded w-2/3 mb-2 md:mb-4"></div>
                      <div className="flex justify-between items-center">
                        <div className="h-3 md:h-4 bg-gray-200 rounded w-16 md:w-20"></div>
                        <div className="h-6 md:h-8 bg-gray-200 rounded w-16 md:w-24"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredCategories.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MagnifyingGlassIcon className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No categories found</h3>
                <p className="text-gray-600">Try adjusting your search criteria</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 md:gap-6">
                {filteredCategories.map((category) => (
                  <CategoryCard key={category.id} category={category} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
