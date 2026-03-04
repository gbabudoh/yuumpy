'use client';

import { useSellerContext } from '../layout';
import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft,
  TrendingUp, 
  ShoppingBag, 
  Clock, 
  Lock, 
  Star, 
  Package, 
  MessageSquare,
  AlertCircle,
  ChevronRight,
  ShieldCheck,
  Zap,
  DollarSign,
  Settings
} from 'lucide-react';

interface DashboardStats {
  totalSales: number;
  totalOrders: number;
  pendingOrders: number;
  escrowBalance: number;
  commissionPaid: number;
  averageRating: number;
  totalProducts: number;
  totalReviews: number;
}

export default function SellerDashboard() {
  const { seller, loading } = useSellerContext();
  const [stats, setStats] = useState<DashboardStats>({
    totalSales: 0,
    totalOrders: 0,
    pendingOrders: 0,
    escrowBalance: 0,
    commissionPaid: 0,
    averageRating: 0,
    totalProducts: 0,
    totalReviews: 0,
  });

  useEffect(() => {
    if (seller) {
      setStats(prev => ({
        ...prev,
        totalSales: Number(seller.total_sales) || 0,
        totalOrders: Number(seller.total_orders) || 0,
        averageRating: Number(seller.average_rating) || 0,
      }));

      fetch('/api/seller/dashboard')
        .then(res => res.json())
        .then(data => {
          if (data.stats) setStats(data.stats);
        })
        .catch(() => {});
    }
  }, [seller]);

  const statCards = useMemo(() => [
    { label: 'Total Revenue', value: `$${stats.totalSales.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
    { label: 'Total Orders', value: stats.totalOrders.toString(), icon: ShoppingBag, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100' },
    { label: 'Pending Orders', value: stats.pendingOrders.toString(), icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
    { label: 'Escrow Balance', value: `$${stats.escrowBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, icon: Lock, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
    { label: 'Commission Paid', value: `$${stats.commissionPaid.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, icon: TrendingUp, color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100' },
    { label: 'Store Rating', value: stats.averageRating > 0 ? `${stats.averageRating.toFixed(1)}` : 'N/A', icon: Star, color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-100' },
    { label: 'Active Products', value: stats.totalProducts.toString(), icon: Package, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100' },
    { label: 'Total Reviews', value: stats.totalReviews.toString(), icon: MessageSquare, color: 'text-pink-600', bg: 'bg-pink-50', border: 'border-pink-100' },
  ], [stats]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-full" />
          <div className="absolute inset-0 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto animate-fadeIn">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div className="space-y-2">
          <Link 
            href="/account"
            className="inline-flex items-center gap-2 text-[10px] font-black text-slate-400 hover:text-indigo-600 uppercase tracking-widest transition-all mb-4 group ring-1 ring-slate-100 px-3 py-1.5 rounded-full hover:ring-indigo-100 hover:bg-indigo-50/50"
          >
            <ArrowLeft className="w-3 h-3 transition-transform group-hover:-translate-x-1" />
            Back to Account
          </Link>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-[10px] font-black text-indigo-600 uppercase tracking-widest">Overview</span>
            <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
            Welcome back<span className="text-indigo-600">{seller ? `, ${seller.store_name}` : ''}</span>
          </h1>
          <p className="text-slate-500 font-medium max-w-md">
            Your store is performing well. Here&apos;s a summary of your activity and earnings for today.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link 
            href="/seller/products?new=1"
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-2xl text-sm font-bold transition-all active:scale-95 shadow-lg shadow-indigo-600/20"
          >
            <Package className="w-4 h-4" />
            Add Product
          </Link>
        </div>
      </div>

      {/* Status Banner */}
      {seller?.status === 'pending' && (
        <div className="mb-8 p-6 rounded-3xl overflow-hidden relative group" style={{
          background: 'linear-gradient(135deg, rgba(245,158,11,0.1), rgba(245,158,11,0.05))',
          border: '1px solid rgba(245,158,11,0.2)',
        }}>
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-12 transition-transform duration-500">
            <Clock className="w-16 h-16 text-amber-500" />
          </div>
          <div className="relative flex items-center gap-5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center shrink-0 border border-amber-500/30">
              <AlertCircle className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <h3 className="text-amber-400 font-bold text-lg leading-tight">Account Pending Approval</h3>
              <p className="text-amber-200/60 text-sm mt-1 font-medium">Your seller account is currently being reviewed. You&apos;ll be able to start listing products once our team confirms your store details.</p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className="group relative p-6 rounded-[2rem] transition-all duration-300 hover:-translate-y-1 overflow-hidden bg-white border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5">
              <div className={`absolute top-0 right-0 w-24 h-24 translate-x-8 -translate-y-8 rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-700 ${card.bg}`} />
              
              <div className="relative space-y-4">
                <div className="flex items-center justify-between">
                  <div className={`p-3 rounded-2xl ${card.bg} ${card.border} transition-transform duration-500 group-hover:rotate-12`}>
                    <Icon className={`w-5 h-5 ${card.color}`} />
                  </div>
                  <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-gray-50 border border-gray-100">
                    <TrendingUp className="w-3 h-3 text-emerald-500" />
                    <span className="text-[10px] font-bold text-emerald-600">+12%</span>
                  </div>
                </div>
                <div>
                  <p className="text-2xl font-black text-slate-900 tracking-tight">{card.value}</p>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">{card.label}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        {/* Quick Actions */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between px-2 mb-2">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500 fill-amber-500" />
              Quick Actions
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { href: '/seller/products', label: 'Products', desc: 'Listing management', icon: Package, color: 'text-indigo-600', bg: 'bg-indigo-50' },
              { href: '/seller/orders', label: 'Orders', desc: 'Track fulfillment', icon: ShoppingBag, color: 'text-emerald-600', bg: 'bg-emerald-50' },
              { href: '/seller/settings', label: 'Settings', desc: 'Store profile', icon: Settings, color: 'text-purple-600', bg: 'bg-purple-50' },
            ].map((action, i) => {
              const Icon = action.icon;
              return (
                <Link key={i} href={action.href} className="group p-6 rounded-[2rem] transition-all duration-300 bg-white border border-gray-100 hover:border-indigo-100 hover:shadow-lg hover:shadow-indigo-500/5">
                  <div className={`w-12 h-12 rounded-2xl ${action.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className={`w-6 h-6 ${action.color}`} />
                  </div>
                  <h3 className="text-slate-900 font-bold mb-1 tracking-tight">{action.label}</h3>
                  <p className="text-slate-500 text-xs font-medium leading-relaxed">{action.desc}</p>
                  <div className="mt-4 flex items-center gap-1.5 text-[11px] font-black text-indigo-600 group-hover:gap-2.5 transition-all">
                    Navigate <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Store Health */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2 px-2 mb-2">
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
            Store Health
          </h2>
          <div className="p-6 rounded-[2rem] bg-white border border-gray-100 shadow-sm space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                <span className="text-slate-500">Order Fulfillment</span>
                <span className="text-indigo-600">98%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full" style={{ width: '98%' }} />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                <span className="text-slate-500">Customer Response</span>
                <span className="text-emerald-600">Good</span>
              </div>
              <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '85%' }} />
              </div>
            </div>
            <div className="pt-2">
              <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100/50">
                <div className="flex items-center gap-3">
                  <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  <div>
                    <p className="text-xs font-bold text-indigo-900">Pro Seller Status</p>
                    <p className="text-[10px] text-slate-500 mt-0.5 font-medium">You&apos;re in the top 5% of sellers this month!</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Yuumpy Guarantee Info */}
      <section className="relative p-8 sm:p-10 rounded-[2.5rem] overflow-hidden group shadow-xl shadow-indigo-500/5 border border-gray-100 bg-white">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-transparent pointer-events-none" />
        <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:scale-110 transition-transform duration-1000">
          <ShieldCheck className="w-48 h-48 text-indigo-600" />
        </div>
        
        <div className="relative">
          <div className="flex flex-col md:flex-row md:items-center gap-6 mb-10">
            <div className="w-16 h-16 rounded-[1.5rem] bg-indigo-600 flex items-center justify-center shadow-xl shadow-indigo-600/30">
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Yuumpy Guarantee</h3>
              <p className="text-indigo-600/70 font-black uppercase tracking-[0.2em] text-[10px] mt-1">Trust-based marketplace commerce</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {[
              { step: '01', title: 'Secure Escrow', desc: 'Customer payments are held securely in escrow by Yuumpy, ensuring trust for both parties.' },
              { step: '02', title: 'Fulfillment', desc: 'Ship your orders and provide tracking. The system automatically updates the customer.' },
              { step: '03', title: 'Rapid Release', desc: `Funds (minus ${seller?.commission_rate || 12}% comm.) are released 7 days after delivery confirmation.` },
            ].map((item, idx) => (
              <div key={idx} className="space-y-3 relative">
                <span className="text-4xl font-black text-slate-900/5 absolute -top-4 -left-2 select-none tracking-tighter">{item.step}</span>
                <h4 className="text-slate-900 font-bold text-lg tracking-tight relative z-10">{item.title}</h4>
                <p className="text-slate-500 text-sm leading-relaxed font-medium">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
