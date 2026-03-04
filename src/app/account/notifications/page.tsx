'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Bell, Sparkles, Check, Trash2, Package, Gift, ShoppingBag, Truck,
  CheckCheck, ArrowLeft
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface Notification {
  id: number; type: 'order' | 'reward' | 'promotion' | 'system' | 'shipping';
  title: string; message: string; link_url?: string; is_read: number;
  order_id?: number; order_number?: string; created_at: string;
}

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [markingRead, setMarkingRead] = useState(false);

  useEffect(() => { checkAuth(); }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/customer/auth/me');
      if (!res.ok) { router.push('/account/login'); return; }
      fetchNotifications();
    } catch { router.push('/account/login'); }
  };

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/customer/notifications');
      if (res.ok) { const d = await res.json(); setNotifications(d.notifications||[]); setUnreadCount(d.unreadCount||0); }
    } catch {} finally { setLoading(false); }
  };

  const markAsRead = async (id: number) => {
    try {
      const res = await fetch('/api/customer/notifications', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ notificationIds: [id] }) });
      if (res.ok) { setNotifications(n => n.map(x => x.id === id ? { ...x, is_read: 1 } : x)); setUnreadCount(c => Math.max(0, c - 1)); }
    } catch {}
  };

  const markAllRead = async () => {
    setMarkingRead(true);
    try {
      const res = await fetch('/api/customer/notifications', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ markAllAsRead: true }) });
      if (res.ok) { setNotifications(n => n.map(x => ({ ...x, is_read: 1 }))); setUnreadCount(0); }
    } catch {} finally { setMarkingRead(false); }
  };

  const deleteOne = async (id: number) => {
    try {
      const res = await fetch(`/api/customer/notifications?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        const wasUnread = notifications.find(n => n.id === id)?.is_read === 0;
        setNotifications(n => n.filter(x => x.id !== id));
        if (wasUnread) setUnreadCount(c => Math.max(0, c - 1));
      }
    } catch {}
  };

  const deleteAllRead = async () => {
    try {
      const res = await fetch('/api/customer/notifications?delete_all_read=true', { method: 'DELETE' });
      if (res.ok) setNotifications(n => n.filter(x => x.is_read === 0));
    } catch {}
  };

  const fmtDate = (d: string) => {
    const diff = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
    if (diff < 1) return 'Just now';
    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff/60)}h ago`;
    const days = Math.floor(diff / 1440);
    if (days < 7) return `${days}d ago`;
    return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  };

  const typeIcon: Record<string, { icon: any; color: string; bg: string }> = {
    order:     { icon: Package,     color: 'text-blue-600',   bg: 'bg-blue-50' },
    shipping:  { icon: Truck,       color: 'text-indigo-600', bg: 'bg-indigo-50' },
    reward:    { icon: Gift,        color: 'text-amber-600',  bg: 'bg-amber-50' },
    promotion: { icon: ShoppingBag, color: 'text-violet-600', bg: 'bg-violet-50' },
    system:    { icon: Bell,        color: 'text-gray-600',   bg: 'bg-gray-50' },
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f8fa] flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-14 h-14 mx-auto">
            <div className="w-14 h-14 border-[3px] border-gray-200 rounded-full animate-spin border-t-gray-900" />
            <Sparkles className="w-5 h-5 text-gray-900 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="mt-4 text-gray-400 text-sm">Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f8fa]">
      <Header />
      <div className="bg-white border-b border-gray-100/80">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-5 sm:py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/account" className="p-2 -ml-2 rounded-xl hover:bg-gray-50 transition-colors" aria-label="Back to account">
                <ArrowLeft className="w-5 h-5 text-gray-400" />
              </Link>
              <div>
                <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 tracking-tight">Notifications</h1>
                <p className="text-[13px] text-gray-400 mt-0.5">{unreadCount} unread</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button onClick={markAllRead} disabled={markingRead}
                  className="flex items-center gap-1.5 px-3 py-2 text-[13px] font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-colors disabled:opacity-50">
                  <CheckCheck className="w-4 h-4" /> Mark all read
                </button>
              )}
              {notifications.some(n => n.is_read === 1) && (
                <button onClick={deleteAllRead}
                  className="flex items-center gap-1.5 px-3 py-2 text-[13px] font-medium text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors">
                  <Trash2 className="w-4 h-4" /> Clear read
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {notifications.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 px-6 py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-4">
              <Bell className="w-7 h-7 text-gray-300" />
            </div>
            <p className="text-sm font-medium text-gray-900 mb-1">All caught up</p>
            <p className="text-[13px] text-gray-400">We&apos;ll notify you about orders, rewards, and more</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((n) => {
              const t = typeIcon[n.type] || typeIcon.system;
              const Icon = t.icon;
              return (
                <div key={n.id} className={`bg-white rounded-xl border transition-all hover:shadow-md ${n.is_read === 0 ? 'border-gray-200 shadow-sm' : 'border-gray-100 opacity-80'}`}>
                  <div className="flex items-start gap-3.5 p-4 sm:p-5">
                    <div className={`w-9 h-9 rounded-lg ${t.bg} flex items-center justify-center shrink-0 mt-0.5`}>
                      <Icon className={`w-[18px] h-[18px] ${t.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <h3 className={`text-sm font-medium truncate ${n.is_read === 0 ? 'text-gray-900' : 'text-gray-600'}`}>{n.title}</h3>
                            {n.is_read === 0 && <span className="w-2 h-2 bg-blue-500 rounded-full shrink-0" />}
                          </div>
                          <p className="text-[13px] text-gray-500 leading-relaxed">{n.message}</p>
                          <div className="flex items-center gap-3 mt-2">
                            <span className="text-[12px] text-gray-400">{fmtDate(n.created_at)}</span>
                            {n.order_number && (
                              <Link href={n.link_url || `/account/orders/${n.order_number}`} className="text-[12px] text-blue-600 hover:text-blue-700 font-medium">
                                Order #{n.order_number} →
                              </Link>
                            )}
                            {n.link_url && !n.order_number && (
                              <Link href={n.link_url} className="text-[12px] text-blue-600 hover:text-blue-700 font-medium">View →</Link>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          {n.is_read === 0 && (
                            <button onClick={() => markAsRead(n.id)} className="p-1.5 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors" aria-label="Mark as read">
                              <Check className="w-4 h-4" />
                            </button>
                          )}
                          <button onClick={() => deleteOne(n.id)} className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors" aria-label="Delete">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
