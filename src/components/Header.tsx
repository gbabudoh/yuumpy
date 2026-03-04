'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Search, 
  ShoppingBag, 
  Menu, 
  X, 
  Tag, 
  Building2, 
  User, 
  LayoutGrid, 
  Info, 
  Store,
  Flower2,
  Smartphone,
  Cpu,
  Shirt,
  Home,
  Book,
  Sparkles,
  Watch,
  Gift,
  Camera,
  Music,
  Heart
} from 'lucide-react';
import { useCart } from '@/hooks/useCart';

interface SearchSuggestion {
  text: string;
  slug: string;
  type: 'product' | 'category' | 'brand';
  url: string;
}

interface Customer {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
}

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  icon_url: string | null;
  product_count?: number;
}

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  
  const searchRef = useRef<HTMLDivElement>(null);
  const megaMenuRef = useRef<HTMLDivElement>(null);
  const categoriesLinkRef = useRef<HTMLDivElement>(null);
  
  const router = useRouter();
  const { cartCount } = useCart();

  // Check customer authentication status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/customer/auth/me');
        if (response.ok) {
          const data = await response.json();
          setCustomer(data.customer);
        }
      } catch {
        // Not logged in, that's fine
      } finally {
        setIsCheckingAuth(false);
      }
    };

    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories?parent_only=true');
        if (response.ok) {
          const data = await response.json();
          setCategories(data || []);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    checkAuth();
    fetchCategories();
  }, []);

  // Fetch search suggestions
  const fetchSuggestions = async (query: string) => {
    if (query.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsLoadingSuggestions(true);
    try {
      const response = await fetch(`/api/search/suggestions?q=${encodeURIComponent(query)}`);
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.suggestions || []);
        setShowSuggestions(true);
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  // Debounced search suggestions
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchSuggestions(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Close suggestions and mega menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
      if (megaMenuRef.current && !megaMenuRef.current.contains(event.target as Node) && 
          categoriesLinkRef.current && !categoriesLinkRef.current.contains(event.target as Node)) {
        setIsMegaMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setShowSuggestions(false);
      setIsMenuOpen(false);
    }
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setSearchQuery('');
    setShowSuggestions(false);
    router.push(suggestion.url);
  };

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'product':
        return <ShoppingBag className="w-4 h-4" />;
      case 'category':
        return <Tag className="w-4 h-4" />;
      case 'brand':
        return <Building2 className="w-4 h-4" />;
      default:
        return <Search className="w-4 h-4" />;
    }
  };

  const getCategoryIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('aromatherapy')) return <Flower2 className="w-5 h-5" />;
    if (n.includes('electronic') || n.includes('phone')) return <Smartphone className="w-5 h-5" />;
    if (n.includes('computer') || n.includes('laptop') || n.includes('tech')) return <Cpu className="w-5 h-5" />;
    if (n.includes('clothing') || n.includes('fashion') || n.includes('apparel')) return <Shirt className="w-5 h-5" />;
    if (n.includes('home') || n.includes('garden') || n.includes('furniture')) return <Home className="w-5 h-5" />;
    if (n.includes('book')) return <Book className="w-5 h-5" />;
    if (n.includes('beauty') || n.includes('cosmetic')) return <Sparkles className="w-5 h-5" />;
    if (n.includes('watch') || n.includes('jewelry')) return <Watch className="w-5 h-5" />;
    if (n.includes('gift')) return <Gift className="w-5 h-5" />;
    if (n.includes('camera') || n.includes('photo')) return <Camera className="w-5 h-5" />;
    if (n.includes('music') || n.includes('audio')) return <Music className="w-5 h-5" />;
    if (n.includes('health') || n.includes('wellness')) return <Heart className="w-5 h-5" />;
    return <Tag className="w-5 h-5" />;
  };

  return (
    <header className="glass sticky top-0 z-50">
      <div className="w-full px-6 md:px-12 lg:px-16">
        <div className="flex items-center h-20">
          {/* Left Side Navigation (Logo + Links) */}
          <div className="flex items-center flex-1">
            <div className="flex-shrink-0">
              <Link href="/" className="flex items-center group mr-16">
                <div className="relative">
                  <Image
                    src="/logo.png"
                    alt="Yuumpy Logo"
                    width={140}
                    height={56}
                    className="h-6.5 w-auto transition-transform group-hover:scale-105"
                    style={{ imageRendering: 'crisp-edges' }}
                    priority
                  />
                  <div className="absolute -inset-2 bg-indigo-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </Link>
            </div>

            <nav className="hidden md:flex items-center space-x-10">
              {/* Categories with Mega Menu */}
              <div 
                ref={categoriesLinkRef}
                className="relative"
                onMouseEnter={() => setIsMegaMenuOpen(true)}
              >
                <Link 
                  href="/products/categories" 
                  className={`group flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] transition-all ${isMegaMenuOpen ? 'text-indigo-600' : 'text-gray-400 hover:text-indigo-600'}`}
                >
                  <LayoutGrid className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span>Categories</span>
                </Link>

                {/* Mega Menu Dropdown */}
                {isMegaMenuOpen && (
                  <div 
                    ref={megaMenuRef}
                    className="fixed left-1/2 -translate-x-1/2 top-[var(--header-height,80px)] pt-2 w-[1000px] animate-fadeIn z-50"
                    onMouseLeave={() => setIsMegaMenuOpen(false)}
                  >
                    <div className="bg-gradient-to-br from-white via-white to-indigo-50/30 rounded-3xl overflow-hidden border border-indigo-100/50 shadow-[0_20px_70px_-15px_rgba(99,102,241,0.15)] backdrop-blur-sm">
                      {/* Header Section */}
                      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                              <LayoutGrid className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h3 className="text-sm font-black text-white uppercase tracking-wide">Shop by Category</h3>
                              <p className="text-xs text-indigo-100 font-medium">Discover our curated collections</p>
                            </div>
                          </div>
                          <Link 
                            href="/categories" 
                            className="group flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full transition-all"
                          >
                            <span className="text-xs font-bold text-white uppercase tracking-wide">View All</span>
                            <LayoutGrid className="w-4 h-4 text-white group-hover:rotate-90 transition-transform duration-300" />
                          </Link>
                        </div>
                      </div>

                      <div className="grid grid-cols-12 gap-6 p-6">
                        {/* Left Column: Categories Grid */}
                        <div className="col-span-8">
                          <div className="grid grid-cols-2 gap-3 max-h-[420px] overflow-y-auto pr-2 custom-scrollbar">
                            {categories.map((cat) => (
                              <Link 
                                key={cat.id}
                                href={`/categories/${cat.slug}`}
                                className="group/item flex items-center gap-3.5 p-3.5 rounded-2xl bg-white hover:bg-gradient-to-br hover:from-indigo-50 hover:to-purple-50 transition-all duration-300 border border-gray-100 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-100/50 hover:-translate-y-0.5"
                                onMouseEnter={() => setActiveCategory(cat)}
                              >
                                <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center group-hover/item:bg-purple-600 transition-all duration-300 shrink-0 group-hover/item:scale-110 group-hover/item:rotate-3 shadow-sm">
                                  <div className="text-purple-600 group-hover/item:text-white transition-colors duration-300">
                                    {getCategoryIcon(cat.name)}
                                  </div>
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-bold text-slate-900 group-hover/item:text-indigo-600 transition-colors duration-300 truncate mb-0.5">
                                    {cat.name}
                                  </p>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-slate-500 group-hover/item:text-indigo-500 font-semibold transition-colors duration-300">
                                      {cat.product_count || 0} products
                                    </span>
                                    <div className="w-1 h-1 rounded-full bg-slate-300 group-hover/item:bg-indigo-400 transition-colors" />
                                    <span className="text-xs text-slate-400 group-hover/item:text-indigo-400 font-medium transition-colors duration-300">
                                      Explore →
                                    </span>
                                  </div>
                                </div>
                              </Link>
                            ))}
                          </div>
                        </div>

                        {/* Right Column: Enhanced Preview */}
                        <div className="col-span-4">
                          <div className="sticky top-0 bg-gradient-to-br from-slate-50 to-indigo-50/50 rounded-2xl p-6 border border-indigo-100/50 h-full flex flex-col justify-between overflow-hidden relative group/preview shadow-inner">
                            {/* Animated Background Pattern */}
                            <div className="absolute inset-0 opacity-[0.03]">
                              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600 rounded-full blur-3xl group-hover/preview:scale-150 transition-transform duration-700" />
                              <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-600 rounded-full blur-3xl group-hover/preview:scale-150 transition-transform duration-700" />
                            </div>

                            <div className="relative z-10 flex-1 flex flex-col justify-center">
                              {activeCategory ? (
                                <div className="animate-fadeIn space-y-4">
                                  <div className="flex items-center gap-3">
                                    <div className="w-14 h-14 rounded-2xl bg-purple-600 flex items-center justify-center shadow-lg shadow-purple-200">
                                      <div className="text-white">
                                        {getCategoryIcon(activeCategory.name)}
                                      </div>
                                    </div>
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-1">
                                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                        <span className="text-[10px] font-bold text-green-600 uppercase tracking-wider">Available Now</span>
                                      </div>
                                      <h4 className="text-base font-black text-slate-900 leading-tight">{activeCategory.name}</h4>
                                    </div>
                                  </div>
                                  
                                  <p className="text-xs text-slate-600 font-medium leading-relaxed">
                                    {activeCategory.description || `Discover our premium ${activeCategory.name.toLowerCase()} collection with verified quality and secure transactions.`}
                                  </p>

                                  <div className="flex items-center gap-2 pt-2">
                                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-100 rounded-full">
                                      <span className="text-xs font-black text-indigo-700">{activeCategory.product_count || 0}</span>
                                      <span className="text-xs font-semibold text-indigo-600">Products</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-100 rounded-full">
                                      <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                      <span className="text-xs font-semibold text-green-700">Verified</span>
                                    </div>
                                  </div>

                                  <Link 
                                    href={`/categories/${activeCategory.slug}`}
                                    className="group/btn inline-flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-xs font-bold uppercase tracking-wide rounded-xl transition-all duration-300 active:scale-95 w-full shadow-lg shadow-indigo-200 hover:shadow-xl hover:shadow-indigo-300"
                                    onClick={() => setIsMegaMenuOpen(false)}
                                  >
                                    <span>Explore Collection</span>
                                    <LayoutGrid className="w-4 h-4 group-hover/btn:rotate-90 transition-transform duration-300" />
                                  </Link>
                                </div>
                              ) : (
                                <div className="text-center py-8 space-y-4">
                                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mx-auto">
                                    <LayoutGrid className="w-8 h-8 text-gray-300" />
                                  </div>
                                  <div>
                                    <p className="text-sm font-bold text-slate-600 mb-1">Select a Category</p>
                                    <p className="text-xs text-slate-400 font-medium">Hover over any category to see details</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Enhanced Footer */}
                      <div className="bg-gradient-to-r from-slate-50 to-indigo-50/30 px-8 py-4 border-t border-indigo-100/50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 rounded-full">
                              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                              <span className="text-xs text-green-700 font-bold uppercase tracking-wide">Escrow Protected</span>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-100 rounded-full">
                              <span className="text-xs text-blue-700 font-bold uppercase tracking-wide">Secure Payments</span>
                            </div>
                          </div>
                          <p className="text-xs text-slate-500 font-semibold">Yuumpy Marketplace • Trusted Since 2024</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <Link href="/about-yuumpy" className="group flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-indigo-600 transition-all">
                <Info className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span>About</span>
              </Link>
              <Link href="/seller/register" className="group flex items-center gap-2 px-6 py-2.5 bg-purple-600 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full hover:bg-purple-700 hover:shadow-[0_10px_30px_-5px_rgba(147,51,234,0.3)] transition-all active:scale-95">
                <Store className="w-3.5 h-3.5" />
                <span>Start Selling</span>
              </Link>
            </nav>
          </div>


          {/* Right Side - Search Bar and Actions */}
          <div className="flex items-center space-x-4 flex-shrink-0">
            <div className="hidden lg:flex items-center">
              <div ref={searchRef} className="relative">
                <form onSubmit={handleSearch} className="relative group">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none group-focus-within:text-indigo-500 transition-colors" />
                  <input
                    type="text"
                    placeholder="Search the marketplace..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => searchQuery.length >= 2 && setShowSuggestions(true)}
                    className="w-72 pl-11 pr-24 py-2.5 bg-gray-50/50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500/30 text-sm transition-all outline-none"
                  />
                  <div className="absolute right-1.5 top-1/2 transform -translate-y-1/2">
                    <button
                      type="submit"
                      className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                    >
                      Find
                    </button>
                  </div>
                </form>

                {/* Search Suggestions Dropdown */}
                {showSuggestions && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
                    {isLoadingSuggestions ? (
                      <div className="p-3 text-center text-gray-500">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600 mx-auto"></div>
                        <span className="text-xs mt-1">Searching...</span>
                      </div>
                    ) : suggestions.length > 0 ? (
                      <div className="py-1">
                        {suggestions
                          .sort((a, b) => {
                            // Prioritize products first, then categories, then brands
                            const typeOrder = { product: 0, category: 1, brand: 2 };
                            return typeOrder[a.type] - typeOrder[b.type];
                          })
                          .map((suggestion, index) => (
                          <button
                            key={index}
                            onClick={() => handleSuggestionClick(suggestion)}
                            className={`w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center space-x-3 text-sm transition-colors ${
                              suggestion.type === 'product' ? 'bg-purple-50 hover:bg-purple-100' : ''
                            }`}
                          >
                            <div className={`${suggestion.type === 'product' ? 'text-purple-600' : 'text-gray-400'}`}>
                              {getSuggestionIcon(suggestion.type)}
                            </div>
                            <div className="flex-1">
                              <div className={`font-medium ${suggestion.type === 'product' ? 'text-purple-900' : 'text-gray-900'}`}>
                                {suggestion.text}
                              </div>
                              <div className={`text-xs capitalize ${suggestion.type === 'product' ? 'text-purple-600' : 'text-gray-500'}`}>
                                {suggestion.type === 'product' ? 'Product' : suggestion.type}
                              </div>
                            </div>
                          </button>
                        ))}
                        <div className="border-t border-gray-100 mt-1 pt-1">
                          <button
                            onClick={handleSearch}
                            className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center space-x-3 text-sm text-gray-600"
                          >
                            <Search className="w-4 h-4" />
                            <span>Search for &quot;{searchQuery}&quot;</span>
                          </button>
                        </div>
                      </div>
                    ) : searchQuery.length >= 2 ? (
                      <div className="p-3 text-center text-gray-500">
                        <span className="text-sm">No suggestions found</span>
                        <button
                          onClick={handleSearch}
                          className="block w-full mt-2 px-3 py-1 text-sm text-purple-600 hover:text-purple-700"
                        >
                          Search for &quot;{searchQuery}&quot;
                        </button>
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            </div>

            {/* Customer Account / Login */}
            <div className="hidden md:flex items-center">
              {isCheckingAuth ? (
                <div className="w-8 h-8 animate-pulse bg-gray-100 rounded-full"></div>
              ) : customer ? (
                <Link
                  href="/account"
                  className="group flex items-center space-x-3 text-gray-500 hover:text-[#020617] transition-all"
                >
                  <div className="w-10 h-10 bg-indigo-50 border border-indigo-100 rounded-full flex items-center justify-center transition-transform group-hover:scale-110">
                    <User className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Welcome</span>
                    <span className="text-xs font-bold">{customer.firstName}</span>
                  </div>
                </Link>
              ) : (
                <Link
                  href="/account/login"
                  className="group flex items-center space-x-3 text-gray-500 hover:text-[#020617] transition-all"
                >
                  <div className="w-10 h-10 bg-gray-50 border border-gray-100 rounded-full flex items-center justify-center transition-transform group-hover:scale-110">
                    <User className="w-5 h-5 text-gray-400 group-hover:text-indigo-600 transition-colors" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest">Login</span>
                </Link>
              )}
            </div>

            {/* Cart Icon */}
            <Link
              href="/cart"
              className="group relative p-2 text-gray-500 hover:text-indigo-600 transition-all"
            >
              <ShoppingBag className="w-6 h-6 transition-transform group-hover:scale-110 group-hover:-rotate-6" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-[10px] font-black leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-indigo-600 rounded-full shadow-lg ring-2 ring-white">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-gray-500 hover:text-[#020617] transition-colors"
            >
              {isMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            {/* Mobile Search */}
            <div className="px-4 mb-4">
              <div className="relative">
                <form onSubmit={handleSearch} className="relative group">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none group-focus-within:text-indigo-500 transition-colors" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => searchQuery.length >= 2 && setShowSuggestions(true)}
                    className="w-full pl-9 pr-20 py-2.5 bg-gray-50/50 border border-gray-100 rounded-xl focus:bg-white focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500/30 text-sm transition-all outline-none"
                  />
                  <button
                    type="submit"
                    className="absolute right-1.5 top-1/2 transform -translate-y-1/2 bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all"
                  >
                    Find
                  </button>
                </form>

                {/* Mobile Search Suggestions */}
                {showSuggestions && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                    {isLoadingSuggestions ? (
                      <div className="p-3 text-center text-gray-500">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600 mx-auto"></div>
                        <span className="text-xs mt-1">Searching...</span>
                      </div>
                    ) : suggestions.length > 0 ? (
                      <div className="py-1">
                        {suggestions
                          .sort((a, b) => {
                            // Prioritize products first, then categories, then brands
                            const typeOrder = { product: 0, category: 1, brand: 2 };
                            return typeOrder[a.type] - typeOrder[b.type];
                          })
                          .map((suggestion, index) => (
                          <button
                            key={index}
                            onClick={() => handleSuggestionClick(suggestion)}
                            className={`w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center space-x-3 text-sm transition-colors ${
                              suggestion.type === 'product' ? 'bg-purple-50 hover:bg-purple-100' : ''
                            }`}
                          >
                            <div className={`${suggestion.type === 'product' ? 'text-purple-600' : 'text-gray-400'}`}>
                              {getSuggestionIcon(suggestion.type)}
                            </div>
                            <div className="flex-1">
                              <div className={`font-medium ${suggestion.type === 'product' ? 'text-purple-900' : 'text-gray-900'}`}>
                                {suggestion.text}
                              </div>
                              <div className={`text-xs capitalize ${suggestion.type === 'product' ? 'text-purple-600' : 'text-gray-500'}`}>
                                {suggestion.type === 'product' ? 'Product' : suggestion.type}
                              </div>
                            </div>
                          </button>
                        ))}
                        <div className="border-t border-gray-100 mt-1 pt-1">
                          <button
                            onClick={handleSearch}
                            className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center space-x-3 text-sm text-gray-600"
                          >
                            <Search className="w-4 h-4" />
                            <span>Search for &quot;{searchQuery}&quot;</span>
                          </button>
                        </div>
                      </div>
                    ) : searchQuery.length >= 2 ? (
                      <div className="p-3 text-center text-gray-500">
                        <span className="text-sm">No suggestions found</span>
                        <button
                          onClick={handleSearch}
                          className="block w-full mt-2 px-3 py-1 text-sm text-purple-600 hover:text-purple-700"
                        >
                          Search for &quot;{searchQuery}&quot;
                        </button>
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            </div>

            <nav className="flex flex-col space-y-4">
              <Link 
                href="/products/categories" 
                className="text-gray-700 hover:text-blue-600 font-medium py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Categories
              </Link>
              <Link 
                href="/about-yuumpy" 
                className="text-gray-700 hover:text-blue-600 font-medium py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </Link>
              <Link 
                href="/seller/register" 
                className="inline-block text-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors mt-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Start Selling
              </Link>
              
            {/* Mobile Account Link */}
            <div className="border-t border-gray-100 pt-6 mt-2">
              {customer ? (
                <Link 
                  href="/account" 
                  className="flex items-center space-x-4 text-gray-900 group"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                    <User className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Welcome</span>
                    <span className="text-sm font-bold">{customer.firstName}</span>
                  </div>
                </Link>
              ) : (
                <Link 
                  href="/account/login" 
                  className="flex items-center space-x-4 text-gray-900 group"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-400" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest">Login / Register</span>
                </Link>
              )}
            </div>
          </nav>
        </div>
      )}
    </div>
  </header>
);
}
