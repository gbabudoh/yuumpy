'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Package, Mail, ArrowRight } from 'lucide-react';

interface OrderItem {
  id: number;
  product_id: number;
  product_name: string;
  product_slug: string;
  product_image_url: string;
  quantity: number;
  unit_price: string | number;
  total_price: string | number;
}

interface Order {
  id: number;
  order_number: string;
  total_amount: string | number;
  order_status: string;
  customer_first_name: string;
  customer_last_name: string;
  customer_email: string;
  shipping_address_line1: string;
  shipping_address_line2?: string;
  shipping_city: string;
  shipping_county?: string;
  shipping_postcode: string;
  shipping_country: string;
  items?: OrderItem[];
}

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('order');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        // Update payment status to paid since customer reached success page
        await fetch(`/api/orders/${orderNumber}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ payment_status: 'paid', order_status: 'confirmed' })
        });

        const response = await fetch(`/api/orders/${orderNumber}`);
        if (response.ok) {
          const data = await response.json();
          setOrder(data);
        }
      } catch (error) {
        console.error('Error fetching order:', error);
      } finally {
        setLoading(false);
      }
    };

    if (orderNumber) {
      fetchOrder();
    } else {
      setLoading(false);
    }
  }, [orderNumber]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          {/* Success Icon */}
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Order Confirmed!
          </h1>
          <p className="text-gray-600 mb-6">
            Thank you for your purchase. Your order has been received.
          </p>

          {/* Order Number */}
          {orderNumber && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-500 mb-1">Order Number</p>
              <p className="text-lg font-semibold text-gray-900">{orderNumber}</p>
            </div>
          )}

          {/* Order Details */}
          {order && (
            <div className="text-left border-t border-gray-200 pt-6 mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Order Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Total</span>
                  <span className="font-medium">£{Number(order.total_amount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Status</span>
                  <span className="font-medium capitalize">{order.order_status}</span>
                </div>
              </div>
            </div>
          )}

          {/* Info Cards */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg text-left">
              <Mail className="w-5 h-5 text-blue-600 flex-shrink-0" />
              <p className="text-sm text-blue-800">
                A confirmation email has been sent to your email address.
              </p>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg text-left">
              <Package className="w-5 h-5 text-green-600 flex-shrink-0" />
              <p className="text-sm text-green-800">
                We&apos;ll notify you when your order ships.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Link
              href="/account/orders"
              className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold transition-colors hover:bg-green-700 flex items-center justify-center space-x-2"
            >
              <span>Track Your Order</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/"
              className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-semibold transition-colors hover:bg-gray-200 block"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
