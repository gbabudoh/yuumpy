'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
  affiliate_url?: string;
  purchase_type?: 'affiliate' | 'direct';
  product_condition?: 'new' | 'refurbished' | 'used';
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

interface Filters {
  featured: boolean;
  bestseller: boolean;
  priceRange: { min: number; max: number };
  subcategories: string[];
  brands: string[];
  conditions: string[];
}

interface CategoryViewProps {
  initialSlug: string;
}

export default function CategoryView({ initialSlug }: CategoryViewProps) {
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [subcategories, setSubcategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [filters, setFilters] = useState<Filters>({
    featured: false,
    bestseller: false,
    priceRange: { min: 0, max: 0 },
    subcategories: [],
    brands: [],
    conditions: []
  });
  const [priceInputs, setPriceInputs] = useState({ min: '', max: '' });
  
  const fetchCategoryData = useCallback(async (slug: string) => {
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
      const productsResponse = await fetch(apiUrl);
      if (productsResponse.ok) {
        const productsData = await productsResponse.json();
        setProducts(productsData.products || []);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error('Error fetching category data:', error);
    } finally {
      setLoading(false);
    }
  }, [filters, searchQuery, sortBy]);

  useEffect(() => {
    if (initialSlug) {
      fetchCategoryData(initialSlug);
    }
  }, [initialSlug, fetchCategoryData]);

  const handleFilterChange = <K extends keyof Filters>(filter: K, value: Filters[K]) => {
    setFilters(prev => ({
      ...prev,
      [filter]: value
    }));
  };

  const handleSubcategoryChange = (subcategorySlug: string, checked: boolean) => {
    const newSubcategories = checked 
      ? [...filters.subcategories, subcategorySlug]
      : filters.subcategories.filter(slug => slug !== subcategorySlug);
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
      brands: [],
      conditions: []
    });
    setPriceInputs({ min: '', max: '' });
    setSearchQuery('');
    setSortBy('newest');
  };

  // Filter products by condition (client-side) since API doesn't support it yet
  const sortedAndFilteredProducts = filters.conditions.length > 0
    ? products.filter((p: Product) => filters.conditions.includes(p.product_condition || 'new'))
    : products;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
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
            <p className="text-gray-600 mb-6">The category you&apos;re looking for doesn&apos;t exist.</p>
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
        <div className="mb-8">
          <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
            <Link href="/" className="hover:text-purple-600 transition-colors cursor-pointer">Home</Link>
            <span>/</span>
            <Link href="/products" className="hover:text-purple-600 transition-colors cursor-pointer">Products</Link>
            <span>/</span>
            <span className="text-gray-900">{category.name}</span>
          </nav>
          
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center space-x-4">
              {category.image_url && (
                <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                  <Image
                    src={category.image_url}
                    alt={category.name}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">{category.name}</h1>
                <p className="text-gray-600 mb-2 text-sm">{category.description}</p>
                <p className="text-xs text-gray-500">
                  {sortedAndFilteredProducts.length} products available
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          <div className="w-full lg:w-72 lg:flex-shrink-0">
            <div className="bg-white rounded-xl shadow-lg p-4 lg:p-6 lg:sticky lg:top-8 z-10">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 lg:mb-6">Filters</h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Search Products</label>
                <div className="relative border border-gray-100 rounded-lg">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                  />
                </div>
              </div>

              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Price Range</h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={priceInputs.min}
                      onChange={(e) => setPriceInputs(prev => ({ ...prev, min: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    <span className="text-gray-500 text-sm">to</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={priceInputs.max}
                      onChange={(e) => setPriceInputs(prev => ({ ...prev, max: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <button 
                    onClick={handlePriceFilter}
                    className="w-full text-white py-2 rounded-lg text-sm transition-colors hover:bg-purple-700 cursor-pointer"
                    style={{ backgroundColor: '#8827ee' }}
                  >
                    Apply Filter
                  </button>
                </div>
              </div>

              {subcategories.length > 0 && (
                <div className="mb-4 lg:mb-6">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Subcategories</h4>
                  <div className="grid grid-cols-2 lg:grid-cols-1 gap-2 lg:gap-0 lg:space-y-1">
                    {subcategories.map((subcategory) => (
                      <label key={subcategory.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer text-xs lg:text-sm group">
                        <div className="flex items-center space-x-1 lg:space-x-2">
                          <input
                            type="checkbox"
                            checked={filters.subcategories.includes(subcategory.slug)}
                            onChange={(e) => handleSubcategoryChange(subcategory.slug, e.target.checked)}
                            className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 flex-shrink-0 cursor-pointer"
                          />
                          <span className="text-gray-700 group-hover:text-purple-600 transition-colors">{subcategory.name}</span>
                        </div>
                        <span className="text-gray-500 flex-shrink-0 group-hover:text-purple-600 transition-colors">({subcategory.product_count})</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div className="mb-4 lg:mb-6">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Popular Brands</h4>
                <div className="grid grid-cols-2 lg:grid-cols-1 gap-2 lg:gap-0 lg:space-y-1">
                  {brands.length > 0 ? (
                    brands.slice(0, 8).map((brand) => (
                      <label key={brand.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer text-xs lg:text-sm group">
                        <div className="flex items-center space-x-1 lg:space-x-2">
                          <input
                            type="checkbox"
                            checked={filters.brands.includes(brand.slug)}
                            onChange={(e) => handleBrandChange(brand.slug, e.target.checked)}
                            className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 flex-shrink-0 cursor-pointer"
                          />
                          <span className="text-gray-700 group-hover:text-purple-600 transition-colors">{brand.name}</span>
                        </div>
                        <span className="text-gray-500 flex-shrink-0 group-hover:text-purple-600 transition-colors">({brand.product_count})</span>
                      </label>
                    ))
                  ) : (
                    <p className="text-xs text-gray-500 col-span-2 lg:col-span-1">No brands available</p>
                  )}
                </div>
              </div>

              <div className="mb-4 lg:mb-6">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Features</h4>
                <div className="grid grid-cols-2 lg:grid-cols-1 gap-2 lg:gap-0 lg:space-y-1">
                  <label className="flex items-center space-x-1 lg:space-x-2 text-xs lg:text-sm cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={filters.featured}
                      onChange={(e) => handleFilterChange('featured', e.target.checked)}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 flex-shrink-0 cursor-pointer"
                    />
                    <span className="text-gray-700 group-hover:text-purple-600 transition-colors">Featured</span>
                  </label>
                  <label className="flex items-center space-x-1 lg:space-x-2 text-xs lg:text-sm cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={filters.bestseller}
                      onChange={(e) => handleFilterChange('bestseller', e.target.checked)}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 flex-shrink-0 cursor-pointer"
                    />
                    <span className="text-gray-700 group-hover:text-purple-600 transition-colors">Best Sellers</span>
                  </label>
                </div>
              </div>

              <div className="mb-4 lg:mb-6">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Product Condition</h4>
                <div className="grid grid-cols-2 lg:grid-cols-1 gap-2 lg:gap-0 lg:space-y-1">
                  {['new', 'refurbished', 'used'].map((condition) => (
                    <label key={condition} className="flex items-center space-x-1 lg:space-x-2 text-xs lg:text-sm cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={filters.conditions.includes(condition)}
                        onChange={(e) => {
                          const newConditions = e.target.checked
                            ? [...filters.conditions, condition]
                            : filters.conditions.filter(c => c !== condition);
                          handleFilterChange('conditions', newConditions);
                        }}
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 flex-shrink-0 cursor-pointer"
                      />
                      <span className="text-gray-700 capitalize group-hover:text-purple-600 transition-colors">{condition}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Sort By</h4>
                <select
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent cursor-pointer"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="price_low">Price: Low to High</option>
                  <option value="price_high">Price: High to Low</option>
                </select>
              </div>

              <button 
                onClick={clearFilters}
                className="w-full text-sm text-gray-600 hover:text-purple-600 underline cursor-pointer transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          </div>

          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{category.name} Products</h2>
                <p className="text-gray-600 text-sm">
                  {sortedAndFilteredProducts.length} products found
                </p>
              </div>
              
              <div className="flex items-center space-x-2 border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 cursor-pointer transition-colors ${
                    viewMode === 'grid' 
                      ? 'text-white' 
                      : 'bg-white text-gray-600 hover:bg-gray-50'
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
                  className={`p-2 cursor-pointer transition-colors ${
                    viewMode === 'list' 
                      ? 'text-white' 
                      : 'bg-white text-gray-600 hover:bg-gray-50'
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

            {sortedAndFilteredProducts.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <MagnifyingGlassIcon className="w-10 h-10 text-gray-300" />
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
                      isBestseller: Boolean(product.is_bestseller),
                      affiliate_url: product.affiliate_url,
                      purchase_type: product.purchase_type,
                      product_condition: product.product_condition
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
