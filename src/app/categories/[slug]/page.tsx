'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import ProductCard from '@/components/ProductCard';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface Product {
  id: number;
  name: string;
  slug: string;
  price: string;
  original_price?: string;
  image_url: string;
  description?: string;
  is_featured: boolean;
  is_bestseller: boolean;
  category_name: string;
  category_id?: number;
  category_slug?: string;
  brand_id?: number;
  created_at?: string;
}

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  image_url: string;
  product_count: number;
}

interface Brand {
  id: number;
  name: string;
  slug: string;
  description: string;
  product_count: number;
}

export default function CategoryPage() {
  const params = useParams();
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [subcategories, setSubcategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [filters, setFilters] = useState({
    featured: false,
    bestseller: false,
    priceRange: { min: 0, max: 0 },
    subcategories: [] as string[],
    brands: [] as string[]
  });
  const [priceInputs, setPriceInputs] = useState({ min: '', max: '' });

  useEffect(() => {
    if (params.slug) {
      fetchCategoryData(params.slug as string);
    }
  }, [params.slug]);

  // Separate effect for filters to debounce API calls
  useEffect(() => {
    if (!params.slug) return;
    
    const timeoutId = setTimeout(() => {
      fetchCategoryData(params.slug as string);
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [filters, searchQuery, sortBy]);

  const fetchCategoryData = async (slug: string) => {
    try {
      setLoading(true);
      
      // Fetch category info
      const categoryResponse = await fetch(`/api/categories?slug=${slug}`);
      if (categoryResponse.ok) {
        const categoryData = await categoryResponse.json();
        if (categoryData && categoryData.id) {
          setCategory(categoryData);
          
          // Fetch subcategories for this category
          const subcategoriesResponse = await fetch(`/api/subcategories?category_id=${categoryData.id}`);
          if (subcategoriesResponse.ok) {
            const subcategoriesData = await subcategoriesResponse.json();
            setSubcategories(Array.isArray(subcategoriesData) ? subcategoriesData : []);
          }
        } else {
          console.error('Category data is null or missing ID:', categoryData);
          setCategory(null);
        }
      } else {
        console.error('Failed to fetch category:', categoryResponse.status);
        setCategory(null);
      }

      // Fetch brands
      const brandsResponse = await fetch(`/api/brands?category=${slug}`);
      if (brandsResponse.ok) {
        const brandsData = await brandsResponse.json();
        setBrands(brandsData.filter((brand: Brand) => brand.product_count > 0));
      }

      // Fetch products for this category
      const params = new URLSearchParams();
      
      // If subcategories are selected, use them instead of the main category
      if (filters.subcategories.length > 0) {
        filters.subcategories.forEach(subcategorySlug => {
          params.append('subcategory', subcategorySlug);
        });
      } else {
        // Only use main category if no subcategories are selected
        params.append('category', slug);
      }
      
      if (filters.featured) params.append('featured', 'true');
      if (filters.bestseller) params.append('bestseller', 'true');
      if (searchQuery) params.append('search', searchQuery);
      if (filters.priceRange.min > 0) params.append('min_price', filters.priceRange.min.toString());
      if (filters.priceRange.max > 0) params.append('max_price', filters.priceRange.max.toString());
      if (sortBy) params.append('sort', sortBy);
      
      // Add brand filters
      filters.brands.forEach(brandSlug => {
        params.append('brand', brandSlug);
      });
      
      const apiUrl = `/api/products?${params.toString()}`;
      console.log('Fetching products with URL:', apiUrl);
      console.log('Current filters:', filters);
      const productsResponse = await fetch(apiUrl);
      if (productsResponse.ok) {
        const productsData = await productsResponse.json();
        console.log('Products API response:', productsData);
        setProducts(productsData.products || []);
      } else {
        console.error('Products API error:', productsResponse.status, await productsResponse.text());
        setProducts([]);
      }
    } catch (error) {
      console.error('Error fetching category data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filter: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [filter]: value
    }));
  };

  const handleSubcategoryChange = (subcategorySlug: string, checked: boolean) => {
    console.log('Subcategory change:', subcategorySlug, checked);
    console.log('Available subcategories:', subcategories);
    const newSubcategories = checked 
      ? [...filters.subcategories, subcategorySlug]
      : filters.subcategories.filter(slug => slug !== subcategorySlug);
    console.log('New subcategories filter:', newSubcategories);
    setFilters(prev => ({
      ...prev,
      subcategories: newSubcategories
    }));
  };

  const handleBrandChange = (brandSlug: string, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      brands: checked 
        ? [...prev.brands, brandSlug]
        : prev.brands.filter(slug => slug !== brandSlug)
    }));
  };

  const handlePriceFilter = () => {
    const minPrice = parseFloat(priceInputs.min) || 0;
    const maxPrice = parseFloat(priceInputs.max) || 0;
    
    setFilters(prev => ({
      ...prev,
      priceRange: { min: minPrice, max: maxPrice }
    }));
  };

  const handleSortChange = (newSortBy: string) => {
    setSortBy(newSortBy);
  };

  const clearFilters = () => {
    setFilters({
      featured: false,
      bestseller: false,
      priceRange: { min: 0, max: 0 },
      subcategories: [],
      brands: []
    });
    setPriceInputs({ min: '', max: '' });
    setSearchQuery('');
    setSortBy('newest');
  };

  // Use products directly since filtering is done server-side
  const sortedAndFilteredProducts = products;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          {/* Show skeleton while loading */}
          <div className="mb-8">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-64 mb-4"></div>
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
                  <div>
                    <div className="h-6 bg-gray-200 rounded w-48 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-64 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-32"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
            {/* Sidebar skeleton */}
            <div className="w-full lg:w-72 lg:flex-shrink-0">
              <div className="bg-white rounded-xl shadow-lg p-4 lg:p-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded mb-4 lg:mb-6"></div>
                <div className="space-y-4">
                  <div className="h-10 bg-gray-200 rounded"></div>
                  <div className="h-20 bg-gray-200 rounded"></div>
                  <div className="h-32 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
            
            {/* Products skeleton */}
            <div className="flex-1">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="bg-white rounded-lg shadow-sm p-3 sm:p-4 animate-pulse">
                    <div className="aspect-square bg-gray-200 rounded-lg mb-3 sm:mb-4"></div>
                    <div className="h-3 sm:h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 sm:h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
                    <div className="h-5 sm:h-6 bg-gray-200 rounded w-1/3"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Category Not Found</h1>
            <p className="text-gray-600 mb-6">The category you're looking for doesn't exist.</p>
            <Link 
              href="/categories"
              className="text-white px-6 py-3 rounded-lg transition-colors hover:bg-purple-700 cursor-pointer inline-block"
              style={{ backgroundColor: '#8827ee' }}
            >
              Browse All Categories
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Category Header */}
        <div className="mb-8">
          <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
            <Link href="/" className="hover:text-blue-600">Home</Link>
            <span>/</span>
            <Link href="/categories" className="hover:text-blue-600">Categories</Link>
            <span>/</span>
            <span className="text-gray-900">{category.name}</span>
          </nav>
          
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center space-x-4">
              {category.image_url && (
                <img
                  src={category.image_url}
                  alt={category.name}
                  className="w-16 h-16 rounded-lg object-cover"
                />
              )}
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">{category.name}</h1>
                <p className="text-gray-600 mb-2 text-sm">{category.description}</p>
                {!loading && (
                  <p className="text-xs text-gray-500">
                    {sortedAndFilteredProducts.length} products available
                    {(searchQuery || filters.featured || filters.bestseller || filters.priceRange.min > 0 || filters.priceRange.max > 0) && sortedAndFilteredProducts.length !== products.length && (
                      <span className="text-blue-600"> (filtered from {products.length})</span>
                    )}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Left Sidebar - Filters */}
          <div className="w-full lg:w-72 lg:flex-shrink-0">
            <div className="bg-white rounded-xl shadow-lg p-4 lg:p-6 lg:sticky lg:top-8 z-10">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 lg:mb-6">Filters</h3>
              
              {/* Search */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Search Products</label>
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Price Range</h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={priceInputs.min}
                      onChange={(e) => setPriceInputs(prev => ({ ...prev, min: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <span className="text-gray-500 text-sm">to</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={priceInputs.max}
                      onChange={(e) => setPriceInputs(prev => ({ ...prev, max: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <button 
                    onClick={handlePriceFilter}
                    className="w-full text-white py-2 rounded-lg text-sm transition-colors hover:bg-purple-700 cursor-pointer"
                    style={{ backgroundColor: '#8827ee' }}
                  >
                    Apply Filter
                  </button>
                  {(filters.priceRange.min > 0 || filters.priceRange.max > 0) && (
                    <div className="text-xs text-gray-600 text-center">
                      Filtering: £{filters.priceRange.min || 0} - £{filters.priceRange.max || '∞'}
                    </div>
                  )}
                </div>
              </div>

              {/* Subcategories */}
              {subcategories.length > 0 && (
                <div className="mb-4 lg:mb-6">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Subcategories</h4>
                  <div className="grid grid-cols-2 lg:grid-cols-1 gap-2 lg:gap-0 lg:space-y-1">
                    {subcategories.map((subcategory) => (
                      <label key={subcategory.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer text-xs lg:text-sm">
                        <div className="flex items-center space-x-1 lg:space-x-2">
                          <input
                            type="checkbox"
                            checked={filters.subcategories.includes(subcategory.slug)}
                            onChange={(e) => handleSubcategoryChange(subcategory.slug, e.target.checked)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 flex-shrink-0"
                          />
                          <span className="text-gray-700 truncate">{subcategory.name}</span>
                        </div>
                        <span className="text-gray-500 flex-shrink-0">({subcategory.product_count})</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Brands */}
              <div className="mb-4 lg:mb-6">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Popular Brands</h4>
                <div className="grid grid-cols-2 lg:grid-cols-1 gap-2 lg:gap-0 lg:space-y-1">
                  {brands.length > 0 ? (
                    brands.slice(0, 8).map((brand) => (
                      <label key={brand.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer text-xs lg:text-sm">
                        <div className="flex items-center space-x-1 lg:space-x-2">
                          <input
                            type="checkbox"
                            checked={filters.brands.includes(brand.slug)}
                            onChange={(e) => handleBrandChange(brand.slug, e.target.checked)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 flex-shrink-0"
                          />
                          <span className="text-gray-700 truncate">{brand.name}</span>
                        </div>
                        <span className="text-gray-500 flex-shrink-0">({brand.product_count})</span>
                      </label>
                    ))
                  ) : (
                    <p className="text-xs text-gray-500 col-span-2 lg:col-span-1">No brands available</p>
                  )}
                </div>
              </div>

              {/* Features */}
              <div className="mb-4 lg:mb-6">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Features</h4>
                <div className="grid grid-cols-2 lg:grid-cols-1 gap-2 lg:gap-0 lg:space-y-1">
                  <label className="flex items-center space-x-1 lg:space-x-2 text-xs lg:text-sm">
                    <input
                      type="checkbox"
                      checked={filters.featured}
                      onChange={(e) => handleFilterChange('featured', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 flex-shrink-0"
                    />
                    <span className="text-gray-700">Featured</span>
                  </label>
                  <label className="flex items-center space-x-1 lg:space-x-2 text-xs lg:text-sm">
                    <input
                      type="checkbox"
                      checked={filters.bestseller}
                      onChange={(e) => handleFilterChange('bestseller', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 flex-shrink-0"
                    />
                    <span className="text-gray-700">Best Sellers</span>
                  </label>
                </div>
              </div>

              {/* Sort */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Sort By</h4>
                <select
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="price_low">Price: Low to High</option>
                  <option value="price_high">Price: High to Low</option>
                </select>
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
                <h2 className="text-xl font-semibold text-gray-900">{category.name} Products</h2>
                {!loading && (
                  <p className="text-gray-600 text-sm">
                    {sortedAndFilteredProducts.length} products found
                  </p>
                )}
              </div>
              
              {/* View Mode Toggle */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg ${
                    viewMode === 'grid' 
                      ? 'text-white' 
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
                  style={viewMode === 'grid' ? { backgroundColor: '#8827ee' } : {}}
                >
                  <div className="w-5 h-5 grid grid-cols-2 gap-0.5">
                    <div className="bg-current rounded-sm"></div>
                    <div className="bg-current rounded-sm"></div>
                    <div className="bg-current rounded-sm"></div>
                    <div className="bg-current rounded-sm"></div>
                  </div>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg ${
                    viewMode === 'list' 
                      ? 'text-white' 
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
                  style={viewMode === 'list' ? { backgroundColor: '#8827ee' } : {}}
                >
                  <div className="w-5 h-5 flex flex-col space-y-1">
                    <div className="bg-current rounded-full w-1 h-1"></div>
                    <div className="bg-current rounded-full w-1 h-1"></div>
                    <div className="bg-current rounded-full w-1 h-1"></div>
                  </div>
                </button>
              </div>
            </div>

            {/* Products Grid/List */}
            {loading ? (
              <div className={
                viewMode === 'grid' 
                  ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6'
                  : 'space-y-4'
              }>
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="bg-white rounded-lg shadow-sm p-3 sm:p-4 animate-pulse">
                    <div className="aspect-square bg-gray-200 rounded-lg mb-3 sm:mb-4"></div>
                    <div className="h-3 sm:h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 sm:h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
                    <div className="h-5 sm:h-6 bg-gray-200 rounded w-1/3"></div>
                  </div>
                ))}
              </div>
            ) : sortedAndFilteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MagnifyingGlassIcon className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-600">Try adjusting your search or filter criteria</p>
              </div>
            ) : (
              <div className={
                viewMode === 'grid' 
                  ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6'
                  : 'space-y-4'
              }>
                {sortedAndFilteredProducts.map((product) => (
                  <ProductCard 
                    key={product.id} 
                    product={{
                      id: product.id,
                      name: product.name,
                      slug: product.slug,
                      price: parseFloat(product.price) || 0,
                      originalPrice: product.original_price ? parseFloat(product.original_price) : undefined,
                      image_url: product.image_url || '',
                      isFeatured: Boolean(product.is_featured),
                      isBestseller: Boolean(product.is_bestseller)
                    }} 
                    viewMode={viewMode}
                  />
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