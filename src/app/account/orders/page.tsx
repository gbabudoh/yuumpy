'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Package, Truck, CheckCircle, Clock, XCircle, LogOut,
  ShoppingBag, CreditCard, TrendingUp, Calendar, Search, Filter, Eye,
  ArrowUpRight, Sparkles, Gift, Heart, Settings, Bell, ChevronRight, ArrowLeft
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface OrderItem { id: number; product_name: string; product_slug: string; product_image_url: string; quantity: number; unit_price: number; total_price: number; }
interface Order { id: number; order_number: string; total_amount: number; currency: string; payment_status: string; order_status: string; tracking_number?: string; tracking_url?: string; created_at: string; items: OrderItem[] | string; }
interface Customer { id: number; email: string; firstName: string; lastName: string; }

const statusConfig: Record<string, { icon: any; color: string; bg: string; dot: string; label: string }> = {
  pending:    { icon: Clock,       color: 'text-amber-700',   bg: 'bg-amber-50',   dot: 'bg-amber-400',   label: 'Pending' },
  confirmed:  { icon: CheckCircle, color: 'text-sky-700',     bg: 'bg-sky-50',     dot: 'bg-sky-400',     label: 'Confirmed' },
  processing: { icon: Package,     color: 'text-violet-700',  bg: 'bg-violet-50',  dot: 'bg-violet-400',  label: 'Processing' },
  shipped:    { icon: Truck,       color: 'text-indigo-700',  bg: 'bg-indigo-50',  dot: 'bg-indigo-400',  label: 'Shipped' },
  delivered:  { icon: CheckCircle, color: 'text-emerald-700', bg: 'bg-emerald-50', dot: 'bg-emerald-400', label: 'Delivered' },
  cancelled:  { icon: XCircle,     color: 'text-red-700',     bg: 'bg-red-50',     dot: 'bg-red-400',     label: 'Cancelled' },
};

export default function CustomerOrdersPage() {
  const router = useRouter();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => { checkAuth(); }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/customer/auth/me');
      if (!res.ok) { router.push('/account/login'); return; }
      const data = await res.json();
      setCustomer(data.customer);
      fetchOrders();
    } catch { router.push('/account/login'); }
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/customer/orders');
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders.map((o: Order) => ({ ...o, items: typeof o.items === 'string' ? JSON.parse(o.items) : (o.items || []) })));
      }
    } catch {} finally { setLoading(false); }
  };

  const fmtDate = (d: string) => {
    const diff = Math.floor((Date.now() - new Date(d).getTime()) / 86400000);
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Yesterday';
    if (diff < 7) return `${diff}d ago`;
    return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const stats = useMemo(() => {
    const totalSpent = orders.reduce((s, o) => s + Number(o.total_amount), 0);
    const active = orders.filter(o => !['delivered','cancelled'].includes(o.order_status)).length;
    const delivered = orders.filter(o => o.order_status === 'delivered').length;
    return { totalSpent, totalOrders: orders.length, active, delivered };
  }, [orders]);

  const filtered = useMemo(() => {
    return orders.filter(o => {
      const matchSearch = !searchQuery || o.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (Array.isArray(o.items) && o.items.some(i => i.product_name.toLowerCase().includes(searchQuery.toLowerCase())));
      const matchStatus = statusFilter === 'all' || o.order_status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [orders, searchQuery, statusFilter]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f8fa] flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-14 h-14 mx-auto">
            <div className="w-14 h-14 border-[3px] border-gray-200 rounded-full animate-spin border-t-gray-900" />
            <Sparkles className="w-5 h-5 text-gray-900 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="mt-4 text-gray-400 text-sm">Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f8fa]">
      <Header />

      {/* Breadcrumb Header */}
      <div className="bg-white border-b border-gray-100/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5 sm:py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/account" className="p-2 -ml-2 rounded-xl hover:bg-gray-50 transition-colors" aria-label="Back to account">
                <ArrowLeft className="w-5 h-5 text-gray-400" />
              </Link>
              <div>
                <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 tracking-tight">My Orders</h1>
                <p className="text-[13px] text-gray-400 mt-0.5">Track and manage your purchases</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[
            { icon: ShoppingBag, value: stats.totalOrders, label: 'Total orders', gradient: 'from-emerald-500 to-teal-600', shadow: 'shadow-emerald-500/25' },
            { icon: CreditCard, value: `£${stats.totalSpent.toFixed(2)}`, label: 'Total spent', gradient: 'from-blue-500 to-indigo-600', shadow: 'shadow-blue-500/25' },
            { icon: Truck, value: stats.active, label: 'In progress', gradient: 'from-amber-500 to-orange-600', shadow: 'shadow-amber-500/25' },
            { icon: CheckCircle, value: stats.delivered, label: 'Delivered', gradient: 'from-emerald-500 to-green-600', shadow: 'shadow-emerald-500/25' },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 hover:border-gray-200 hover:shadow-lg hover:shadow-gray-200/60 transition-all duration-300">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.gradient} flex items-center justify-center shadow-md ${s.shadow}`}>
                  <s.icon className="w-5 h-5 text-white" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900 leading-none">{s.value}</p>
              <p className="text-[13px] text-gray-400 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Orders List */}
        <section className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-50">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" placeholder="Search orders..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 focus:bg-white transition-all" />
              </div>
              <div className="relative">
                <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
                  className="pl-10 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 appearance-none cursor-pointer">
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

          {filtered.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-4">
                <Package className="w-7 h-7 text-gray-300" />
              </div>
              {orders.length === 0 ? (
                <>
                  <p className="text-sm font-medium text-gray-900 mb-1">No orders yet</p>
                  <p className="text-[13px] text-gray-400 mb-5">When you make a purchase, it will appear here</p>
                  <Link href="/" className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition-colors">
                    <ShoppingBag className="w-4 h-4" /> Start Shopping
                  </Link>
                </>
              ) : (
                <>
                  <p className="text-sm font-medium text-gray-900 mb-1">No matching orders</p>
                  <button onClick={() => { setSearchQuery(''); setStatusFilter('all'); }} className="text-[13px] text-gray-500 hover:text-gray-900 font-medium mt-2 transition-colors">Clear filters</button>
                </>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {filtered.map((order) => {
                const st = statusConfig[order.order_status] || statusConfig.pending;
                const items = Array.isArray(order.items) ? order.items : [];
                const first = items[0];
                const rest = items.length - 1;
                return (
                  <Link key={order.id} href={`/account/orders/${order.order_number}`} className="flex items-center gap-4 px-6 py-5 hover:bg-gray-50/60 transition-colors group">
                    <div className="relative shrink-0">
                      {first?.product_image_url ? (
                        <div className="relative w-16 h-16 rounded-xl overflow-hidden ring-1 ring-gray-100">
                          <Image src={first.product_image_url} alt={first.product_name} fill className="object-cover" />
                        </div>
                      ) : (
                        <div className="w-16 h-16 rounded-xl bg-gray-50 flex items-center justify-center">
                          <Package className="w-6 h-6 text-gray-300" />
                        </div>
                      )}
                      {rest > 0 && (
                        <span className="absolute -bottom-1.5 -right-1.5 w-6 h-6 bg-gray-900 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">+{rest}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-gray-900">#{order.order_number}</span>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${st.bg} ${st.color}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />{st.label}
                        </span>
                      </div>
                      <p className="text-[13px] text-gray-500 truncate">{first?.product_name || 'Order'}{rest > 0 && ` and ${rest} more`}</p>
                      <p className="text-[12px] text-gray-400 mt-0.5 flex items-center gap-1"><Clock className="w-3 h-3" />{fmtDate(order.created_at)}</p>
                    </div>
                    <div className="text-right shrink-0 flex items-center gap-3">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">£{Number(order.total_amount).toFixed(2)}</p>
                        <p className="text-[11px] text-gray-400 mt-0.5">{order.payment_status === 'paid' ? <span className="text-emerald-600">Paid</span> : <span className="text-amber-600">{order.payment_status}</span>}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
