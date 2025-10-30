'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { MagnifyingGlassIcon, ShoppingBagIcon, Bars3Icon, XMarkIcon, TagIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';

interface SearchSuggestion {
  text: string;
  slug: string;
  type: 'product' | 'category' | 'brand';
  url: string;
}

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

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

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
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
        return <ShoppingBagIcon className="w-4 h-4" />;
      case 'category':
        return <TagIcon className="w-4 h-4" />;
      case 'brand':
        return <BuildingOfficeIcon className="w-4 h-4" />;
      default:
        return <MagnifyingGlassIcon className="w-4 h-4" />;
    }
  };

  return (
    <header className="bg-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center">
              <Image
                src="/logo.png"
                alt="Yuumpy Logo"
                width={120}
                height={48}
                className="h-6 w-auto"
                style={{ imageRendering: 'crisp-edges' }}
                priority
              />
            </Link>
          </div>

          {/* Centered Desktop Navigation */}
          <div className="flex-1 flex justify-center">
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                Home
              </Link>
              <Link href="/products" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                Products
              </Link>
              <Link href="/categories" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                Categories
              </Link>
              <Link href="/advert" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                Advert
              </Link>
              <Link href="/about" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                About
              </Link>
            </nav>
          </div>

          {/* Right Side - Search Bar and Actions */}
          <div className="flex items-center space-x-4 flex-shrink-0">
            {/* Enhanced Search Bar with Suggestions */}
            <div className="hidden lg:flex items-center">
              <div ref={searchRef} className="relative">
                <form onSubmit={handleSearch}>
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => searchQuery.length >= 2 && setShowSuggestions(true)}
                    className="w-64 pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm transition-colors"
                  />
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
                            <MagnifyingGlassIcon className="w-4 h-4" />
                            <span>Search for "{searchQuery}"</span>
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
                          Search for "{searchQuery}"
                        </button>
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-gray-700 hover:text-blue-600"
            >
              {isMenuOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            {/* Mobile Search */}
            <div className="px-4 mb-4">
              <div className="relative">
                <form onSubmit={handleSearch}>
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => searchQuery.length >= 2 && setShowSuggestions(true)}
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                  />
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
                            <MagnifyingGlassIcon className="w-4 h-4" />
                            <span>Search for "{searchQuery}"</span>
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
                          Search for "{searchQuery}"
                        </button>
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            </div>

            <nav className="flex flex-col space-y-4">
              <Link 
                href="/" 
                className="text-gray-700 hover:text-blue-600 font-medium py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                href="/products" 
                className="text-gray-700 hover:text-blue-600 font-medium py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Products
              </Link>
              <Link 
                href="/categories" 
                className="text-gray-700 hover:text-blue-600 font-medium py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Categories
              </Link>
              <Link 
                href="/advert" 
                className="text-gray-700 hover:text-blue-600 font-medium py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Advert
              </Link>
              <Link 
                href="/about" 
                className="text-gray-700 hover:text-blue-600 font-medium py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </Link>
            </nav>
            
            {/* Mobile Search */}
            <div className="mt-4">
              <form onSubmit={handleSearch} className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </form>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
