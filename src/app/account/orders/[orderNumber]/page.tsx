'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Package, Truck, CheckCircle, Clock, XCircle, LogOut, User, 
  ChevronRight, ArrowLeft, MapPin, CreditCard, Calendar,
  Box, ShoppingBag, ExternalLink, Copy, Check
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

interface ShippingAddress {
  address_line1: string;
  address_line2?: string;
  city: string;
  state?: string;
  postal_code: string;
  country: string;
}

interface Order {
  id: number;
  order_number: string;
  total_amount: number;
  subtotal?: number;
  shipping_cost?: number;
  tax_amount?: number;
  currency: string;
  payment_status: string;
  order_status: string;
  tracking_number?: string;
  tracking_url?: string;
  shipping_carrier?: string;
  estimated_delivery?: string;
  created_at: string;
  updated_at?: string;
  shipped_at?: string;
  delivered_at?: string;
  items: OrderItem[] | string;
  shipping_address?: ShippingAddress | string;
}

interface Customer {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
}

const statusConfig: Record<string, { icon: any; color: string; bgColor: string; label: string }> = {
  pending: { icon: Clock, color: 'text-yellow-600', bgColor: 'bg-yellow-100', label: 'Order Placed' },
  confirmed: { icon: CheckCircle, color: 'text-blue-600', bgColor: 'bg-blue-100', label: 'Confirmed' },
  processing: { icon: Package, color: 'text-purple-600', bgColor: 'bg-purple-100', label: 'Processing' },
  shipped: { icon: Truck, color: 'text-indigo-600', bgColor: 'bg-indigo-100', label: 'Shipped' },
  delivered: { icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-100', label: 'Delivered' },
  cancelled: { icon: XCircle, color: 'text-red-600', bgColor: 'bg-red-100', label: 'Cancelled' }
};

const orderSteps = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];

export default function OrderDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const orderNumber = params.orderNumber as string;
  
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

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
      fetchOrder();
    } catch {
      router.push('/account/login');
    }
  };

  const fetchOrder = async () => {
    try {
      const response = await fetch(`/api/customer/orders/${orderNumber}`);
      if (response.ok) {
        const data = await response.json();
        const parsedOrder = {
          ...data.order,
          items: typeof data.order.items === 'string' ? JSON.parse(data.order.items) : (data.order.items || []),
          shipping_address: typeof data.order.shipping_address === 'string' 
            ? JSON.parse(data.order.shipping_address) 
            : data.order.shipping_address
        };
        setOrder(parsedOrder);
      } else {
        router.push('/account/orders');
      }
    } catch (error) {
      console.error('Error fetching order:', error);
      router.push('/account/orders');
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
      month: 'long',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const copyTrackingNumber = () => {
    if (order?.tracking_number) {
      navigator.clipboard.writeText(order.tracking_number);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getCurrentStepIndex = () => {
    if (!order) return 0;
    if (order.order_status === 'cancelled') return -1;
    return orderSteps.indexOf(order.order_status);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Order not found</h2>
          <Link href="/account/orders" className="text-green-600 hover:text-green-700 font-medium">
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  const status = statusConfig[order.order_status] || statusConfig.pending;
  const StatusIcon = status.icon;
  const items = Array.isArray(order.items) ? order.items : [];
  const currentStepIndex = getCurrentStepIndex();
  const shippingAddress = order.shipping_address as ShippingAddress | undefined;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
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
          <div className="lg:col-span-3 space-y-6">
            {/* Back Button & Header */}
            <div className="flex items-center justify-between">
              <Link 
                href="/account/orders"
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Orders
              </Link>
              <div className={`flex items-center px-4 py-2 rounded-full ${status.bgColor}`}>
                <StatusIcon className={`w-5 h-5 mr-2 ${status.color}`} />
                <span className={`font-semibold ${status.color}`}>
                  {status.label}
                </span>
              </div>
            </div>

            {/* Order Header Card */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-1">
                    Order #{order.order_number}
                  </h1>
                  <p className="text-gray-500 flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    Placed on {formatDate(order.created_at)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Total Amount</p>
                  <p className="text-2xl font-bold text-gray-900">
                    £{Number(order.total_amount).toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Order Progress Timeline */}
              {order.order_status !== 'cancelled' && (
                <div className="mt-8">
                  <h3 className="text-sm font-semibold text-gray-700 mb-4">Order Progress</h3>
                  <div className="relative">
                    {/* Progress Line */}
                    <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200 rounded-full">
                      <div 
                        className="h-full bg-green-500 rounded-full transition-all duration-500"
                        style={{ width: `${(currentStepIndex / (orderSteps.length - 1)) * 100}%` }}
                      />
                    </div>
                    
                    {/* Steps */}
                    <div className="relative flex justify-between">
                      {orderSteps.map((step, index) => {
                        const stepConfig = statusConfig[step];
                        const StepIcon = stepConfig.icon;
                        const isCompleted = index <= currentStepIndex;
                        const isCurrent = index === currentStepIndex;
                        
                        return (
                          <div key={step} className="flex flex-col items-center">
                            <div 
                              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                                isCompleted 
                                  ? 'bg-green-500 text-white' 
                                  : 'bg-gray-200 text-gray-400'
                              } ${isCurrent ? 'ring-4 ring-green-200' : ''}`}
                            >
                              <StepIcon className="w-5 h-5" />
                            </div>
                            <span className={`mt-2 text-xs font-medium ${
                              isCompleted ? 'text-green-600' : 'text-gray-400'
                            }`}>
                              {stepConfig.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Cancelled Order Message */}
              {order.order_status === 'cancelled' && (
                <div className="mt-6 p-4 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex items-center">
                    <XCircle className="w-5 h-5 text-red-600 mr-3" />
                    <div>
                      <p className="font-semibold text-red-800">Order Cancelled</p>
                      <p className="text-sm text-red-600">
                        This order has been cancelled. If you have any questions, please contact support.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Tracking Information */}
            {order.tracking_number && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Truck className="w-5 h-5 mr-2 text-green-600" />
                  Tracking Information
                </h2>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Tracking Number</p>
                      <div className="flex items-center gap-2">
                        <code className="text-lg font-mono font-semibold text-gray-900 bg-white px-3 py-1 rounded border">
                          {order.tracking_number}
                        </code>
                        <button
                          onClick={copyTrackingNumber}
                          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Copy tracking number"
                        >
                          {copied ? (
                            <Check className="w-5 h-5 text-green-600" />
                          ) : (
                            <Copy className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>
                    
                    {order.shipping_carrier && (
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Carrier</p>
                        <p className="font-semibold text-gray-900">{order.shipping_carrier}</p>
                      </div>
                    )}
                    
                    {order.estimated_delivery && (
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Estimated Delivery</p>
                        <p className="font-semibold text-gray-900">{formatDate(order.estimated_delivery)}</p>
                      </div>
                    )}
                  </div>
                  
                  {order.tracking_url && (
                    <a
                      href={order.tracking_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Track on Carrier Website
                    </a>
                  )}
                </div>

                {/* Shipping Timeline */}
                {(order.shipped_at || order.delivered_at) && (
                  <div className="mt-6 border-t pt-6">
                    <h3 className="text-sm font-semibold text-gray-700 mb-4">Shipping Updates</h3>
                    <div className="space-y-4">
                      {order.delivered_at && (
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">Delivered</p>
                            <p className="text-sm text-gray-500">{formatDateTime(order.delivered_at)}</p>
                          </div>
                        </div>
                      )}
                      {order.shipped_at && (
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <Truck className="w-4 h-4 text-indigo-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">Shipped</p>
                            <p className="text-sm text-gray-500">{formatDateTime(order.shipped_at)}</p>
                          </div>
                        </div>
                      )}
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <ShoppingBag className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Order Placed</p>
                          <p className="text-sm text-gray-500">{formatDateTime(order.created_at)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Order Items */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Box className="w-5 h-5 mr-2 text-green-600" />
                Order Items ({items.length})
              </h2>
              
              <div className="divide-y divide-gray-100">
                {items.map((item, index) => (
                  <div key={index} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
                    <div className="relative w-20 h-20 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                      {item.product_image_url ? (
                        <Image
                          src={item.product_image_url}
                          alt={item.product_name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 line-clamp-2">
                        {item.product_name}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        Quantity: {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        £{Number(item.total_price).toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-500">
                        £{Number(item.unit_price).toFixed(2)} each
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="space-y-2">
                  {order.subtotal && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Subtotal</span>
                      <span className="text-gray-900">£{Number(order.subtotal).toFixed(2)}</span>
                    </div>
                  )}
                  {order.shipping_cost !== undefined && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Shipping</span>
                      <span className="text-gray-900">
                        {Number(order.shipping_cost) === 0 ? 'Free' : `£${Number(order.shipping_cost).toFixed(2)}`}
                      </span>
                    </div>
                  )}
                  {order.tax_amount && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Tax</span>
                      <span className="text-gray-900">£{Number(order.tax_amount).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 border-t border-gray-200">
                    <span className="font-semibold text-gray-900">Total</span>
                    <span className="font-bold text-lg text-gray-900">
                      £{Number(order.total_amount).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            {shippingAddress && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-green-600" />
                  Shipping Address
                </h2>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-900">{shippingAddress.address_line1}</p>
                  {shippingAddress.address_line2 && (
                    <p className="text-gray-900">{shippingAddress.address_line2}</p>
                  )}
                  <p className="text-gray-900">
                    {shippingAddress.city}
                    {shippingAddress.state && `, ${shippingAddress.state}`}
                  </p>
                  <p className="text-gray-900">{shippingAddress.postal_code}</p>
                  <p className="text-gray-900">{shippingAddress.country}</p>
                </div>
              </div>
            )}

            {/* Payment Information */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <CreditCard className="w-5 h-5 mr-2 text-green-600" />
                Payment Information
              </h2>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Payment Status</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    order.payment_status === 'paid' 
                      ? 'bg-green-100 text-green-700'
                      : order.payment_status === 'pending'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                  </span>
                </div>
              </div>
            </div>

            {/* Need Help */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
              <h3 className="font-semibold text-gray-900 mb-2">Need Help?</h3>
              <p className="text-gray-600 text-sm mb-4">
                If you have any questions about your order, our support team is here to help.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center text-green-600 hover:text-green-700 font-medium text-sm"
              >
                Contact Support
                <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
