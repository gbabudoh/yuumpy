'use client';

import { useState, useEffect } from 'react';
import { Percent, Save, Edit3, X, Trash2, ToggleLeft, ToggleRight, Store, TrendingUp, DollarSign } from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';

interface CommissionConfig {
  id: number;
  name: string;
  type: 'global' | 'category' | 'seller';
  target_id: number | null;
  rate: number;
  is_active: boolean;
}

interface SellerRate {
  id: number;
  store_name: string;
  store_slug: string;
  commission_rate: number;
  status: string;
  is_verified: boolean;
  total_sales: number;
  total_orders: number;
}

export default function CommissionPage() {
  const [configs, setConfigs] = useState<CommissionConfig[]>([]);
  const [sellers, setSellers] = useState<SellerRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSeller, setEditingSeller] = useState<number | null>(null);
  const [editRate, setEditRate] = useState('');
  const [globalRate, setGlobalRate] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/admin/commission');
      if (res.ok) {
        const data = await res.json();
        setConfigs(data.configs || []);
        setSellers(data.sellers || []);
        const global = (data.configs || []).find((c: CommissionConfig) => c.type === 'global');
        if (global) setGlobalRate(global.rate.toString());
      }
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const updateGlobalRate = async () => {
    const rate = Number(globalRate);
    if (isNaN(rate) || rate < 0 || rate > 100) { showMessage('error', 'Rate must be between 0 and 100'); return; }
    setSaving(true);
    try {
      const res = await fetch('/api/admin/commission', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_global', rate }),
      });
      if (res.ok) { showMessage('success', 'Global rate updated'); fetchData(); }
      else showMessage('error', 'Failed to update');
    } catch { showMessage('error', 'Failed to update'); }
    finally { setSaving(false); }
  };

  const updateSellerRate = async (sellerId: number) => {
    const rate = Number(editRate);
    if (isNaN(rate) || rate < 0 || rate > 100) { showMessage('error', 'Rate must be between 0 and 100'); return; }
    setSaving(true);
    try {
      const res = await fetch('/api/admin/commission', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_seller', seller_id: sellerId, rate }),
      });
      if (res.ok) { showMessage('success', 'Seller rate updated'); setEditingSeller(null); fetchData(); }
      else showMessage('error', 'Failed to update');
    } catch { showMessage('error', 'Failed to update'); }
    finally { setSaving(false); }
  };

  const toggleConfig = async (configId: number, active: boolean) => {
    await fetch('/api/admin/commission', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'toggle_config', config_id: configId, is_active: active }),
    });
    fetchData();
  };

  const deleteConfig = async (configId: number) => {
    if (!confirm('Delete this commission rule?')) return;
    await fetch('/api/admin/commission', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete_config', config_id: configId }),
    });
    fetchData();
  };

  // Stats
  const globalConfig = configs.find(c => c.type === 'global');
  const totalRevenue = sellers.reduce((sum, s) => sum + Number(s.total_sales || 0), 0);
  const estimatedCommission = sellers.reduce((sum, s) => sum + (Number(s.total_sales || 0) * Number(s.commission_rate || 0) / 100), 0);
  const activeSellers = sellers.filter(s => s.status === 'approved').length;

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-purple-600 rounded-full animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Commission Management</h1>
            <p className="text-gray-500 mt-1">Configure platform commission rates for sellers</p>
          </div>
        </div>

        {/* Toast */}
        {message && (
          <div className={`mb-6 p-4 rounded-xl text-sm font-medium ${
            message.type === 'success' ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'
          }`}>
            {message.text}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                <Percent className="w-5 h-5 text-purple-600" />
              </div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Global Rate</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">{globalConfig ? `${Number(globalConfig.rate)}%` : '—'}</p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                <Store className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Active Sellers</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">{activeSellers}</p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Total Seller Revenue</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">£{totalRevenue.toLocaleString('en-GB', { minimumFractionDigits: 2 })}</p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-amber-600" />
              </div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Est. Commission Earned</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">£{estimatedCommission.toLocaleString('en-GB', { minimumFractionDigits: 2 })}</p>
          </div>
        </div>

        {/* Global Rate Card */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mb-6">
          <div className="flex items-center gap-3 mb-1">
            <Percent className="w-5 h-5 text-purple-600" />
            <h2 className="text-lg font-bold text-gray-900">Global Platform Rate</h2>
          </div>
          <p className="text-sm text-gray-500 mb-5">Default commission applied to all sellers unless overridden per-seller</p>
          <div className="flex items-center gap-3">
            <div className="relative">
              <input
                type="number" value={globalRate} onChange={(e) => setGlobalRate(e.target.value)}
                min="0" max="100" step="0.5"
                className="w-28 px-4 py-2.5 border border-gray-300 rounded-xl text-gray-900 text-lg font-bold focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent pr-8"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">%</span>
            </div>
            <button onClick={updateGlobalRate} disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50">
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Update'}
            </button>
          </div>
        </div>

        {/* Commission Rules */}
        {configs.filter(c => c.type !== 'global').length > 0 && (
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Commission Rules</h2>
            <div className="space-y-3">
              {configs.filter(c => c.type !== 'global').map((config) => (
                <div key={config.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{config.name}</p>
                    <p className="text-xs text-gray-500 capitalize">{config.type} rule · {config.rate}%</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => toggleConfig(config.id, !config.is_active)}
                      className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors" title={config.is_active ? 'Deactivate' : 'Activate'}>
                      {config.is_active
                        ? <ToggleRight className="w-6 h-6 text-green-600" />
                        : <ToggleLeft className="w-6 h-6 text-gray-400" />}
                    </button>
                    <button onClick={() => deleteConfig(config.id)}
                      className="p-1.5 rounded-lg hover:bg-red-100 text-gray-400 hover:text-red-600 transition-colors" title="Delete">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Per-Seller Rates */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 pb-4">
            <h2 className="text-lg font-bold text-gray-900">Seller Commission Rates</h2>
            <p className="text-sm text-gray-500 mt-1">Override the global rate for individual sellers</p>
          </div>

          {sellers.length === 0 ? (
            <div className="p-12 text-center">
              <Store className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No sellers registered yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-t border-b border-gray-100 bg-gray-50">
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Seller</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Status</th>
                    <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Sales</th>
                    <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Orders</th>
                    <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Rate</th>
                    <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sellers.map((seller) => (
                    <tr key={seller.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold bg-gradient-to-br from-purple-500 to-indigo-600 shadow-sm">
                            {seller.store_name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{seller.store_name}</p>
                            <p className="text-xs text-gray-400">{seller.store_slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                          seller.status === 'approved' ? 'bg-green-100 text-green-700' :
                          seller.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          seller.status === 'suspended' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-600'
                        }`}>{seller.status}</span>
                        {seller.is_verified && <span className="ml-1.5 text-blue-500 text-xs font-medium">✓</span>}
                      </td>
                      <td className="px-6 py-4 text-right text-sm text-gray-700 font-medium">
                        £{Number(seller.total_sales || 0).toLocaleString('en-GB', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4 text-right text-sm text-gray-700">{seller.total_orders}</td>
                      <td className="px-6 py-4 text-right">
                        {editingSeller === seller.id ? (
                          <div className="flex items-center justify-end gap-1">
                            <input type="number" value={editRate} onChange={(e) => setEditRate(e.target.value)}
                              min="0" max="100" step="0.5" autoFocus
                              className="w-20 px-2 py-1.5 border border-purple-300 rounded-lg text-gray-900 text-sm text-right font-bold focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                            <span className="text-gray-400 text-sm font-medium">%</span>
                          </div>
                        ) : (
                          <span className="text-sm font-bold text-purple-600">{Number(seller.commission_rate)}%</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {editingSeller === seller.id ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button onClick={() => updateSellerRate(seller.id)} disabled={saving}
                              className="p-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50" title="Save">
                              <Save className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => setEditingSeller(null)}
                              className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition-colors" title="Cancel">
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <button onClick={() => { setEditingSeller(seller.id); setEditRate(seller.commission_rate.toString()); }}
                            className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900 rounded-lg transition-colors" title="Edit rate">
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
