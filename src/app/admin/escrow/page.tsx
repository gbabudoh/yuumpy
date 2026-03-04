'use client';

import { useState, useEffect } from 'react';
import { Shield, Clock, CheckCircle, AlertTriangle, RefreshCw, FileText, X, ArrowUpRight, Banknote, Lock } from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';

interface EscrowTransaction {
  id: number;
  order_id: number;
  seller_id: number;
  total_amount: number;
  commission_amount: number;
  seller_payout_amount: number;
  status: string;
  hold_until: string | null;
  released_at: string | null;
  refunded_at: string | null;
  stripe_transfer_id: string | null;
  admin_notes: string | null;
  created_at: string;
  store_name: string;
  seller_email: string;
  order_number: string;
  order_status: string;
}

interface EscrowStats {
  held: number;
  released: number;
  refunded: number;
  disputed: number;
  total_held_amount: number;
  total_released_amount: number;
}

export default function EscrowPage() {
  const [transactions, setTransactions] = useState<EscrowTransaction[]>([]);
  const [stats, setStats] = useState<EscrowStats>({ held: 0, released: 0, refunded: 0, disputed: 0, total_held_amount: 0, total_released_amount: 0 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [actionModal, setActionModal] = useState<{ escrow: EscrowTransaction; action: string } | null>(null);
  const [notes, setNotes] = useState('');
  const [holdDays, setHoldDays] = useState('7');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/admin/escrow?status=${filter}`);
      if (res.ok) {
        const data = await res.json();
        setTransactions(data.transactions || []);
        setStats(data.stats || stats);
      }
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [filter]);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  const performAction = async () => {
    if (!actionModal) return;
    setSaving(true);
    try {
      const res = await fetch('/api/admin/escrow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: actionModal.action,
          escrow_id: actionModal.escrow.id,
          notes,
          hold_days: holdDays,
        }),
      });
      if (res.ok) {
        showMessage('success', `Escrow ${actionModal.action.replace('_', ' ')} successful`);
        setActionModal(null);
        setNotes('');
        fetchData();
      } else {
        const data = await res.json();
        showMessage('error', data.error || 'Action failed');
      }
    } catch { showMessage('error', 'Action failed'); }
    finally { setSaving(false); }
  };

  const fmt = (d: string | null) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const statusBadge = (s: string) => {
    switch (s) {
      case 'held': return 'bg-amber-100 text-amber-700';
      case 'released': return 'bg-green-100 text-green-700';
      case 'refunded': case 'partially_refunded': return 'bg-blue-100 text-blue-700';
      case 'disputed': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const totalHeld = stats.total_held_amount || 0;
  const totalReleased = stats.total_released_amount || 0;

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
            <h1 className="text-2xl font-bold text-gray-900">Escrow Management</h1>
            <p className="text-gray-500 mt-1">Monitor and manage escrow-protected transactions</p>
          </div>
          <button onClick={() => { setLoading(true); fetchData(); }}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-xl transition-colors">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
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
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                <Lock className="w-5 h-5 text-amber-600" />
              </div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Held</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.held}</p>
            <p className="text-sm text-gray-500 mt-1">£{totalHeld.toLocaleString('en-GB', { minimumFractionDigits: 2 })}</p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Released</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.released}</p>
            <p className="text-sm text-gray-500 mt-1">£{totalReleased.toLocaleString('en-GB', { minimumFractionDigits: 2 })}</p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <Banknote className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Refunded</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.refunded}</p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Disputed</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.disputed}</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {['all', 'held', 'released', 'refunded', 'disputed'].map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                filter === f ? 'bg-purple-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}>
              {f}
            </button>
          ))}
        </div>

        {/* Transactions Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {transactions.length === 0 ? (
            <div className="p-16 text-center">
              <Shield className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No escrow transactions found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Order</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Seller</th>
                    <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Total</th>
                    <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Commission</th>
                    <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Payout</th>
                    <th className="text-center text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Status</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Hold Until</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Created</th>
                    <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="text-sm font-semibold text-gray-900">#{tx.order_number || tx.order_id}</p>
                        <p className="text-[11px] text-gray-400 capitalize">{tx.order_status || '—'}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-gray-900">{tx.store_name || '—'}</p>
                        <p className="text-[11px] text-gray-400">{tx.seller_email || ''}</p>
                      </td>
                      <td className="px-6 py-4 text-right text-sm text-gray-700 font-medium">£{Number(tx.total_amount).toFixed(2)}</td>
                      <td className="px-6 py-4 text-right text-sm text-red-600 font-medium">−£{Number(tx.commission_amount).toFixed(2)}</td>
                      <td className="px-6 py-4 text-right text-sm text-green-600 font-bold">£{Number(tx.seller_payout_amount).toFixed(2)}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${statusBadge(tx.status)}`}>
                          {tx.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-gray-400" />
                          <span className="text-sm text-gray-600">{fmt(tx.hold_until)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{fmt(tx.created_at)}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {tx.status === 'held' && (
                            <>
                              <button onClick={() => { setActionModal({ escrow: tx, action: 'release' }); setNotes(''); }}
                                className="px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 transition-colors">
                                <ArrowUpRight className="w-3 h-3 inline mr-1" />Release
                              </button>
                              <button onClick={() => { setActionModal({ escrow: tx, action: 'refund' }); setNotes(''); }}
                                className="px-3 py-1.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-lg hover:bg-blue-200 transition-colors">
                                Refund
                              </button>
                              <button onClick={() => { setActionModal({ escrow: tx, action: 'hold' }); setNotes(''); setHoldDays('7'); }}
                                className="px-3 py-1.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-lg hover:bg-amber-200 transition-colors">
                                Extend
                              </button>
                            </>
                          )}
                          <button onClick={() => { setActionModal({ escrow: tx, action: 'add_note' }); setNotes(''); }}
                            className="p-1.5 bg-gray-100 text-gray-500 rounded-lg hover:bg-gray-200 hover:text-gray-700 transition-colors" title="Add note">
                            <FileText className="w-3.5 h-3.5" />
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
      </div>

      {/* Action Modal */}
      {actionModal && (
        <>
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" onClick={() => setActionModal(null)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 capitalize">{actionModal.action.replace('_', ' ')} Escrow</h3>
              <button onClick={() => setActionModal(null)} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="p-3 bg-gray-50 rounded-xl mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Order</span>
                <span className="font-semibold text-gray-900">#{actionModal.escrow.order_number || actionModal.escrow.order_id}</span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-gray-500">Seller</span>
                <span className="font-medium text-gray-700">{actionModal.escrow.store_name}</span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-gray-500">Payout Amount</span>
                <span className="font-bold text-green-600">£{Number(actionModal.escrow.seller_payout_amount).toFixed(2)}</span>
              </div>
            </div>

            {actionModal.action === 'hold' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Extend hold by (days)</label>
                <input type="number" value={holdDays} onChange={(e) => setHoldDays(e.target.value)}
                  min="1" max="90"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
              </div>
            )}

            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Notes {actionModal.action === 'add_note' ? '*' : '(optional)'}</label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3}
                placeholder="Add a note..."
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none" />
            </div>

            <div className="flex gap-3">
              <button onClick={performAction} disabled={saving || (actionModal.action === 'add_note' && !notes.trim())}
                className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-colors disabled:opacity-50 ${
                  actionModal.action === 'release' ? 'bg-green-600 hover:bg-green-700 text-white' :
                  actionModal.action === 'refund' ? 'bg-blue-600 hover:bg-blue-700 text-white' :
                  actionModal.action === 'hold' ? 'bg-amber-600 hover:bg-amber-700 text-white' :
                  'bg-purple-600 hover:bg-purple-700 text-white'
                }`}>
                {saving ? 'Processing...' : 'Confirm'}
              </button>
              <button onClick={() => setActionModal(null)}
                className="flex-1 py-2.5 text-sm font-medium bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  );
}
