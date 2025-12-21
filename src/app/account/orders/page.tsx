'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Package, Truck, CheckCircle, Clock, XCircle, LogOut, User, ChevronRight } from 'lucide-react';
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

const statusConfig: Record<string, { icon: any; color: string; bgColor: string }> = {
  pending: { icon: Clock, color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
  confirmed: { icon: CheckCircle, color: 'text-blue-600', bgColor: 'bg-blue-100' },
  processing: { icon: Package, color: 'text-purple-600', bgColor: 'bg-purple-100' },
  shipped: { icon: Truck, color: 'text-indigo-600', bgColor: 'bg-indigo-100' },
  delivered: { icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-100' },
  cancelled: { icon: XCircle, color: 'text-red-600', bgColor: 'bg-red-100' }
};

export default function CustomerOrdersPage() {
  const router = useRouter();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

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
        // Parse items if they're strings
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              {/* Customer Info */}
              <div className="flex items-center space-x-3 pb-4 border-b border-gray-200">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    {customer?.firstName} {customer?.lastName}
                  </p>
                  <p className="text-sm text-gray-500">{customer?.email}</p>
                </div>
              </div>

              {/* Navigation */}
              <nav className="mt-4 space-y-1">
                <Link
                  href="/account/orders"
                  className="flex items-center justify-between px-3 py-2 rounded-lg bg-green-50 text-green-700 font-medium"
                >
                  <span className="flex items-center">
                    <Package className="w-5 h-5 mr-2" />
                    My Orders
                  </span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </nav>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="mt-6 w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">My Orders</h1>

            {orders.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-900 mb-2">No orders yet</h2>
                <p className="text-gray-500 mb-6">
                  When you make a purchase, your orders will appear here.
                </p>
                <Link
                  href="/"
                  className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                >
                  Start Shopping
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => {
                  const status = statusConfig[order.order_status] || statusConfig.pending;
                  const StatusIcon = status.icon;
                  const items = Array.isArray(order.items) ? order.items : [];

                  return (
                    <div key={order.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                      {/* Order Header */}
                      <div className="px-6 py-4 border-b border-gray-200 flex flex-wrap items-center justify-between gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Order Number</p>
                          <p className="font-semibold text-gray-900">{order.order_number}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Date</p>
                          <p className="font-medium text-gray-900">{formatDate(order.created_at)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Total</p>
                          <p className="font-semibold text-gray-900">£{Number(order.total_amount).toFixed(2)}</p>
                        </div>
                        <div className={`flex items-center px-3 py-1 rounded-full ${status.bgColor}`}>
                          <StatusIcon className={`w-4 h-4 mr-1 ${status.color}`} />
                          <span className={`text-sm font-medium capitalize ${status.color}`}>
                            {order.order_status}
                          </span>
                        </div>
                      </div>

                      {/* Order Items */}
                      <div className="px-6 py-4">
                        {items.map((item, index) => (
                          <div key={index} className="flex items-center space-x-4 py-3 border-b border-gray-100 last:border-0">
                            <div className="relative w-16 h-16 flex-shrink-0">
                              {item.product_image_url ? (
                                <Image
                                  src={item.product_image_url}
                                  alt={item.product_name}
                                  fill
                                  className="object-cover rounded-lg"
                                />
                              ) : (
                                <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">
                                  <Package className="w-6 h-6 text-gray-400" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <Link
                                href={`/products/${item.product_slug}`}
                                className="font-medium text-gray-900 hover:text-green-600 line-clamp-1"
                              >
                                {item.product_name}
                              </Link>
                              <p className="text-sm text-gray-500">
                                Qty: {item.quantity} × £{Number(item.unit_price).toFixed(2)}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium text-gray-900">
                                £{Number(item.total_price).toFixed(2)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Tracking Info */}
                      {order.tracking_number && (
                        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center text-sm">
                              <Truck className="w-4 h-4 text-gray-500 mr-2" />
                              <span className="text-gray-600">Tracking: </span>
                              <span className="font-medium text-gray-900 ml-1">{order.tracking_number}</span>
                            </div>
                            {order.tracking_url && (
                              <a
                                href={order.tracking_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-green-600 hover:text-green-700 font-medium"
                              >
                                Track Package
                              </a>
                            )}
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
      </div>

      <Footer />
    </div>
  );
}
