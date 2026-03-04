'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Package, Truck, CheckCircle, Clock, XCircle,
  ArrowLeft, MapPin, CreditCard, Calendar,
  Box, ShoppingBag, ExternalLink, Copy, Check, Sparkles, ChevronRight, HelpCircle
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface OrderItem { id: number; product_name: string; product_slug: string; product_image_url: string; quantity: number; unit_price: number; total_price: number; }
interface ShippingAddress { address_line1: string; address_line2?: string; city: string; state?: string; postal_code: string; country: string; }
interface Order {
  id: number; order_number: string; total_amount: number; subtotal?: number; shipping_cost?: number; tax_amount?: number;
  currency: string; payment_status: string; order_status: string; tracking_number?: string; tracking_url?: string;
  shipping_carrier?: string; estimated_delivery?: string; created_at: string; updated_at?: string; shipped_at?: string;
  delivered_at?: string; items: OrderItem[] | string; shipping_address?: ShippingAddress | string;
}

const statusCfg: Record<string, { icon: any; color: string; bg: string; dot: string; label: string }> = {
  pending:    { icon: Clock,       color: 'text-amber-700',   bg: 'bg-amber-50',   dot: 'bg-amber-400',   label: 'Order Placed' },
  confirmed:  { icon: CheckCircle, color: 'text-sky-700',     bg: 'bg-sky-50',     dot: 'bg-sky-400',     label: 'Confirmed' },
  processing: { icon: Package,     color: 'text-violet-700',  bg: 'bg-violet-50',  dot: 'bg-violet-400',  label: 'Processing' },
  shipped:    { icon: Truck,       color: 'text-indigo-700',  bg: 'bg-indigo-50',  dot: 'bg-indigo-400',  label: 'Shipped' },
  delivered:  { icon: CheckCircle, color: 'text-emerald-700', bg: 'bg-emerald-50', dot: 'bg-emerald-400', label: 'Delivered' },
  cancelled:  { icon: XCircle,     color: 'text-red-700',     bg: 'bg-red-50',     dot: 'bg-red-400',     label: 'Cancelled' },
};
const steps = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];

export default function OrderDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const orderNumber = params.orderNumber as string;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => { checkAuth(); }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/customer/auth/me');
      if (!res.ok) { router.push('/account/login'); return; }
      fetchOrder();
    } catch { router.push('/account/login'); }
  };

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/customer/orders/${orderNumber}`);
      if (res.ok) {
        const d = await res.json();
        setOrder({
          ...d.order,
          items: typeof d.order.items === 'string' ? JSON.parse(d.order.items) : (d.order.items || []),
          shipping_address: typeof d.order.shipping_address === 'string' ? JSON.parse(d.order.shipping_address) : d.order.shipping_address,
        });
      } else router.push('/account/orders');
    } catch { router.push('/account/orders'); }
    finally { setLoading(false); }
  };

  const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  const fmtDateTime = (d: string) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  const copyTracking = () => {
    if (order?.tracking_number) { navigator.clipboard.writeText(order.tracking_number); setCopied(true); setTimeout(() => setCopied(false), 2000); }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f8fa] flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-14 h-14 mx-auto">
            <div className="w-14 h-14 border-[3px] border-gray-200 rounded-full animate-spin border-t-gray-900" />
            <Sparkles className="w-5 h-5 text-gray-900 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="mt-4 text-gray-400 text-sm">Loading order...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-[#f8f8fa] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-4"><Package className="w-7 h-7 text-gray-300" /></div>
          <p className="text-sm font-medium text-gray-900 mb-1">Order not found</p>
          <Link href="/account/orders" className="text-[13px] text-gray-500 hover:text-gray-900 font-medium transition-colors">Back to Orders</Link>
        </div>
      </div>
    );
  }

  const st = statusCfg[order.order_status] || statusCfg.pending;
  const items = Array.isArray(order.items) ? order.items : [];
  const stepIdx = order.order_status === 'cancelled' ? -1 : steps.indexOf(order.order_status);
  const addr = order.shipping_address as ShippingAddress | undefined;

  return (
    <div className="min-h-screen bg-[#f8f8fa]">
      <Header />

      <div className="bg-white border-b border-gray-100/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-5 sm:py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/account/orders" className="p-2 -ml-2 rounded-xl hover:bg-gray-50 transition-colors" aria-label="Back to orders">
                <ArrowLeft className="w-5 h-5 text-gray-400" />
              </Link>
              <div>
                <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 tracking-tight">Order #{order.order_number}</h1>
                <p className="text-[13px] text-gray-400 mt-0.5 flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {fmtDate(order.created_at)}</p>
              </div>
            </div>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold ${st.bg} ${st.color}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />{st.label}
            </span>
          </div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* Progress */}
        {order.order_status !== 'cancelled' && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="text-[13px] font-semibold text-gray-500 uppercase tracking-wider mb-5">Order Progress</h3>
            <div className="relative">
              <div className="absolute top-[18px] left-0 right-0 h-[3px] bg-gray-100 rounded-full">
                <div className="h-full bg-gray-900 rounded-full transition-all duration-700" style={{ width: `${(stepIdx / (steps.length - 1)) * 100}%` }} />
              </div>
              <div className="relative flex justify-between">
                {steps.map((step, i) => {
                  const sc = statusCfg[step];
                  const done = i <= stepIdx;
                  const current = i === stepIdx;
                  return (
                    <div key={step} className="flex flex-col items-center">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 ${done ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-400'} ${current ? 'ring-4 ring-gray-900/10' : ''}`}>
                        <sc.icon className="w-4 h-4" />
                      </div>
                      <span className={`mt-2 text-[11px] font-medium ${done ? 'text-gray-900' : 'text-gray-400'}`}>{sc.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {order.order_status === 'cancelled' && (
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-xl">
            <div className="w-2 h-2 rounded-full bg-red-400 shrink-0" />
            <p className="text-[13px] text-red-700">This order has been cancelled. Contact support if you have questions.</p>
          </div>
        )}

        {/* Tracking */}
        {order.tracking_number && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="text-[15px] font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Truck className="w-5 h-5 text-gray-400" /> Tracking
            </h2>
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex flex-wrap items-center gap-6">
                <div>
                  <p className="text-[11px] text-gray-400 uppercase tracking-wider mb-1">Tracking Number</p>
                  <div className="flex items-center gap-2">
                    <code className="text-sm font-mono font-semibold text-gray-900 bg-white px-3 py-1.5 rounded-lg border border-gray-200">{order.tracking_number}</code>
                    <button onClick={copyTracking} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-white transition-colors" aria-label="Copy tracking number">
                      {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                {order.shipping_carrier && <div><p className="text-[11px] text-gray-400 uppercase tracking-wider mb-1">Carrier</p><p className="text-sm font-medium text-gray-900">{order.shipping_carrier}</p></div>}
                {order.estimated_delivery && <div><p className="text-[11px] text-gray-400 uppercase tracking-wider mb-1">Est. Delivery</p><p className="text-sm font-medium text-gray-900">{fmtDate(order.estimated_delivery)}</p></div>}
              </div>
              {order.tracking_url && (
                <a href={order.tracking_url} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 bg-gray-900 text-white text-[13px] font-medium rounded-xl hover:bg-gray-800 transition-colors">
                  <ExternalLink className="w-3.5 h-3.5" /> Track Package
                </a>
              )}
            </div>
            {(order.shipped_at || order.delivered_at) && (
              <div className="mt-5 pt-5 border-t border-gray-50 space-y-3">
                {order.delivered_at && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0"><CheckCircle className="w-4 h-4 text-emerald-500" /></div>
                    <div><p className="text-sm font-medium text-gray-900">Delivered</p><p className="text-[12px] text-gray-400">{fmtDateTime(order.delivered_at)}</p></div>
                  </div>
                )}
                {order.shipped_at && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0"><Truck className="w-4 h-4 text-indigo-500" /></div>
                    <div><p className="text-sm font-medium text-gray-900">Shipped</p><p className="text-[12px] text-gray-400">{fmtDateTime(order.shipped_at)}</p></div>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0"><ShoppingBag className="w-4 h-4 text-blue-500" /></div>
                  <div><p className="text-sm font-medium text-gray-900">Order Placed</p><p className="text-[12px] text-gray-400">{fmtDateTime(order.created_at)}</p></div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Items */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="text-[15px] font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Box className="w-5 h-5 text-gray-400" /> Items ({items.length})
          </h2>
          <div className="divide-y divide-gray-50">
            {items.map((item, i) => (
              <div key={i} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
                <div className="relative w-16 h-16 shrink-0 bg-gray-50 rounded-xl overflow-hidden">
                  {item.product_image_url ? (
                    <Image src={item.product_image_url} alt={item.product_name} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"><Package className="w-6 h-6 text-gray-300" /></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 line-clamp-1">{item.product_name}</p>
                  <p className="text-[12px] text-gray-400 mt-0.5">Qty: {item.quantity} × £{Number(item.unit_price).toFixed(2)}</p>
                </div>
                <p className="text-sm font-semibold text-gray-900 shrink-0">£{Number(item.total_price).toFixed(2)}</p>
              </div>
            ))}
          </div>
          <div className="mt-5 pt-5 border-t border-gray-100 space-y-2">
            {order.subtotal && <div className="flex justify-between text-[13px]"><span className="text-gray-400">Subtotal</span><span className="text-gray-700">£{Number(order.subtotal).toFixed(2)}</span></div>}
            {order.shipping_cost !== undefined && <div className="flex justify-between text-[13px]"><span className="text-gray-400">Shipping</span><span className="text-gray-700">{Number(order.shipping_cost) === 0 ? 'Free' : `£${Number(order.shipping_cost).toFixed(2)}`}</span></div>}
            {order.tax_amount && <div className="flex justify-between text-[13px]"><span className="text-gray-400">Tax</span><span className="text-gray-700">£{Number(order.tax_amount).toFixed(2)}</span></div>}
            <div className="flex justify-between pt-3 border-t border-gray-100">
              <span className="text-sm font-semibold text-gray-900">Total</span>
              <span className="text-lg font-bold text-gray-900">£{Number(order.total_amount).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Address & Payment */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {addr && (
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h3 className="text-[13px] font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5"><MapPin className="w-4 h-4" /> Shipping Address</h3>
              <div className="text-[13px] text-gray-600 space-y-0.5 leading-relaxed">
                <p>{addr.address_line1}</p>
                {addr.address_line2 && <p>{addr.address_line2}</p>}
                <p>{addr.city}{addr.state && `, ${addr.state}`}</p>
                <p>{addr.postal_code}</p>
                <p>{addr.country}</p>
              </div>
            </div>
          )}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h3 className="text-[13px] font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5"><CreditCard className="w-4 h-4" /> Payment</h3>
            <div className="flex items-center justify-between">
              <span className="text-[13px] text-gray-500">Status</span>
              <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold capitalize ${
                order.payment_status === 'paid' ? 'bg-emerald-50 text-emerald-700' : order.payment_status === 'pending' ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'
              }`}>{order.payment_status}</span>
            </div>
          </div>
        </div>

        {/* Help */}
        <div className="flex items-center justify-between p-5 bg-white rounded-2xl border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center"><HelpCircle className="w-5 h-5 text-gray-400" /></div>
            <div>
              <p className="text-sm font-medium text-gray-900">Need help with this order?</p>
              <p className="text-[12px] text-gray-400">Our support team is here for you</p>
            </div>
          </div>
          <Link href="/contact" className="flex items-center gap-1 text-[13px] font-medium text-gray-500 hover:text-gray-900 transition-colors">
            Contact <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

      </main>
      <Footer />
    </div>
  );
}
