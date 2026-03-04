'use client';

import { useState, useEffect } from 'react';

import { 
  ShoppingBag, 
  Star, 
  Package, 
  MessageSquare, 
  DollarSign,
  BarChart3,
  ArrowUpRight,
  TrendingDown,
  Calendar,
  PieChart,
  LineChart,
  Zap
} from 'lucide-react';

interface DashboardStats {
  totalSales: number;
  totalOrders: number;
  totalProducts: number;
  averageRating: number;
  commissionPaid: number;
  totalReviews: number;
}

export default function SellerAnalyticsPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/seller/dashboard')
      .then(r => r.json())
      .then(d => setStats(d.stats))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500" /></div>;

  const metrics = [
    { label: 'Total Revenue', value: `$${(stats?.totalSales || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`, change: '+12.5%', trend: 'up', icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
    { label: 'Total Orders', value: stats?.totalOrders || 0, change: '+5.2%', trend: 'up', icon: ShoppingBag, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100' },
    { label: 'Active Products', value: stats?.totalProducts || 0, change: '+2', trend: 'up', icon: Package, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100' },
    { label: 'Avg. Rating', value: stats?.averageRating > 0 ? `${stats.averageRating.toFixed(1)}/5` : 'N/A', change: '+0.1', trend: 'up', icon: Star, color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-100' },
    { label: 'Commission Paid', value: `$${(stats?.commissionPaid || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`, change: '-2.4%', trend: 'down', icon: Zap, color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100' },
    { label: 'Customer Reviews', value: stats?.totalReviews || 0, change: '+8', trend: 'up', icon: MessageSquare, color: 'text-pink-600', bg: 'bg-pink-50', border: 'border-pink-100' },
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-[10px] font-black text-indigo-600 uppercase tracking-widest">Analytics</span>
            <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Performance Insights</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Analytics Dashboard</h1>
          <p className="text-slate-500 font-medium">Deep dive into your store&apos;s growth and performance metrics</p>
        </div>

        <div className="flex items-center gap-3 bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm">
          <button className="px-5 py-2.5 rounded-xl bg-slate-50 text-slate-900 text-xs font-black uppercase tracking-widest transition-all hover:bg-slate-100">Last 30 Days</button>
          <button className="px-5 py-2.5 rounded-xl text-slate-400 text-xs font-black uppercase tracking-widest transition-all hover:text-indigo-600">All Time</button>
          <div className="w-px h-6 bg-slate-100 mx-1" />
          <button className="p-2.5 rounded-xl text-slate-400 hover:bg-slate-50 transition-all">
            <Calendar className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {metrics.map((m, i) => {
          const Icon = m.icon;
          return (
            <div 
              key={i} 
              className="group relative p-8 rounded-[2.5rem] bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500 overflow-hidden"
            >
              {/* Decorative Background Icon */}
              <div className={`absolute -right-6 -bottom-6 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity duration-500`}>
                <Icon className="w-40 h-40" />
              </div>

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div className={`w-14 h-14 rounded-2xl ${m.bg} flex items-center justify-center border ${m.border} group-hover:scale-110 transition-transform duration-500`}>
                    <Icon className={`w-7 h-7 ${m.color}`} />
                  </div>
                  {m.change && (
                    <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase border ${
                      m.trend === 'up' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-rose-50 border-rose-100 text-rose-600'
                    }`}>
                      {m.trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {m.change}
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-3xl font-black text-slate-900 tracking-tight mb-1">{m.value}</p>
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{m.label}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Placeholder Section */}
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-violet-500/5 rounded-[3rem] blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        <div className="relative p-12 md:p-16 rounded-[3rem] bg-white border border-slate-100 shadow-sm text-center overflow-hidden">
          {/* Faded Background Pattern */}
          <div className="absolute inset-0 opacity-[0.02] flex items-center justify-center select-none pointer-events-none">
            <BarChart3 className="w-[800px] h-[800px]" />
          </div>

          <div className="relative z-10 max-w-2xl mx-auto space-y-8">
            <div className="flex justify-center gap-6">
              {[PieChart, LineChart, BarChart3].map((ChartIcon, i) => (
                <div key={i} className={`w-16 h-16 rounded-[1.5rem] bg-slate-50 flex items-center justify-center animate-bounce`} style={{ animationDelay: `${i * 0.2}s`, animationDuration: '3s' }}>
                  <ChartIcon className="w-8 h-8 text-slate-300" />
                </div>
              ))}
            </div>
            
            <div className="space-y-4">
              <h3 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Advanced Analytics Portal</h3>
              <p className="text-slate-500 font-medium leading-relaxed">
                We&apos;re building a sophisticated data engine to provide you with real-time sales velocity, 
                customer attribution, and conversion funnels. Stay tuned for a level of insight never seen before.
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-4 pt-4">
              {['Sales Velocity', 'Source Attribution', 'Churn Analysis', 'AOV Optimization'].map((tag) => (
                <span key={tag} className="px-4 py-2 rounded-xl bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest border border-slate-100">
                  {tag}
                </span>
              ))}
            </div>

            <button className="mt-4 px-8 py-4 rounded-2xl bg-slate-900 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-900/20 hover:scale-105 active:scale-95 transition-all">
              Notify Me on Launch
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
