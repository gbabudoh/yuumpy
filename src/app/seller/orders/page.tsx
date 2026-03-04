'use client';

import { useSellerContext } from '../layout';
import { useState, useEffect } from 'react';

import { 
  ShoppingBag, 
  Package, 
  Clock, 
  CheckCircle2, 
  Truck, 
  XCircle, 
  User, 
  Calendar, 
  DollarSign, 
  ArrowRight,
  ShieldCheck,
  Search,
  Filter,
  ExternalLink
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface Order {
  id: number;
  order_number: string;
  customer_first_name: string;
  customer_last_name: string;
  customer_email: string;
  total_amount: string;
  seller_payout_amount: string;
  commission_amount: string;
  order_status: string;
  payment_status: string;
  escrow_status: string;
  tracking_number: string;
  tracking_url: string;
  item_count: number;
  created_at: string;
}

const statusConfig: Record<string, { color: string; bg: string; border: string; icon: LucideIcon }> = {
  pending: { color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100', icon: Clock },
  confirmed: { color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100', icon: CheckCircle2 },
  processing: { color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100', icon: Package },
  shipped: { color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100', icon: Truck },
  delivered: { color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100', icon: CheckCircle2 },
  cancelled: { color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100', icon: XCircle },
};

export default function SellerOrdersPage() {
  useSellerContext();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  useEffect(() => { fetchOrders(); }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/seller/orders');
      const data = await res.json();
      setOrders(data.orders || []);
    } catch { } finally { setLoading(false); }
  };

  const updateOrder = async (orderId: number, updates: Record<string, unknown>) => {
    setUpdatingId(orderId);
    try {
      await fetch('/api/seller/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, ...updates }),
      });
      await fetchOrders();
    } catch { } finally { setUpdatingId(null); }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-[10px] font-black text-emerald-600 uppercase tracking-widest">Sales</span>
            <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Order Management</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Orders</h1>
          <p className="text-slate-500 font-medium">Track and fulfill your customer sales</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
            <input 
              placeholder="Search orders..." 
              className="pl-11 pr-5 py-3 rounded-2xl bg-white border border-slate-100 text-sm font-bold placeholder:text-slate-300 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 transition-all w-full md:w-64"
            />
          </div>
          <button className="p-3 rounded-2xl bg-white border border-slate-100 text-slate-400 hover:text-indigo-600 hover:border-indigo-100 transition-all">
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-full" />
            <div className="absolute inset-0 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-slate-400 font-bold text-sm uppercase tracking-widest animate-pulse">Syncing Orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-24 rounded-[3rem] bg-white border border-dashed border-slate-200">
          <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center mb-6">
            <ShoppingBag className="w-10 h-10 text-slate-300" />
          </div>
          <h3 className="text-xl font-black text-slate-900 mb-2">No orders yet</h3>
          <p className="text-slate-500 font-medium max-w-sm">
            When customers purchase your devices, they will appear here for fulfillment.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {orders.map(order => {
            const config = statusConfig[order.order_status] || { color: 'text-slate-400', bg: 'bg-slate-50', border: 'border-slate-100', icon: Clock };
            const StatusIcon = config.icon;
            
            return (
              <div key={order.id} className="group relative overflow-hidden bg-white rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500">
                <div className={`absolute top-0 left-0 w-1.5 h-full ${config.bg.replace('bg-', 'bg-')}`} style={{ backgroundColor: config.color.includes('emerald') ? '#10b981' : config.color.includes('amber') ? '#f59e0b' : config.color.includes('indigo') ? '#6366f1' : config.color.includes('purple') ? '#a855f7' : '#94a3b8' }} />
                
                <div className="p-8 sm:p-10">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                    <div className="flex-1 space-y-4">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="text-lg font-black text-slate-900 tracking-tight">Order #{order.order_number}</span>
                        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${config.bg} ${config.border} ${config.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {order.order_status}
                        </div>
                        {order.escrow_status && (
                          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border bg-blue-50 border-blue-100 text-blue-600">
                            <ShieldCheck className="w-3 h-3" />
                            Escrow: {order.escrow_status}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-6">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                            <User className="w-4 h-4 text-slate-400" />
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer</p>
                            <p className="text-sm font-bold text-slate-700">{order.customer_first_name} {order.customer_last_name}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                            <Calendar className="w-4 h-4 text-slate-400" />
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</p>
                            <p className="text-sm font-bold text-slate-700">{new Date(order.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-10">
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sale Amount</p>
                        <p className="text-xl font-black text-slate-900 tracking-tight">${parseFloat(order.total_amount).toFixed(2)}</p>
                      </div>
                      
                      <div className="w-px h-10 bg-slate-100 hidden sm:block" />

                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Your Payout</p>
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center">
                            <DollarSign className="w-3 h-3 text-emerald-600" />
                          </div>
                          <p className="text-xl font-black text-emerald-600 tracking-tight">${parseFloat(order.seller_payout_amount || '0').toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 pt-8 border-t border-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                    <div className="flex flex-wrap items-center gap-4">
                      {order.tracking_number ? (
                        <div className="flex items-center gap-2 text-slate-500 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                          <Truck className="w-4 h-4" />
                          <span className="text-xs font-bold uppercase tracking-widest">Tracking: {order.tracking_number}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-slate-400">
                          <Truck className="w-4 h-4" />
                          <span className="text-xs font-bold uppercase tracking-widest">Awaiting Shipment</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      {order.order_status === 'pending' && (
                        <button
                          disabled={updatingId === order.id}
                          onClick={() => updateOrder(order.id, { orderStatus: 'processing' })}
                          className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-indigo-600 text-white font-black text-xs uppercase tracking-widest hover:bg-slate-900 transition-all active:scale-95 shadow-lg shadow-indigo-600/20 disabled:opacity-50"
                        >
                          Accept Order <CheckCircle2 className="w-4 h-4" />
                        </button>
                      )}
                      
                      {order.order_status === 'processing' && (
                        <button
                          disabled={updatingId === order.id}
                          onClick={() => {
                            const tracking = prompt('Enter tracking number:');
                            if (tracking) updateOrder(order.id, { orderStatus: 'shipped', trackingNumber: tracking });
                          }}
                          className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-indigo-600 text-white font-black text-xs uppercase tracking-widest hover:bg-slate-900 transition-all active:scale-95 shadow-lg shadow-indigo-600/20 disabled:opacity-50"
                        >
                          Ship Item <ArrowRight className="w-4 h-4" />
                        </button>
                      )}

                      <button className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-slate-50 text-slate-600 font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-all">
                        Details <ExternalLink className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
