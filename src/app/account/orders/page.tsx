'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Package, Truck, CheckCircle, Clock, XCircle, LogOut, User, ChevronRight,
  ShoppingBag, CreditCard, TrendingUp, Calendar, Search, Filter, Eye,
  ArrowUpRight, Sparkles, Gift, Heart, Settings, Bell, HelpCircle
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface OrderItem {
  id: number;
  product_name: string;
  product_slug: string;
  product_image_url: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface Order {
  id: number;
  order_number: string;
  total_amount: number;
  currency: string;
  payment_status: string;
  order_status: string;
  tracking_number?: string;
  tracking_url?: string;
  created_at: string;
  items: OrderItem[] | string;
}

interface Customer {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
}

const statusConfig: Record<string, { icon: any; color: string; bgColor: string; borderColor: string; label: string }> = {
  pending: { icon: Clock, color: 'text-amber-600', bgColor: 'bg-amber-50', borderColor: 'border-amber-200', label: 'Pending' },
  confirmed: { icon: CheckCircle, color: 'text-blue-600', bgColor: 'bg-blue-50', borderColor: 'border-blue-200', label: 'Confirmed' },
  processing: { icon: Package, color: 'text-purple-600', bgColor: 'bg-purple-50', borderColor: 'border-purple-200', label: 'Processing' },
  shipped: { icon: Truck, color: 'text-indigo-600', bgColor: 'bg-indigo-50', borderColor: 'border-indigo-200', label: 'Shipped' },
  delivered: { icon: CheckCircle, color: 'text-emerald-600', bgColor: 'bg-emerald-50', borderColor: 'border-emerald-200', label: 'Delivered' },
  cancelled: { icon: XCircle, color: 'text-red-600', bgColor: 'bg-red-50', borderColor: 'border-red-200', label: 'Cancelled' }
};

export default function CustomerOrdersPage() {
  const router = useRouter();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (customer) {
      fetchUnreadCount();
      // Refresh notification count every 30 seconds
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [customer]);

  const fetchUnreadCount = async () => {
    try {
      const response = await fetch('/api/customer/notifications?unread_only=true&limit=1');
      if (response.ok) {
        const data = await response.json();
        setUnreadNotifications(data.unreadCount || 0);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/customer/auth/me');
      if (!response.ok) {
        router.push('/account/login');
        return;
      }
      const data = await response.json();
      setCustomer(data.customer);
      fetchOrders();
    } catch {
      router.push('/account/login');
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/customer/orders');
      if (response.ok) {
        const data = await response.json();
        const parsedOrders = data.orders.map((order: Order) => ({
          ...order,
          items: typeof order.items === 'string' ? JSON.parse(order.items) : (order.items || [])
        }));
        setOrders(parsedOrders);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatRelativeDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return formatDate(dateString);
  };

  // Calculate statistics
  const stats = useMemo(() => {
    const totalSpent = orders.reduce((sum, order) => sum + Number(order.total_amount), 0);
    const totalOrders = orders.length;
    const deliveredOrders = orders.filter(o => o.order_status === 'delivered').length;
    const activeOrders = orders.filter(o => !['delivered', 'cancelled'].includes(o.order_status)).length;
    
    return { totalSpent, totalOrders, deliveredOrders, activeOrders };
  }, [orders]);

  // Filter orders
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchesSearch = searchQuery === '' || 
        order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (Array.isArray(order.items) && order.items.some(item => 
          item.product_name.toLowerCase().includes(searchQuery.toLowerCase())
        ));
      const matchesStatus = statusFilter === 'all' || order.order_status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [orders, searchQuery, statusFilter]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-green-200 rounded-full animate-spin border-t-green-600 mx-auto"></div>
            <Sparkles className="w-6 h-6 text-green-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="mt-4 text-gray-600 font-medium">Loading your orders...</p>
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
              <div className="w-16 h-16 bg-gray-600 rounded-2xl flex items-center justify-center ring-4 ring-gray-400/30">
                <User className="w-8 h-8 text-white" />
              </div>
              <div>
                <p className="text-gray-600 text-sm">Welcome back,</p>
                <h1 className="text-2xl md:text-3xl font-bold">
                  {customer?.firstName} {customer?.lastName}
                </h1>
                <p className="text-gray-500 text-sm">{customer?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/account/notifications"
                className="p-2 bg-gray-500/20 hover:bg-gray-500/30 rounded-xl transition-colors cursor-pointer relative"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadNotifications > 0 && (
                  <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center transform translate-x-1 -translate-y-1">
                    {unreadNotifications > 9 ? '9+' : unreadNotifications}
                  </span>
                )}
              </Link>
              <Link
                href="/account/settings"
                className="p-2 bg-gray-500/20 hover:bg-gray-500/30 rounded-xl transition-colors cursor-pointer"
                title="Settings"
              >
                <Settings className="w-5 h-5" />
              </Link>
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
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 mt-6">
          <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 p-5 border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/30">
                <ShoppingBag className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">All Time</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
            <p className="text-sm text-gray-500">Total Orders</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 p-5 border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
              <TrendingUp className="w-4 h-4 text-green-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900">£{stats.totalSpent.toFixed(2)}</p>
            <p className="text-sm text-gray-500">Total Spent</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 p-5 border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/30">
                <Truck className="w-6 h-6 text-white" />
              </div>
              {stats.activeOrders > 0 && (
                <span className="flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                </span>
              )}
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.activeOrders}</p>
            <p className="text-sm text-gray-500">Active Orders</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 p-5 border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.deliveredOrders}</p>
            <p className="text-sm text-gray-500">Delivered</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          <Link href="/" className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:border-green-300 hover:shadow-md transition-all group">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
              <ShoppingBag className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900 text-sm">Continue Shopping</p>
              <p className="text-xs text-gray-500">Browse products</p>
            </div>
          </Link>
          <Link href="/contact" className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all group">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
              <HelpCircle className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900 text-sm">Get Help</p>
              <p className="text-xs text-gray-500">Contact support</p>
            </div>
          </Link>
          <Link href="/account/wishlist" className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all group">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
              <Heart className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900 text-sm">Wishlist</p>
              <p className="text-xs text-gray-500">View saved items</p>
            </div>
          </Link>
          <Link href="/account/rewards" className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:border-amber-300 hover:shadow-md transition-all group">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center group-hover:bg-amber-200 transition-colors">
              <Gift className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900 text-sm">Rewards</p>
              <p className="text-xs text-gray-500">View points</p>
            </div>
          </Link>
        </div>

        {/* Orders Section */}
        <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 overflow-hidden">
          {/* Section Header */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Package className="w-6 h-6 text-green-600" />
                  My Orders
                </h2>
                <p className="text-sm text-gray-500 mt-1">Track and manage your orders</p>
              </div>
              
              {/* Search and Filter */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search orders..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent w-full sm:w-64 transition-all"
                  />
                </div>
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="pl-10 pr-8 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none bg-white cursor-pointer"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Orders List */}
          {filteredOrders.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-10 h-10 text-gray-400" />
              </div>
              {orders.length === 0 ? (
                <>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders yet</h3>
                  <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                    When you make a purchase, your orders will appear here for easy tracking.
                  </p>
                  <Link
                    href="/"
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-green-500/30 transition-all"
                  >
                    <ShoppingBag className="w-5 h-5" />
                    Start Shopping
                  </Link>
                </>
              ) : (
                <>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No matching orders</h3>
                  <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
                  <button
                    onClick={() => { setSearchQuery(''); setStatusFilter('all'); }}
                    className="mt-4 text-green-600 hover:text-green-700 font-medium text-sm"
                  >
                    Clear filters
                  </button>
                </>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredOrders.map((order) => {
                const status = statusConfig[order.order_status] || statusConfig.pending;
                const StatusIcon = status.icon;
                const items = Array.isArray(order.items) ? order.items : [];
                const firstItem = items[0];
                const remainingCount = items.length - 1;

                return (
                  <div key={order.id} className="p-6 hover:bg-gray-50/50 transition-colors">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                      {/* Product Preview */}
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="relative flex-shrink-0">
                          {firstItem?.product_image_url ? (
                            <div className="relative w-20 h-20 rounded-xl overflow-hidden ring-2 ring-gray-100">
                              <Image
                                src={firstItem.product_image_url}
                                alt={firstItem.product_name}
                                fill
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-20 h-20 bg-gray-100 rounded-xl flex items-center justify-center">
                              <Package className="w-8 h-8 text-gray-400" />
                            </div>
                          )}
                          {remainingCount > 0 && (
                            <div className="absolute -bottom-2 -right-2 w-7 h-7 bg-gray-900 text-white text-xs font-bold rounded-full flex items-center justify-center ring-2 ring-white">
                              +{remainingCount}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                              #{order.order_number}
                            </span>
                            <span className="text-xs text-gray-400">•</span>
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatRelativeDate(order.created_at)}
                            </span>
                          </div>
                          <p className="font-medium text-gray-900 truncate">
                            {firstItem?.product_name || 'Order'}
                            {remainingCount > 0 && (
                              <span className="text-gray-500 font-normal"> and {remainingCount} more</span>
                            )}
                          </p>
                          <p className="text-sm text-gray-500 mt-0.5">
                            {items.reduce((sum, item) => sum + item.quantity, 0)} items
                          </p>
                        </div>
                      </div>

                      {/* Status & Price */}
                      <div className="flex items-center gap-4 lg:gap-6">
                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${status.bgColor} ${status.borderColor}`}>
                          <StatusIcon className={`w-4 h-4 ${status.color}`} />
                          <span className={`text-sm font-medium ${status.color}`}>
                            {status.label}
                          </span>
                        </div>
                        
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900">
                            £{Number(order.total_amount).toFixed(2)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {order.payment_status === 'paid' ? (
                              <span className="text-green-600">Paid</span>
                            ) : (
                              <span className="text-amber-600">Payment {order.payment_status}</span>
                            )}
                          </p>
                        </div>

                        <Link
                          href={`/account/orders/${order.order_number}`}
                          className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-sm font-medium transition-colors group"
                        >
                          <Eye className="w-4 h-4" />
                          <span className="hidden sm:inline">View</span>
                          <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                        </Link>
                      </div>
                    </div>

                    {/* Tracking Info */}
                    {order.tracking_number && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-2 text-sm">
                          <Truck className="w-4 h-4 text-indigo-600" />
                          <span className="text-gray-600">Tracking:</span>
                          <code className="font-mono text-gray-900 bg-gray-100 px-2 py-0.5 rounded">
                            {order.tracking_number}
                          </code>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
