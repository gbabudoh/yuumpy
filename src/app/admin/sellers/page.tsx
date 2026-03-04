'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';

interface Seller {
  id: number;
  email: string;
  store_name: string;
  store_slug: string;
  business_name: string;
  status: string;
  is_verified: boolean;
  is_featured: boolean;
  commission_rate: string;
  total_sales: string;
  total_orders: number;
  average_rating: string;
  created_at: string;
}

export default function AdminSellersPage() {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [updating, setUpdating] = useState<number | null>(null);

  useEffect(() => { fetchSellers(); }, []);

  const fetchSellers = async () => {
    try {
      const res = await fetch('/api/admin/sellers');
      const data = await res.json();
      setSellers(data.sellers || []);
    } catch { } finally { setLoading(false); }
  };

  const updateSeller = async (id: number, updates: Record<string, unknown>) => {
    setUpdating(id);
    try {
      await fetch('/api/admin/sellers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates }),
      });
      await fetchSellers();
    } catch { } finally { setUpdating(null); }
  };

  const filteredSellers = filter === 'all' ? sellers : sellers.filter(s => s.status === filter);

  const statusCounts = {
    all: sellers.length,
    pending: sellers.filter(s => s.status === 'pending').length,
    approved: sellers.filter(s => s.status === 'approved').length,
    suspended: sellers.filter(s => s.status === 'suspended').length,
    rejected: sellers.filter(s => s.status === 'rejected').length,
  };

  return (
    <AdminLayout>
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Seller Management</h1>
          <p className="text-gray-500">Approve, manage, and monitor marketplace sellers</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {Object.entries(statusCounts).map(([key, count]) => (
          <button key={key} onClick={() => setFilter(key)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors capitalize ${
              filter === key ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}>
            {key} ({count})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      ) : filteredSellers.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <p className="text-gray-500">No sellers found.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left text-xs font-medium text-gray-500 uppercase p-4">Seller</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase p-4">Status</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase p-4">Commission</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase p-4">Sales</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase p-4">Rating</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase p-4">Joined</th>
                <th className="text-right text-xs font-medium text-gray-500 uppercase p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSellers.map(seller => (
                <tr key={seller.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="p-4">
                    <div>
                      <p className="font-medium text-gray-900">{seller.store_name}</p>
                      <p className="text-sm text-gray-500">{seller.email}</p>
                      {seller.business_name && <p className="text-xs text-gray-400">{seller.business_name}</p>}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${
                      seller.status === 'approved' ? 'bg-green-100 text-green-700' :
                      seller.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      seller.status === 'suspended' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>{seller.status}</span>
                    {seller.is_verified && <span className="ml-2 text-blue-500 text-xs">✓ Verified</span>}
                  </td>
                  <td className="p-4 text-sm text-gray-700">{seller.commission_rate}%</td>
                  <td className="p-4 text-sm text-gray-700">${parseFloat(seller.total_sales || '0').toFixed(2)}</td>
                  <td className="p-4 text-sm text-gray-700">{parseFloat(seller.average_rating || '0') > 0 ? `${parseFloat(seller.average_rating).toFixed(1)} ★` : 'N/A'}</td>
                  <td className="p-4 text-sm text-gray-500">{new Date(seller.created_at).toLocaleDateString()}</td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {seller.status === 'pending' && (
                        <>
                          <button disabled={updating === seller.id} onClick={() => updateSeller(seller.id, { status: 'approved' })}
                            className="px-3 py-1.5 text-xs font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50">
                            Approve
                          </button>
                          <button disabled={updating === seller.id} onClick={() => updateSeller(seller.id, { status: 'rejected' })}
                            className="px-3 py-1.5 text-xs font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50">
                            Reject
                          </button>
                        </>
                      )}
                      {seller.status === 'approved' && (
                        <button disabled={updating === seller.id} onClick={() => updateSeller(seller.id, { status: 'suspended' })}
                          className="px-3 py-1.5 text-xs font-medium bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50">
                          Suspend
                        </button>
                      )}
                      {seller.status === 'suspended' && (
                        <button disabled={updating === seller.id} onClick={() => updateSeller(seller.id, { status: 'approved' })}
                          className="px-3 py-1.5 text-xs font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50">
                          Reactivate
                        </button>
                      )}
                      <button disabled={updating === seller.id} onClick={() => updateSeller(seller.id, { is_verified: !seller.is_verified })}
                        className="px-3 py-1.5 text-xs font-medium bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 disabled:opacity-50">
                        {seller.is_verified ? 'Unverify' : 'Verify'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
    </AdminLayout>
  );
}
