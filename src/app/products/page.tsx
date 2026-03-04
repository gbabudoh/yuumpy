'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, Suspense, useCallback, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, SlidersHorizontal, X, LayoutGrid, List, ChevronDown, ChevronUp, Sparkles, TrendingUp, Tag, Package } from 'lucide-react';
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
  seller_store_slug?: string;
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

function FilterSection({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700 transition-colors">
        {title}
        {open ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
      </button>
      {open && <div className="pb-4">{children}</div>}
    </div>
  );
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
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const searchTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Debounce search term
  useEffect(() => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 400);
    return () => { if (searchTimerRef.current) clearTimeout(searchTimerRef.current); };
  }, [searchTerm]);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (debouncedSearch) params.append('search', debouncedSearch);
      selectedCategories.forEach(c => params.append('category', c));
      selectedBrands.forEach(b => params.append('brand', b));
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
  }, [debouncedSearch, selectedCategories, selectedBrands, priceRange.min, priceRange.max, sortBy]);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch('/api/categories');
      if (res.ok) { const data = await res.json(); setCategories(Array.isArray(data) ? data : []); }
    } catch { /* ignore */ }
  }, []);

  const fetchBrands = useCallback(async () => {
    try {
      const res = await fetch('/api/brands');
      if (res.ok) { const data = await res.json(); setBrands(Array.isArray(data) ? data : []); }
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    const searchParam = searchParams?.get('search');
    if (searchParam) {
      setSearchTerm(searchParam);
      setDebouncedSearch(searchParam);
    } else {
      fetchProducts();
    }
    fetchCategories();
    fetchBrands();
  }, [searchParams, fetchProducts, fetchCategories, fetchBrands]);

  useEffect(() => {
    const searchParam = searchParams?.get('search');
    const filterParam = searchParams?.get('filter');
    if (searchParam && searchParam !== searchTerm) {
      setSearchTerm(searchParam);
      setDebouncedSearch(searchParam);
    }
    if (filterParam === 'bestsellers') setSortBy('bestseller');
  }, [searchParams, searchTerm]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const filteredProducts = selectedConditions.length > 0
    ? products.filter(p => selectedConditions.includes(p.product_condition || 'new'))
    : products;

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low': return Number(a.price) - Number(b.price);
      case 'price-high': return Number(b.price) - Number(a.price);
      default: return a.name.localeCompare(b.name);
    }
  });

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategories([]);
    setPriceRange({ min: '', max: '' });
    setSelectedBrands([]);
    setSelectedFeatures([]);
    setSelectedConditions([]);
    setSortBy('name');
  };

  const activeFilterCount = selectedCategories.length + selectedBrands.length + selectedFeatures.length + selectedConditions.length
    + (priceRange.min ? 1 : 0) + (priceRange.max ? 1 : 0);

  const filterContent = (
    <>
      <FilterSection title="Categories">
        <div className="space-y-1 max-h-52 overflow-y-auto pr-1">
          {Array.isArray(categories) && categories.map((cat) => (
            <label key={cat.id} className="flex items-center gap-2.5 py-1.5 px-2 rounded-lg hover:bg-gray-50 cursor-pointer group transition-colors">
              <input type="checkbox" checked={selectedCategories.includes(cat.slug)}
                onChange={(e) => {
                  if (e.target.checked) setSelectedCategories(prev => [...prev, cat.slug]);
                  else setSelectedCategories(prev => prev.filter(s => s !== cat.slug));
                }}
                className="w-3.5 h-3.5 rounded border-gray-300 text-purple-600 focus:ring-purple-500/20 cursor-pointer" />
              <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors flex-1 truncate">{cat.name}</span>
              <span className="text-[10px] text-gray-400 font-medium">{cat.product_count}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Price Range">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">£</span>
            <input type="number" placeholder="Min" value={priceRange.min}
              onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
              className="w-full pl-7 pr-2 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-300 transition-all" />
          </div>
          <span className="text-gray-300 text-xs">—</span>
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">£</span>
            <input type="number" placeholder="Max" value={priceRange.max}
              onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
              className="w-full pl-7 pr-2 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-300 transition-all" />
          </div>
        </div>
      </FilterSection>

      {brands.length > 0 && (
        <FilterSection title="Brands" defaultOpen={false}>
          <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
            {brands.map((brand) => (
              <label key={brand.id} className="flex items-center gap-2.5 py-1.5 px-2 rounded-lg hover:bg-gray-50 cursor-pointer group transition-colors">
                <input type="checkbox" checked={selectedBrands.includes(brand.slug)}
                  onChange={() => setSelectedBrands(prev => prev.includes(brand.slug) ? prev.filter(b => b !== brand.slug) : [...prev, brand.slug])}
                  className="w-3.5 h-3.5 rounded border-gray-300 text-purple-600 focus:ring-purple-500/20 cursor-pointer" />
                <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors flex-1 truncate">{brand.name}</span>
                <span className="text-[10px] text-gray-400 font-medium">{brand.product_count || 0}</span>
              </label>
            ))}
          </div>
        </FilterSection>
      )}

      <FilterSection title="Condition" defaultOpen={false}>
        <div className="flex flex-wrap gap-2">
          {[
            { value: 'new', label: 'New', icon: <Sparkles className="w-3 h-3" /> },
            { value: 'refurbished', label: 'Refurbished', icon: <Package className="w-3 h-3" /> },
            { value: 'used', label: 'Used', icon: <Tag className="w-3 h-3" /> },
          ].map((cond) => (
            <button key={cond.value}
              onClick={() => setSelectedConditions(prev => prev.includes(cond.value) ? prev.filter(c => c !== cond.value) : [...prev, cond.value])}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                selectedConditions.includes(cond.value)
                  ? 'bg-purple-100 text-purple-700 ring-1 ring-purple-200'
                  : 'bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-700'
              }`}>
              {cond.icon} {cond.label}
            </button>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Features" defaultOpen={false}>
        <div className="flex flex-wrap gap-2">
          {[
            { value: 'Featured', icon: <Sparkles className="w-3 h-3" /> },
            { value: 'Best Sellers', icon: <TrendingUp className="w-3 h-3" /> },
          ].map((feat) => (
            <button key={feat.value}
              onClick={() => setSelectedFeatures(prev => prev.includes(feat.value) ? prev.filter(f => f !== feat.value) : [...prev, feat.value])}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                selectedFeatures.includes(feat.value)
                  ? 'bg-purple-100 text-purple-700 ring-1 ring-purple-200'
                  : 'bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-700'
              }`}>
              {feat.icon} {feat.value}
            </button>
          ))}
        </div>
      </FilterSection>
    </>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Hero Header */}
        <div className="relative rounded-2xl overflow-hidden mb-6">
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-purple-900 to-gray-900" />
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(139,92,246,0.4) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(99,102,241,0.4) 0%, transparent 50%)',
          }} />
          <div className="relative px-6 py-8 md:px-10 md:py-12">
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">
              {searchTerm ? `Results for "${searchTerm}"` : 'All Products'}
            </h1>
            <p className="text-gray-400 text-sm">
              {searchTerm
                ? `${products.length} product${products.length !== 1 ? 's' : ''} found`
                : 'Discover products from verified sellers across the marketplace'}
            </p>

            {/* Search Bar */}
            <div className="mt-5 max-w-lg">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-11 pr-10 py-3 bg-white/10 backdrop-blur-sm border border-white/15 rounded-xl text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-400/50 transition-all" />
                {searchTerm && (
                  <button onClick={() => {
                    setSearchTerm('');
                    const url = new URL(window.location.href);
                    url.searchParams.delete('search');
                    window.history.replaceState({}, '', url.toString());
                  }} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded-lg transition-colors cursor-pointer">
                    <X className="w-4 h-4 text-gray-400" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Active Filters Pills */}
        {activeFilterCount > 0 && (
          <div className="flex items-center gap-2 flex-wrap mb-4">
            <span className="text-xs text-gray-400">Active filters:</span>
            {selectedCategories.map(slug => {
              const cat = categories.find(c => c.slug === slug);
              return (
                <button key={slug} onClick={() => setSelectedCategories(prev => prev.filter(s => s !== slug))}
                  className="flex items-center gap-1 px-2.5 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-medium cursor-pointer hover:bg-purple-100 transition-colors">
                  {cat?.name || slug} <X className="w-3 h-3" />
                </button>
              );
            })}
            {selectedBrands.map(slug => {
              const brand = brands.find(b => b.slug === slug);
              return (
                <button key={slug} onClick={() => setSelectedBrands(prev => prev.filter(s => s !== slug))}
                  className="flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium cursor-pointer hover:bg-blue-100 transition-colors">
                  {brand?.name || slug} <X className="w-3 h-3" />
                </button>
              );
            })}
            {selectedConditions.map(c => (
              <button key={c} onClick={() => setSelectedConditions(prev => prev.filter(x => x !== c))}
                className="flex items-center gap-1 px-2.5 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium cursor-pointer hover:bg-green-100 transition-colors capitalize">
                {c} <X className="w-3 h-3" />
              </button>
            ))}
            {(priceRange.min || priceRange.max) && (
              <button onClick={() => setPriceRange({ min: '', max: '' })}
                className="flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-medium cursor-pointer hover:bg-amber-100 transition-colors">
                £{priceRange.min || '0'} — £{priceRange.max || '∞'} <X className="w-3 h-3" />
              </button>
            )}
            <button onClick={clearFilters}
              className="text-xs text-gray-400 hover:text-red-500 font-medium cursor-pointer transition-colors ml-1">
              Clear all
            </button>
          </div>
        )}

        <div className="flex gap-6">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-72 flex-shrink-0">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sticky top-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-semibold text-gray-900">Filters</span>
                </div>
                {activeFilterCount > 0 && (
                  <button onClick={clearFilters} className="text-[10px] text-purple-600 hover:text-purple-700 font-semibold cursor-pointer">
                    Reset
                  </button>
                )}
              </div>
              {filterContent}
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                {/* Mobile Filter Button */}
                <button onClick={() => setShowMobileFilters(true)}
                  className="lg:hidden flex items-center gap-2 px-3.5 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-600 hover:border-purple-300 transition-colors cursor-pointer">
                  <SlidersHorizontal className="w-4 h-4" />
                  Filters
                  {activeFilterCount > 0 && (
                    <span className="w-5 h-5 bg-purple-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {activeFilterCount}
                    </span>
                  )}
                </button>

                {!loading && (
                  <p className="text-sm text-gray-400">
                    <span className="font-semibold text-gray-700">{sortedProducts.length}</span> products
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
                  className="text-xs px-3 py-2 bg-white border border-gray-200 rounded-lg text-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500/20 cursor-pointer">
                  <option value="name">Name A-Z</option>
                  <option value="price-low">Price: Low → High</option>
                  <option value="price-high">Price: High → Low</option>
                </select>

                <div className="flex bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <button onClick={() => setViewMode('grid')}
                    className={`p-2 transition-colors cursor-pointer ${viewMode === 'grid' ? 'bg-purple-50 text-purple-600' : 'text-gray-400 hover:text-gray-600'}`}>
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button onClick={() => setViewMode('list')}
                    className={`p-2 transition-colors cursor-pointer ${viewMode === 'list' ? 'bg-purple-50 text-purple-600' : 'text-gray-400 hover:text-gray-600'}`}>
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Product Grid */}
            {loading ? (
              <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 animate-pulse">
                    <div className="aspect-square bg-gray-100 rounded-xl mb-3" />
                    <div className="h-4 bg-gray-100 rounded-lg mb-2 w-3/4" />
                    <div className="h-3 bg-gray-100 rounded-lg w-1/2 mb-3" />
                    <div className="h-5 bg-gray-100 rounded-lg w-1/3" />
                  </div>
                ))}
              </div>
            ) : sortedProducts.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Search className="w-7 h-7 text-gray-300" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">No products found</h3>
                <p className="text-sm text-gray-500 mb-4">Try adjusting your filters or search term</p>
                <button onClick={clearFilters}
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer">
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
                {sortedProducts.map((product) => (
                  <ProductCard key={product.id} viewMode={viewMode}
                    product={{
                      id: product.id, name: product.name, slug: product.slug,
                      price: Number(product.price) || 0,
                      originalPrice: product.original_price ? Number(product.original_price) : undefined,
                      image_url: product.image_url || '', isFeatured: Boolean(product.is_featured),
                      isBestseller: Boolean(product.is_bestseller), affiliate_url: product.affiliate_url,
                      purchase_type: product.purchase_type, product_condition: product.product_condition,
                      seller_store_slug: product.seller_store_slug,
                    }} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Mobile Filter Drawer */}
        {showMobileFilters && (
          <>
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 lg:hidden" onClick={() => setShowMobileFilters(false)} />
            <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-2xl z-50 lg:hidden overflow-y-auto">
              <div className="p-5">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-semibold text-gray-900">Filters</span>
                  </div>
                  <button onClick={() => setShowMobileFilters(false)}
                    className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer">
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
                {filterContent}
                <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                  <button onClick={clearFilters}
                    className="flex-1 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors cursor-pointer">
                    Reset
                  </button>
                  <button onClick={() => setShowMobileFilters(false)}
                    className="flex-1 py-2.5 text-sm font-semibold text-white bg-purple-600 rounded-xl hover:bg-purple-700 transition-colors cursor-pointer">
                    Apply
                  </button>
                </div>
              </div>
            </div>
          </>
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
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-2 border-gray-200 border-t-purple-600 rounded-full animate-spin" />
          </div>
        </div>
        <Footer />
      </div>
    }>
      <ProductsPageContent />
    </Suspense>
  );
}
