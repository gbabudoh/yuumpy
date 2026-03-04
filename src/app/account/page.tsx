'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Package, Heart, Gift, Bell, Settings, LogOut, ChevronRight,
  ShoppingBag, CreditCard, Truck, MapPin, Store,
  TrendingUp, Shield, Sparkles, ArrowUpRight, Clock
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface Customer {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  createdAt: string;
}

interface RecentOrder {
  id: number;
  order_number: string;
  total_amount: number;
  order_status: string;
  created_at: string;
}

interface RecentOrderItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export default function AccountDashboard() {
  const router = useRouter();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);
  const [activeOrders, setActiveOrders] = useState(0);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [rewardsBalance, setRewardsBalance] = useState(0);
  const [sellerStatus, setSellerStatus] = useState<{ hasSeller: boolean; seller?: { id: number; store_name: string; status: string } } | null>(null);

  useEffect(() => { checkAuth(); }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/customer/auth/me');
      if (!res.ok) { router.push('/account/login'); return; }
      const data = await res.json();
      setCustomer(data.customer);
      await Promise.all([fetchOrders(), fetchWishlist(), fetchNotifications(), fetchRewards(), fetchSellerStatus()]);
    } catch { router.push('/account/login'); }
    finally { setLoading(false); }
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/customer/orders');
      if (!res.ok) return;
      const data = await res.json();
      const orders = (data.orders || []).map((o: RecentOrder & { items: string | RecentOrderItem[]; order_status: string }) => ({
        ...o, items: typeof o.items === 'string' ? JSON.parse(o.items) : (o.items || [])
      }));
      setTotalOrders(orders.length);
      setTotalSpent(orders.reduce((s: number, o: RecentOrder) => s + Number(o.total_amount), 0));
      setActiveOrders(orders.filter((o: RecentOrder & { order_status: string }) => !['delivered','cancelled'].includes(o.order_status)).length);
      setRecentOrders(orders.slice(0, 4));
    } catch {}
  };

  const fetchWishlist = async () => {
    try {
      const res = await fetch('/api/customer/wishlist');
      if (res.ok) { const d = await res.json(); setWishlistCount((d.wishlist||[]).length); }
    } catch {}
  };

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/customer/notifications?unread_only=true&limit=1');
      if (res.ok) { const d = await res.json(); setUnreadNotifications(d.unreadCount||0); }
    } catch {}
  };

  const fetchRewards = async () => {
    try {
      const res = await fetch('/api/customer/rewards');
      if (res.ok) { const d = await res.json(); setRewardsBalance(d.rewards?.pointsBalance||0); }
    } catch {}
  };

  const fetchSellerStatus = async () => {
    try {
      const res = await fetch('/api/customer/become-seller');
      if (res.ok) { const d = await res.json(); setSellerStatus(d); }
    } catch {}
  };

  const handleLogout = async () => {
    try { await fetch('/api/customer/auth/logout', { method: 'POST' }); router.push('/'); } catch {}
  };

  const statusStyle: Record<string, { bg: string; text: string; dot: string }> = {
    pending:    { bg: 'bg-amber-50',   text: 'text-amber-700',   dot: 'bg-amber-400' },
    confirmed:  { bg: 'bg-sky-50',     text: 'text-sky-700',     dot: 'bg-sky-400' },
    processing: { bg: 'bg-violet-50',  text: 'text-violet-700',  dot: 'bg-violet-400' },
    shipped:    { bg: 'bg-indigo-50',  text: 'text-indigo-700',  dot: 'bg-indigo-400' },
    delivered:  { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-400' },
    cancelled:  { bg: 'bg-red-50',     text: 'text-red-700',     dot: 'bg-red-400' },
  };

  const fmtDate = (d: string) => {
    const diff = Math.floor((Date.now() - new Date(d).getTime()) / 86400000);
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Yesterday';
    if (diff < 7) return `${diff}d ago`;
    return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  };

  const memberSince = customer?.createdAt
    ? new Date(customer.createdAt).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
    : '';

  const initials = `${customer?.firstName?.[0]||''}${customer?.lastName?.[0]||''}`.toUpperCase();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f8fa] flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-14 h-14 mx-auto">
            <div className="w-14 h-14 border-[3px] border-gray-200 rounded-full animate-spin border-t-gray-900" />
            <Sparkles className="w-5 h-5 text-gray-900 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="mt-4 text-gray-400 text-sm">Loading your account...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f8fa]">
      <Header />

      {/* ── Profile Header ── */}
      <section className="bg-white border-b border-gray-100/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-7 sm:py-9">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
            <div className="flex items-center gap-4">
              <div className="w-[60px] h-[60px] rounded-2xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 flex items-center justify-center text-white text-lg font-semibold shadow-lg shadow-gray-900/25 shrink-0">
                {initials}
              </div>
              <div className="min-w-0">
                <h1 className="text-[22px] sm:text-2xl font-semibold text-gray-900 tracking-tight truncate">
                  {customer?.firstName} {customer?.lastName}
                </h1>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-0.5">
                  <span className="text-[13px] text-gray-500 truncate">{customer?.email}</span>
                  {memberSince && (
                    <>
                      <span className="hidden sm:block w-1 h-1 rounded-full bg-gray-300" />
                      <span className="hidden sm:flex text-[13px] text-gray-400 items-center gap-1">
                        <Shield className="w-3.5 h-3.5" /> Since {memberSince}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Link href="/account/notifications" className="relative p-2.5 rounded-xl hover:bg-gray-50 transition-colors" aria-label="Notifications">
                <Bell className="w-[18px] h-[18px] text-gray-500" />
                {unreadNotifications > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
                )}
              </Link>
              <Link href="/account/settings" className="p-2.5 rounded-xl hover:bg-gray-50 transition-colors" aria-label="Settings">
                <Settings className="w-[18px] h-[18px] text-gray-500" />
              </Link>
              <div className="w-px h-6 bg-gray-200 mx-1 hidden sm:block" />
              <button onClick={handleLogout} className="flex items-center gap-2 px-3.5 py-2 rounded-xl hover:bg-gray-50 transition-colors text-[13px] text-gray-500 font-medium">
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Main Content ── */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">

        {/* ── Seller Section ── */}
        {sellerStatus?.hasSeller && sellerStatus.seller?.status === 'approved' ? (
          <Link href="/seller/dashboard" className="block">
            <section className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 rounded-3xl p-6 sm:p-8 shadow-xl shadow-emerald-200 hover:shadow-2xl hover:shadow-emerald-300 transition-all duration-300 group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4" />
              <div className="relative flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
                  <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/30 shadow-inner">
                    <Store className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">{sellerStatus.seller.store_name}</h2>
                    <p className="text-emerald-100 text-[14px] sm:text-base mt-0.5 font-medium opacity-90">Your seller dashboard is ready. Manage products, orders, and analytics.</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-7 py-3.5 bg-white text-emerald-600 rounded-2xl text-sm font-bold uppercase tracking-wider group-hover:bg-emerald-50 transition-all shadow-lg shadow-black/10">
                  Seller Dashboard
                  <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
              </div>
            </section>
          </Link>
        ) : sellerStatus?.hasSeller && sellerStatus.seller?.status === 'pending' ? (
          <section className="relative overflow-hidden bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 rounded-3xl p-6 sm:p-8 shadow-xl shadow-amber-200">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="relative flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/30 shadow-inner">
                <Clock className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Seller Application Pending</h2>
                <p className="text-amber-100 text-[14px] sm:text-base mt-0.5 font-medium opacity-90">Your store &quot;{sellerStatus.seller?.store_name}&quot; is being reviewed. You&apos;ll be notified once approved.</p>
              </div>
            </div>
          </section>
        ) : (
          <section className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 rounded-3xl p-6 sm:p-8 shadow-xl shadow-indigo-200">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4" />
            <div className="relative flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
                <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/30 shadow-inner">
                  <Store className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Turn your passion into profit</h2>
                  <p className="text-indigo-100 text-[14px] sm:text-base mt-0.5 font-medium opacity-90">Open your own store on Yuumpy and reach thousands of shoppers.</p>
                </div>
              </div>
              <Link 
                href="/account/settings?tab=selling" 
                className="group flex items-center gap-2 px-7 py-3.5 bg-white text-indigo-600 rounded-2xl text-sm font-bold uppercase tracking-wider hover:bg-indigo-50 active:scale-95 transition-all shadow-lg shadow-black/10"
              >
                Start Selling
                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Link>
            </div>
          </section>
        )}

        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="group bg-white rounded-2xl p-5 border border-gray-100 hover:border-gray-200 hover:shadow-lg hover:shadow-gray-200/60 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md shadow-emerald-500/25">
                <ShoppingBag className="w-5 h-5 text-white" />
              </div>
              <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">Orders</span>
            </div>
            <p className="text-2xl sm:text-[28px] font-bold text-gray-900 leading-none">{totalOrders}</p>
            <p className="text-[13px] text-gray-400 mt-1">Total orders</p>
          </div>

          <div className="group bg-white rounded-2xl p-5 border border-gray-100 hover:border-gray-200 hover:shadow-lg hover:shadow-gray-200/60 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/25">
                <CreditCard className="w-5 h-5 text-white" />
              </div>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-2xl sm:text-[28px] font-bold text-gray-900 leading-none">£{totalSpent.toFixed(2)}</p>
            <p className="text-[13px] text-gray-400 mt-1">Total spent</p>
          </div>

          <div className="group bg-white rounded-2xl p-5 border border-gray-100 hover:border-gray-200 hover:shadow-lg hover:shadow-gray-200/60 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-md shadow-amber-500/25">
                <Truck className="w-5 h-5 text-white" />
              </div>
              {activeOrders > 0 && (
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500" />
                </span>
              )}
            </div>
            <p className="text-2xl sm:text-[28px] font-bold text-gray-900 leading-none">{activeOrders}</p>
            <p className="text-[13px] text-gray-400 mt-1">In progress</p>
          </div>

          <div className="group bg-white rounded-2xl p-5 border border-gray-100 hover:border-gray-200 hover:shadow-lg hover:shadow-gray-200/60 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-md shadow-violet-500/25">
                <Gift className="w-5 h-5 text-white" />
              </div>
            </div>
            <p className="text-2xl sm:text-[28px] font-bold text-gray-900 leading-none">{rewardsBalance}</p>
            <p className="text-[13px] text-gray-400 mt-1">Reward points</p>
          </div>
        </div>

        {/* ── Quick Navigation ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { href: '/account/orders', icon: Package, label: 'Orders', desc: 'Track & manage', color: 'from-emerald-500 to-teal-600', shadow: 'shadow-emerald-500/20' },
            { href: '/account/wishlist', icon: Heart, label: 'Wishlist', desc: `${wishlistCount} items`, color: 'from-rose-500 to-pink-600', shadow: 'shadow-rose-500/20' },
            { href: '/account/rewards', icon: Gift, label: 'Rewards', desc: `${rewardsBalance} pts`, color: 'from-amber-500 to-orange-600', shadow: 'shadow-amber-500/20' },
            { href: '/account/notifications', icon: Bell, label: 'Notifications', desc: unreadNotifications > 0 ? `${unreadNotifications} new` : 'All read', color: 'from-blue-500 to-indigo-600', shadow: 'shadow-blue-500/20' },
            { href: '/account/settings', icon: Settings, label: 'Settings', desc: 'Profile & more', color: 'from-gray-600 to-gray-800', shadow: 'shadow-gray-600/20' },
            { href: '/account/settings?tab=addresses', icon: MapPin, label: 'Addresses', desc: 'Manage saved', color: 'from-cyan-500 to-blue-600', shadow: 'shadow-cyan-500/20' },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group flex flex-col items-center gap-2.5 p-4 sm:p-5 bg-white rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-lg hover:shadow-gray-200/60 transition-all duration-300 hover:-translate-y-0.5"
            >
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-md ${item.shadow} group-hover:scale-110 transition-transform duration-300`}>
                <item.icon className="w-5 h-5 text-white" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-gray-900">{item.label}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">{item.desc}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* ── Recent Orders ── */}
        <section className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-50">
            <div>
              <h2 className="text-[17px] font-semibold text-gray-900">Recent Orders</h2>
              <p className="text-[13px] text-gray-400 mt-0.5">Your latest activity</p>
            </div>
            <Link href="/account/orders" className="flex items-center gap-1.5 text-[13px] font-medium text-gray-500 hover:text-gray-900 transition-colors group">
              View all
              <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-4">
                <Package className="w-7 h-7 text-gray-300" />
              </div>
              <p className="text-sm font-medium text-gray-900 mb-1">No orders yet</p>
              <p className="text-[13px] text-gray-400 mb-5">Your purchases will show up here</p>
              <Link href="/" className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition-colors">
                <ShoppingBag className="w-4 h-4" /> Start Shopping
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {recentOrders.map((order) => {
                const s = statusStyle[order.order_status] || statusStyle.pending;
                return (
                  <Link key={order.id} href={`/account/orders/${order.order_number}`} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50/60 transition-colors group">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center shrink-0 group-hover:bg-gray-100 transition-colors">
                        <Package className="w-5 h-5 text-gray-400" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-900">#{order.order_number}</span>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold capitalize ${s.bg} ${s.text}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                            {order.order_status}
                          </span>
                        </div>
                        <p className="text-[12px] text-gray-400 mt-0.5 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {fmtDate(order.created_at)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-sm font-semibold text-gray-900">£{Number(order.total_amount).toFixed(2)}</span>
                      <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        {/* ── Bottom Actions ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link href="/" className="group flex items-center gap-4 p-5 bg-white rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-lg hover:shadow-gray-200/60 transition-all duration-300">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md shadow-emerald-500/25 group-hover:scale-105 transition-transform">
              <ShoppingBag className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900">Continue Shopping</p>
              <p className="text-[12px] text-gray-400 mt-0.5">Browse our latest products</p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-gray-500 group-hover:translate-x-0.5 transition-all shrink-0" />
          </Link>

          <Link href="/account/settings" className="group flex items-center gap-4 p-5 bg-white rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-lg hover:shadow-gray-200/60 transition-all duration-300">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center shadow-md shadow-gray-600/25 group-hover:scale-105 transition-transform">
              <Settings className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900">Account Settings</p>
              <p className="text-[12px] text-gray-400 mt-0.5">Manage your profile and privacy</p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-gray-500 group-hover:translate-x-0.5 transition-all shrink-0" />
          </Link>
        </div>

      </main>

      <Footer />
    </div>
  );
}
