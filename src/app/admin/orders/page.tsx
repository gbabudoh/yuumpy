'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Package, Search, Filter, Eye, Truck, CheckCircle, Clock, XCircle, ChevronDown } from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';

interface OrderItem {
  id: number;
  product_id: number;
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
  customer_email: string;
  customer_first_name: string;
  customer_last_name: string;
  customer_phone: string;
  shipping_address_line1: string;
  shipping_address_line2: string;
  shipping_city: string;
  shipping_county: string;
  shipping_postcode: string;
  shipping_country: string;
  subtotal: number;
  shipping_cost: number;
  tax_amount: number;
  total_amount: number;
  currency: string;
  payment_status: string;
  order_status: string;
  tracking_number: string;
  tracking_url: string;
  customer_notes: string;
  admin_notes: string;
  created_at: string;
  items: OrderItem[] | string;
}

const statusConfig: Record<string, { icon: any; color: string; bgColor: string }> = {
  pending: { icon: Clock, color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
  confirmed: { icon: CheckCircle, color: 'text-blue-600', bgColor: 'bg-blue-100' },
  processing: { icon: Package, color: 'text-purple-600', bgColor: 'bg-purple-100' },
  shipped: { icon: Truck, color: 'text-indigo-600', bgColor: 'bg-indigo-100' },
  delivered: { icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-100' },
  cancelled: { icon: XCircle, color: 'text-red-600', bgColor: 'bg-red-100' }
};

const paymentStatusConfig: Record<string, { color: string; bgColor: string }> = {
  pending: { color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
  paid: { color: 'text-green-600', bgColor: 'bg-green-100' },
  failed: { color: 'text-red-600', bgColor: 'bg-red-100' },
  refunded: { color: 'text-gray-600', bgColor: 'bg-gray-100' }
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [updating, setUpdating] = useState(false);

  const [editForm, setEditForm] = useState({
    order_status: '',
    tracking_number: '',
    tracking_url: '',
    admin_notes: ''
  });

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, paymentFilter]);

  const fetchOrders = async () => {
    try {
      let url = '/api/admin/orders?';
      if (statusFilter) url += `status=${statusFilter}&`;
      if (paymentFilter) url += `payment_status=${paymentFilter}&`;
      if (searchTerm) url += `search=${encodeURIComponent(searchTerm)}&`;

      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrders();
  };

  const openOrderModal = (order: Order) => {
    setSelectedOrder(order);
    setEditForm({
      order_status: order.order_status,
      tracking_number: order.tracking_number || '',
      tracking_url: order.tracking_url || '',
      admin_notes: order.admin_notes || ''
    });
    setShowModal(true);
  };

  const handleUpdateOrder = async () => {
    if (!selectedOrder) return;

    setUpdating(true);
    try {
      const response = await fetch(`/api/admin/orders/${selectedOrder.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      });

      if (response.ok) {
        alert('Order updated successfully');
        setShowModal(false);
        fetchOrders();
      } else {
        alert('Failed to update order');
      }
    } catch (error) {
      console.error('Error updating order:', error);
      alert('Error updating order');
    } finally {
      setUpdating(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <AdminLayout>
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
            <p className="text-gray-600 mt-2">Manage customer orders</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">All Payments</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </button>
          </form>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Order</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Customer</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Total</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Payment</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Date</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-32"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-16"></div></td>
                      <td className="px-6 py-4"><div className="h-6 bg-gray-200 rounded w-16"></div></td>
                      <td className="px-6 py-4"><div className="h-6 bg-gray-200 rounded w-20"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                      <td className="px-6 py-4"><div className="h-8 bg-gray-200 rounded w-8"></div></td>
                    </tr>
                  ))
                ) : orders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">No orders found</p>
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => {
                    const status = statusConfig[order.order_status] || statusConfig.pending;
                    const payment = paymentStatusConfig[order.payment_status] || paymentStatusConfig.pending;
                    const StatusIcon = status.icon;

                    return (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <p className="font-medium text-gray-900">{order.order_number}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-gray-900">{order.customer_first_name} {order.customer_last_name}</p>
                          <p className="text-sm text-gray-500">{order.customer_email}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-medium text-gray-900">£{Number(order.total_amount).toFixed(2)}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${payment.bgColor} ${payment.color}`}>
                            {order.payment_status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize ${status.bgColor} ${status.color}`}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {order.order_status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {formatDate(order.created_at)}
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => openOrderModal(order)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Order Detail Modal */}
        {showModal && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Order {selectedOrder.order_number}
                  </h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>

                {/* Customer Info */}
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Customer</h3>
                    <p className="text-gray-600">{selectedOrder.customer_first_name} {selectedOrder.customer_last_name}</p>
                    <p className="text-gray-600">{selectedOrder.customer_email}</p>
                    {selectedOrder.customer_phone && (
                      <p className="text-gray-600">{selectedOrder.customer_phone}</p>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Shipping Address</h3>
                    <p className="text-gray-600">{selectedOrder.shipping_address_line1}</p>
                    {selectedOrder.shipping_address_line2 && (
                      <p className="text-gray-600">{selectedOrder.shipping_address_line2}</p>
                    )}
                    <p className="text-gray-600">
                      {selectedOrder.shipping_city}, {selectedOrder.shipping_county} {selectedOrder.shipping_postcode}
                    </p>
                    <p className="text-gray-600">{selectedOrder.shipping_country}</p>
                  </div>
                </div>

                {/* Order Items */}
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Items</h3>
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    {(Array.isArray(selectedOrder.items) ? selectedOrder.items : []).map((item, index) => (
                      <div key={index} className="flex items-center p-3 border-b border-gray-200 last:border-0">
                        <div className="relative w-12 h-12 flex-shrink-0 mr-3">
                          {item.product_image_url ? (
                            <Image
                              src={item.product_image_url}
                              alt={item.product_name}
                              fill
                              className="object-cover rounded"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-200 rounded flex items-center justify-center">
                              <Package className="w-5 h-5 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{item.product_name}</p>
                          <p className="text-sm text-gray-500">Qty: {item.quantity} × £{Number(item.unit_price).toFixed(2)}</p>
                        </div>
                        <p className="font-medium text-gray-900">£{Number(item.total_price).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Totals */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="text-gray-900">£{Number(selectedOrder.subtotal).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Shipping</span>
                    <span className="text-gray-900">£{Number(selectedOrder.shipping_cost).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-lg border-t border-gray-200 pt-2 mt-2">
                    <span>Total</span>
                    <span>£{Number(selectedOrder.total_amount).toFixed(2)}</span>
                  </div>
                </div>

                {/* Customer Notes */}
                {selectedOrder.customer_notes && (
                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-900 mb-2">Customer Notes</h3>
                    <p className="text-gray-600 bg-yellow-50 p-3 rounded-lg">{selectedOrder.customer_notes}</p>
                  </div>
                )}

                {/* Update Form */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Update Order</h3>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Order Status</label>
                      <select
                        value={editForm.order_status}
                        onChange={(e) => setEditForm({ ...editForm, order_status: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tracking Number</label>
                      <input
                        type="text"
                        value={editForm.tracking_number}
                        onChange={(e) => setEditForm({ ...editForm, tracking_number: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        placeholder="Enter tracking number"
                      />
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tracking URL</label>
                    <input
                      type="url"
                      value={editForm.tracking_url}
                      onChange={(e) => setEditForm({ ...editForm, tracking_url: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      placeholder="https://tracking.example.com/..."
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Admin Notes</label>
                    <textarea
                      value={editForm.admin_notes}
                      onChange={(e) => setEditForm({ ...editForm, admin_notes: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      placeholder="Internal notes..."
                    />
                  </div>
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => setShowModal(false)}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleUpdateOrder}
                      disabled={updating}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400"
                    >
                      {updating ? 'Updating...' : 'Update Order'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
