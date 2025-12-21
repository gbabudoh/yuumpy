'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { MagnifyingGlassIcon, FunnelIcon, Squares2X2Icon, ListBulletIcon, XMarkIcon } from '@heroicons/react/24/outline';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';

interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  short_description: string;
  price: number;
  original_price?: number;
  affiliate_url: string;
  purchase_type?: 'affiliate' | 'direct';
  product_condition?: 'new' | 'refurbished' | 'used';
  image_url: string;
  category_name: string;
  category_slug: string;
  is_featured: boolean;
  is_bestseller: boolean;
}

interface Category {
  id: number;
  name: string;
  slug: string;
  product_count: number;
}

interface Brand {
  id: number;
  name: string;
  slug: string;
  product_count: number;
}

function ProductsPageContent() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Handle category checkbox changes
  const handleCategoryChange = (categorySlug: string, checked: boolean) => {
    if (checked) {
      setSelectedCategories([...selectedCategories, categorySlug]);
    } else {
      setSelectedCategories(selectedCategories.filter(slug => slug !== categorySlug));
    }
  };

  useEffect(() => {
    // Initialize search term from URL parameters
    const searchParam = searchParams?.get('search');
    if (searchParam) {
      setSearchTerm(searchParam);
    } else {
      // Only fetch products if no search param (otherwise the other useEffect will handle it)
      fetchProducts();
    }
    fetchCategories();
    fetchBrands();
  }, [searchParams]);

  // Handle search param changes
  useEffect(() => {
    const searchParam = searchParams?.get('search');
    const filterParam = searchParams?.get('filter');
    
    if (searchParam !== searchTerm) {
      setSearchTerm(searchParam || '');
    }
    
    // Handle filter parameter (e.g., filter=bestsellers)
    if (filterParam === 'bestsellers') {
      setSortBy('bestseller');
    }
  }, [searchParams, searchTerm]);

  // Refetch products when filters change
  useEffect(() => {
    fetchProducts();
  }, [searchTerm, selectedCategories, selectedBrands, selectedConditions, priceRange, sortBy]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      
      // Build query parameters
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (selectedCategories.length > 0) {
        selectedCategories.forEach(category => params.append('category', category));
      }
      if (selectedBrands.length > 0) {
        selectedBrands.forEach(brand => params.append('brand', brand));
      }
      if (priceRange.min) params.append('min_price', priceRange.min);
      if (priceRange.max) params.append('max_price', priceRange.max);
      if (sortBy) params.append('sort', sortBy);
      
      const response = await fetch(`/api/products?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setProducts(Array.isArray(data) ? data : (data.products || []));
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchBrands = async () => {
    try {
      const response = await fetch('/api/brands');
      if (response.ok) {
        const data = await response.json();
        setBrands(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching brands:', error);
    }
  };

  // Filter products by condition (client-side) and sort
  const filteredProducts = selectedConditions.length > 0
    ? products.filter(p => selectedConditions.includes(p.product_condition || 'new'))
    : products;
  
  const sortedProducts = filteredProducts.sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return Number(a.price) - Number(b.price);
      case 'price-high':
        return Number(b.price) - Number(a.price);
      case 'name':
      default:
        return a.name.localeCompare(b.name);
    }
  });

  const handleBrandToggle = (brand: string) => {
    setSelectedBrands(prev => 
      prev.includes(brand) 
        ? prev.filter(b => b !== brand)
        : [...prev, brand]
    );
  };

  const handleFeatureToggle = (feature: string) => {
    setSelectedFeatures(prev => 
      prev.includes(feature) 
        ? prev.filter(f => f !== feature)
        : [...prev, feature]
    );
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategories([]);
    setPriceRange({ min: '', max: '' });
    setSelectedBrands([]);
    setSelectedFeatures([]);
    setSelectedConditions([]);
    setSortBy('name');
  };

  const features = ['Featured', 'Best Sellers', 'Free Shipping', 'On Sale'];



  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {searchTerm ? `Search Results for "${searchTerm}"` : 'All Products'}
          </h1>
          <p className="text-gray-600">
            {searchTerm 
              ? `Found ${products.length} product${products.length !== 1 ? 's' : ''} matching your search`
              : 'Discover amazing products from our curated collection'
            }
          </p>
          {searchTerm && (
            <div className="mt-4">
              <button
                onClick={() => {
                  setSearchTerm('');
                  // Update URL to remove search parameter
                  const url = new URL(window.location.href);
                  url.searchParams.delete('search');
                  window.history.replaceState({}, '', url.toString());
                }}
                className="text-purple-600 hover:text-purple-700 text-sm font-medium flex items-center space-x-1"
              >
                <span>Clear search</span>
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <div className="lg:w-80">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-8">
              {/* Mobile Filter Header */}
              <div className="flex items-center justify-between mb-6 lg:hidden">
                <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              {/* Search Products */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Search Products</h3>
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>
              </div>

              {/* Categories */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Categories</h3>
                <div className="space-y-2">
                  {Array.isArray(categories) && categories.map((category) => (
                    <label key={category.id} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(category.slug)}
                        onChange={(e) => handleCategoryChange(category.slug, e.target.checked)}
                        className="mr-3 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">
                        {category.name} ({category.product_count})
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Price Range</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Min Price</label>
                    <input
                      type="number"
                      placeholder="£0"
                      value={priceRange.min}
                      onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Max Price</label>
                    <input
                      type="number"
                      placeholder="No limit"
                      value={priceRange.max}
                      onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Popular Brands */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Popular Brands</h3>
                <div className="space-y-2">
                  {Array.isArray(brands) && brands.map((brand) => (
                    <label key={brand.id} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedBrands.includes(brand.slug)}
                        onChange={() => handleBrandToggle(brand.slug)}
                        className="mr-3 text-blue-600 focus:ring-blue-500 rounded"
                      />
                      <span className="text-sm text-gray-700">
                        {brand.name} ({brand.product_count || 0})
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Features */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Features</h3>
                <div className="space-y-2">
                  {features.map((feature) => (
                    <label key={feature} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedFeatures.includes(feature)}
                        onChange={() => handleFeatureToggle(feature)}
                        className="mr-3 text-blue-600 focus:ring-blue-500 rounded"
                      />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Product Condition */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Product Condition</h3>
                <div className="space-y-2">
                  {['new', 'refurbished', 'used'].map((condition) => (
                    <label key={condition} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedConditions.includes(condition)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedConditions([...selectedConditions, condition]);
                          } else {
                            setSelectedConditions(selectedConditions.filter(c => c !== condition));
                          }
                        }}
                        className="mr-3 text-blue-600 focus:ring-blue-500 rounded"
                      />
                      <span className="text-sm text-gray-700 capitalize">{condition}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Clear Filters */}
              <button
                onClick={clearFilters}
                className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
              >
                Clear All Filters
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Top Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              {/* Left Side - Mobile Filter Button and Results Count */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                {/* Mobile Filter Button */}
                <button
                  onClick={() => setShowMobileFilters(true)}
                  className="lg:hidden flex items-center space-x-2 bg-white border border-gray-300 rounded-lg px-4 py-2 hover:bg-gray-50"
                >
                  <FunnelIcon className="w-4 h-4" />
                  <span>Filters</span>
                </button>

                {/* Results Count and Sort By */}
                <div className="flex flex-col gap-2">
                  {!loading && (
                    <p className="text-gray-600 text-sm">
                      Showing {sortedProducts.length} of {products.length} products
                    </p>
                  )}
                  
                  {/* Sort By */}
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm w-fit"
                  >
                    <option value="name">Sort by Name</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                  </select>
                </div>
              </div>

              {/* Right Side - View Controls */}
              <div className="flex items-center ml-auto">
                {/* View Toggle */}
                <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 ${viewMode === 'grid' ? 'text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                    style={viewMode === 'grid' ? { backgroundColor: '#8827ee' } : {}}
                  >
                    <Squares2X2Icon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 ${viewMode === 'list' ? 'text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                    style={viewMode === 'list' ? { backgroundColor: '#8827ee' } : {}}
                  >
                    <ListBulletIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Products Grid */}
            {loading ? (
              <div className={`grid gap-6 ${
                viewMode === 'grid' 
                  ? 'grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                  : 'grid-cols-1'
              }`}>
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="bg-white rounded-lg shadow-sm p-4 animate-pulse">
                    <div className="aspect-square bg-gray-200 rounded-lg mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
                    <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                  </div>
                ))}
              </div>
            ) : sortedProducts.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl shadow-lg">
                <div className="text-gray-400 mb-4">
                  <FunnelIcon className="w-16 h-16 mx-auto" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-600 mb-4">Try adjusting your search or filter criteria</p>
                <button
                  onClick={clearFilters}
                  className="text-white px-6 py-2 rounded-lg transition-colors hover:bg-purple-700 cursor-pointer"
                  style={{ backgroundColor: '#8827ee' }}
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className={`grid gap-6 ${
                viewMode === 'grid' 
                  ? 'grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                  : 'grid-cols-1'
              }`}>
                {sortedProducts.map((product) => (
                  <ProductCard 
                    key={product.id} 
                    viewMode={viewMode}
                    product={{
                      id: product.id,
                      name: product.name,
                      slug: product.slug,
                      price: Number(product.price) || 0,
                      originalPrice: product.original_price ? Number(product.original_price) : undefined,
                      image_url: product.image_url || '',
                      isFeatured: Boolean(product.is_featured),
                      isBestseller: Boolean(product.is_bestseller),
                      affiliate_url: product.affiliate_url,
                      purchase_type: (product as any).purchase_type,
                      product_condition: (product as any).product_condition
                    }} 
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Mobile Filter Overlay */}
        {showMobileFilters && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden">
            <div className="absolute right-0 top-0 h-full w-80 bg-white shadow-xl">
              <div className="p-6 h-full overflow-y-auto">
                {/* Mobile Filter Content - Same as sidebar */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
                  <button
                    onClick={() => setShowMobileFilters(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>

                {/* Search Products */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Search Products</h3>
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                  </div>
                </div>

                {/* Categories */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Categories</h3>
                  <div className="space-y-2">
                      {Array.isArray(categories) && categories.map((category) => (
                        <label key={category.id} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={selectedCategories.includes(category.slug)}
                            onChange={(e) => handleCategoryChange(category.slug, e.target.checked)}
                            className="mr-3 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">
                            {category.name} ({category.product_count})
                          </span>
                        </label>
                      ))}
                  </div>
                </div>

                {/* Price Range */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Price Range</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Min Price</label>
                      <input
                        type="number"
                        placeholder="£0"
                        value={priceRange.min}
                        onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Max Price</label>
                      <input
                        type="number"
                        placeholder="No limit"
                        value={priceRange.max}
                        onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Popular Brands */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Popular Brands</h3>
                  <div className="space-y-2">
                    {Array.isArray(brands) && brands.map((brand) => (
                      <label key={brand.id} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedBrands.includes(brand.slug)}
                          onChange={() => handleBrandToggle(brand.slug)}
                          className="mr-3 text-blue-600 focus:ring-blue-500 rounded"
                        />
                        <span className="text-sm text-gray-700">
                          {brand.name} ({brand.product_count || 0})
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Features */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Features</h3>
                  <div className="space-y-2">
                    {features.map((feature) => (
                      <label key={feature} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedFeatures.includes(feature)}
                          onChange={() => handleFeatureToggle(feature)}
                          className="mr-3 text-blue-600 focus:ring-blue-500 rounded"
                        />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Clear Filters */}
                <button
                  onClick={clearFilters}
                  className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                >
                  Clear All Filters
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading products...</p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    }>
      <ProductsPageContent />
    </Suspense>
  );
}