'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Bell, Sparkles, User, LogOut, Settings, Check, Trash2, 
  Package, Gift, ShoppingBag, Truck, X, CheckCheck
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface Notification {
  id: number;
  type: 'order' | 'reward' | 'promotion' | 'system' | 'shipping';
  title: string;
  message: string;
  link_url?: string;
  is_read: number;
  order_id?: number;
  order_number?: string;
  created_at: string;
}

interface Customer {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
}

export default function NotificationsPage() {
  const router = useRouter();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [markingRead, setMarkingRead] = useState(false);

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
      fetchNotifications();
    } catch {
      router.push('/account/login');
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/customer/notifications');
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: number) => {
    try {
      const response = await fetch('/api/customer/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationIds: [notificationId] })
      });

      if (response.ok) {
        setNotifications(notifications.map(n => 
          n.id === notificationId ? { ...n, is_read: 1 } : n
        ));
        setUnreadCount(Math.max(0, unreadCount - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    setMarkingRead(true);
    try {
      const response = await fetch('/api/customer/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAllAsRead: true })
      });

      if (response.ok) {
        setNotifications(notifications.map(n => ({ ...n, is_read: 1 })));
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
    } finally {
      setMarkingRead(false);
    }
  };

  const handleDelete = async (notificationId: number) => {
    if (!confirm('Delete this notification?')) {
      return;
    }

    try {
      const response = await fetch(`/api/customer/notifications?id=${notificationId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        const wasUnread = notifications.find(n => n.id === notificationId)?.is_read === 0;
        setNotifications(notifications.filter(n => n.id !== notificationId));
        if (wasUnread) {
          setUnreadCount(Math.max(0, unreadCount - 1));
        }
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const handleDeleteAllRead = async () => {
    if (!confirm('Delete all read notifications?')) {
      return;
    }

    try {
      const response = await fetch('/api/customer/notifications?delete_all_read=true', {
        method: 'DELETE'
      });

      if (response.ok) {
        setNotifications(notifications.filter(n => n.is_read === 0));
      }
    } catch (error) {
      console.error('Error deleting read notifications:', error);
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
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order':
        return <Package className="w-5 h-5 text-blue-600" />;
      case 'shipping':
        return <Truck className="w-5 h-5 text-indigo-600" />;
      case 'reward':
        return <Gift className="w-5 h-5 text-amber-600" />;
      case 'promotion':
        return <ShoppingBag className="w-5 h-5 text-purple-600" />;
      default:
        return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  const getNotificationColor = (type: string, isRead: number) => {
    const baseColors: Record<string, string> = {
      order: 'bg-blue-50 border-blue-200',
      shipping: 'bg-indigo-50 border-indigo-200',
      reward: 'bg-amber-50 border-amber-200',
      promotion: 'bg-purple-50 border-purple-200',
      system: 'bg-gray-50 border-gray-200'
    };

    const color = baseColors[type] || baseColors.system;
    return isRead === 0 ? `${color} border-l-4` : `${color} opacity-75`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-spin border-t-blue-600 mx-auto"></div>
            <Sparkles className="w-6 h-6 text-blue-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="mt-4 text-gray-600 font-medium">Loading notifications...</p>
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
              <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center ring-4 ring-blue-400/30 relative">
                <Bell className="w-8 h-8 text-white" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </div>
              <div>
                <p className="text-gray-600 text-sm">Notifications</p>
                <h1 className="text-2xl md:text-3xl font-bold">
                  {customer?.firstName} {customer?.lastName}
                </h1>
                <p className="text-gray-500 text-sm">{customer?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
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
        {/* Actions Bar */}
        {notifications.length > 0 && (
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  disabled={markingRead}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CheckCheck className="w-4 h-4" />
                  {markingRead ? 'Marking...' : 'Mark All Read'}
                </button>
              )}
              {notifications.some(n => n.is_read === 1) && (
                <button
                  onClick={handleDeleteAllRead}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Read
                </button>
              )}
            </div>
            <p className="text-sm text-gray-600">
              {unreadCount} unread {unreadCount === 1 ? 'notification' : 'notifications'}
            </p>
          </div>
        )}

        {/* Notifications List */}
        {notifications.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No notifications</h3>
            <p className="text-gray-500">
              You're all caught up! We'll notify you about order updates, rewards, and more.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`bg-white rounded-xl border ${getNotificationColor(notification.type, notification.is_read)} p-6 transition-all hover:shadow-md`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className={`font-semibold ${notification.is_read === 0 ? 'text-gray-900' : 'text-gray-700'}`}>
                            {notification.title}
                          </h3>
                          {notification.is_read === 0 && (
                            <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                        <p className="text-xs text-gray-500">{formatDate(notification.created_at)}</p>
                        {notification.order_number && (
                          <Link
                            href={notification.link_url || `/account/orders/${notification.order_number}`}
                            className="text-xs text-blue-600 hover:text-blue-700 mt-2 inline-block"
                          >
                            View Order #{notification.order_number} →
                          </Link>
                        )}
                        {notification.link_url && !notification.order_number && (
                          <Link
                            href={notification.link_url}
                            className="text-xs text-blue-600 hover:text-blue-700 mt-2 inline-block"
                          >
                            View Details →
                          </Link>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {notification.is_read === 0 && (
                          <button
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                            title="Mark as read"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(notification.id)}
                          className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
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

