'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Heart, ShoppingBag, Trash2, ExternalLink, Sparkles, 
  User, LogOut, Settings, Bell, Package
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface WishlistItem {
  id: number;
  product_id: number;
  name: string;
  slug: string;
  price: number;
  original_price?: number;
  image_url: string;
  affiliate_url: string;
  purchase_type: string;
  product_condition: string;
  stock_quantity?: number;
  brand_name?: string;
  category_name?: string;
  created_at: string;
}

interface Customer {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
}

export default function WishlistPage() {
  const router = useRouter();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<number | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/customer/auth/me');
      if (!response.ok) {
        router.push('/account/login');
        return;
      }
      const data = await response.json();
      setCustomer(data.customer);
      fetchWishlist();
    } catch {
      router.push('/account/login');
    }
  };

  const fetchWishlist = async () => {
    try {
      const response = await fetch('/api/customer/wishlist');
      if (response.ok) {
        const data = await response.json();
        setWishlist(data.wishlist || []);
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (productId: number) => {
    if (!confirm('Remove this item from your wishlist?')) {
      return;
    }

    setRemovingId(productId);
    try {
      const response = await fetch(`/api/customer/wishlist?product_id=${productId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setWishlist(wishlist.filter(item => item.product_id !== productId));
      } else {
        alert('Failed to remove item from wishlist');
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      alert('Failed to remove item from wishlist');
    } finally {
      setRemovingId(null);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/customer/auth/logout', { method: 'POST' });
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const formatPrice = (price: number) => {
    return `£${Number(price).toFixed(2)}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-purple-200 rounded-full animate-spin border-t-purple-600 mx-auto"></div>
            <Sparkles className="w-6 h-6 text-purple-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="mt-4 text-gray-600 font-medium">Loading your wishlist...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <Header />
      
      {/* Hero Section */}
      <div className="bg-[#DCDCDC] text-gray-800">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center ring-4 ring-purple-400/30">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <div>
                <p className="text-gray-600 text-sm">My Wishlist</p>
                <h1 className="text-2xl md:text-3xl font-bold">
                  {customer?.firstName} {customer?.lastName}
                </h1>
                <p className="text-gray-500 text-sm">{customer?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="p-2 bg-gray-500/20 hover:bg-gray-500/30 rounded-xl transition-colors cursor-pointer">
                <Bell className="w-5 h-5" />
              </button>
              <button className="p-2 bg-gray-500/20 hover:bg-gray-500/30 rounded-xl transition-colors cursor-pointer">
                <Settings className="w-5 h-5" />
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-gray-500/20 hover:bg-gray-500/30 rounded-xl transition-colors text-sm font-medium cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Card */}
        <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 p-6 mb-8 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Total Items</p>
              <p className="text-3xl font-bold text-gray-900">{wishlist.length}</p>
            </div>
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30">
              <Heart className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
          <Link href="/account/orders" className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:border-green-300 hover:shadow-md transition-all group">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
              <Package className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900 text-sm">My Orders</p>
              <p className="text-xs text-gray-500">View orders</p>
            </div>
          </Link>
          <Link href="/" className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all group">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
              <ShoppingBag className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900 text-sm">Continue Shopping</p>
              <p className="text-xs text-gray-500">Browse products</p>
            </div>
          </Link>
          <Link href="/contact" className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all group">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
              <Settings className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900 text-sm">Get Help</p>
              <p className="text-xs text-gray-500">Contact support</p>
            </div>
          </Link>
        </div>

        {/* Wishlist Items */}
        {wishlist.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Your wishlist is empty</h3>
            <p className="text-gray-500 mb-6 max-w-sm mx-auto">
              Start adding products you love to your wishlist for easy access later.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/30 transition-all"
            >
              <ShoppingBag className="w-5 h-5" />
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlist.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 overflow-hidden hover:shadow-xl transition-all group"
              >
                {/* Product Image */}
                <Link href={`/products/${item.slug}`} className="block relative aspect-square bg-gray-100">
                  {item.image_url ? (
                    <Image
                      src={item.image_url}
                      alt={item.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-16 h-16 text-gray-400" />
                    </div>
                  )}
                  <div className="absolute top-3 right-3">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        handleRemove(item.product_id);
                      }}
                      disabled={removingId === item.product_id}
                      className="w-10 h-10 bg-white/90 hover:bg-red-500 rounded-full flex items-center justify-center transition-colors shadow-lg"
                      title="Remove from wishlist"
                    >
                      {removingId === item.product_id ? (
                        <div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <Trash2 className="w-5 h-5 text-gray-600 group-hover:text-white" />
                      )}
                    </button>
                  </div>
                  {item.product_condition && (
                    <div className="absolute top-3 left-3">
                      <span className="px-2 py-1 bg-white/90 text-xs font-medium text-gray-700 rounded-full capitalize">
                        {item.product_condition}
                      </span>
                    </div>
                  )}
                </Link>

                {/* Product Info */}
                <div className="p-5">
                  {item.brand_name && (
                    <p className="text-xs text-gray-500 mb-1">{item.brand_name}</p>
                  )}
                  <Link href={`/products/${item.slug}`}>
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-purple-600 transition-colors">
                      {item.name}
                    </h3>
                  </Link>
                  
                  {/* Price */}
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-xl font-bold text-gray-900">
                      {formatPrice(item.price)}
                    </span>
                    {item.original_price && item.original_price > item.price && (
                      <>
                        <span className="text-sm text-gray-500 line-through">
                          {formatPrice(item.original_price)}
                        </span>
                        <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">
                          {Math.round(((item.original_price - item.price) / item.original_price) * 100)}% OFF
                        </span>
                      </>
                    )}
                  </div>

                  {/* Stock Status */}
                  {item.purchase_type === 'direct' && item.stock_quantity !== null && (
                    <div className="mb-4">
                      {item.stock_quantity > 0 ? (
                        <span className="text-xs text-green-600 font-medium">In Stock</span>
                      ) : (
                        <span className="text-xs text-red-600 font-medium">Out of Stock</span>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    <a
                      href={item.affiliate_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2.5 rounded-xl font-medium hover:shadow-lg hover:shadow-purple-500/30 transition-all text-sm"
                    >
                      <ExternalLink className="w-4 h-4" />
                      {item.purchase_type === 'direct' ? 'Buy Now' : 'View Deal'}
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

