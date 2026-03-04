'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, MessageSquare, CheckCircle, Clock, Eye, X, Send, Scale, Users, Gavel, Hash } from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';

interface Dispute {
  id: number;
  order_id: number;
  customer_id: number;
  seller_id: number;
  escrow_id: number | null;
  reason: string;
  description: string;
  evidence_urls: string | null;
  status: string;
  resolution_notes: string | null;
  refund_amount: number | null;
  resolved_at: string | null;
  created_at: string;
  store_name: string;
  seller_email: string;
  customer_first_name: string;
  customer_last_name: string;
  customer_email: string;
  order_number: string;
  order_total: number;
}

interface DisputeMessage {
  id: number;
  dispute_id: number;
  sender_type: string;
  sender_id: number;
  message: string;
  created_at: string;
}

interface DisputeStats {
  open: number;
  under_review: number;
  resolved: number;
  total: number;
}

export default function DisputesPage() {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [stats, setStats] = useState<DisputeStats>({ open: 0, under_review: 0, resolved: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [messages, setMessages] = useState<DisputeMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [resolutionStatus, setResolutionStatus] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [refundAmount, setRefundAmount] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/admin/disputes?status=${filter}`);
      if (res.ok) {
        const data = await res.json();
        setDisputes(data.disputes || []);
        setStats(data.stats || stats);
      }
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [filter]);

  const showMsg = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  const openDispute = async (dispute: Dispute) => {
    setSelectedDispute(dispute);
    setResolutionStatus(dispute.status);
    setResolutionNotes(dispute.resolution_notes || '');
    setRefundAmount(dispute.refund_amount?.toString() || '');
    try {
      const res = await fetch('/api/admin/disputes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'get_messages', dispute_id: dispute.id }),
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } catch { setMessages([]); }
  };

  const sendMsg = async () => {
    if (!newMessage.trim() || !selectedDispute) return;
    try {
      const res = await fetch('/api/admin/disputes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add_message', dispute_id: selectedDispute.id, message: newMessage }),
      });
      if (res.ok) {
        setMessages(prev => [...prev, { id: Date.now(), dispute_id: selectedDispute.id, sender_type: 'admin', sender_id: 0, message: newMessage, created_at: new Date().toISOString() }]);
        setNewMessage('');
      }
    } catch { showMsg('error', 'Failed to send message'); }
  };

  const updateStatus = async () => {
    if (!selectedDispute || !resolutionStatus) return;
    setSaving(true);
    try {
      const res = await fetch('/api/admin/disputes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_status',
          dispute_id: selectedDispute.id,
          status: resolutionStatus,
          resolution_notes: resolutionNotes,
          refund_amount: refundAmount ? Number(refundAmount) : null,
        }),
      });
      if (res.ok) {
        showMsg('success', 'Dispute updated');
        setSelectedDispute(null);
        fetchData();
      } else showMsg('error', 'Failed to update');
    } catch { showMsg('error', 'Failed to update'); }
    finally { setSaving(false); }
  };

  const fmt = (d: string) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  const fmtFull = (d: string) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  const reasonLabel = (r: string) => r.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  const statusBadge = (s: string) => {
    if (['open', 'seller_responded'].includes(s)) return 'bg-amber-100 text-amber-700';
    if (s === 'under_review') return 'bg-blue-100 text-blue-700';
    if (['resolved_buyer', 'resolved_seller', 'resolved_split'].includes(s)) return 'bg-green-100 text-green-700';
    if (s === 'closed') return 'bg-gray-100 text-gray-600';
    return 'bg-gray-100 text-gray-600';
  };

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
            <h1 className="text-2xl font-bold text-gray-900">Dispute Arbitration</h1>
            <p className="text-gray-500 mt-1">Review and resolve buyer-seller disputes</p>
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
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              </div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Open</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.open}</p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <Eye className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Under Review</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.under_review}</p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Resolved</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.resolved}</p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                <Scale className="w-5 h-5 text-purple-600" />
              </div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Total</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {['all', 'open', 'seller_responded', 'under_review', 'resolved_buyer', 'resolved_seller', 'closed'].map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === f ? 'bg-purple-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}>
              {f === 'all' ? 'All' : reasonLabel(f)}
            </button>
          ))}
        </div>

        {/* Disputes List */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {disputes.length === 0 ? (
            <div className="p-16 text-center">
              <Scale className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No disputes found</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {disputes.map((d) => (
                <div key={d.id} className="p-5 hover:bg-gray-50/50 transition-colors cursor-pointer" onClick={() => openDispute(d)}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${statusBadge(d.status)}`}>
                          {d.status.replace(/_/g, ' ')}
                        </span>
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-gray-100 text-gray-600">
                          {reasonLabel(d.reason)}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-gray-900">Order #{d.order_number || d.order_id}</p>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">{d.description}</p>
                      <div className="flex items-center gap-4 mt-2.5 text-xs text-gray-400">
                        <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {d.customer_first_name} {d.customer_last_name}</span>
                        <span>vs</span>
                        <span className="flex items-center gap-1"><Hash className="w-3 h-3" /> {d.store_name}</span>
                        <span className="font-medium text-gray-600">£{Number(d.order_total || 0).toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs text-gray-400">{fmt(d.created_at)}</p>
                      {d.refund_amount && <p className="text-xs text-blue-600 font-medium mt-1">Refund: £{Number(d.refund_amount).toFixed(2)}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Dispute Detail Slide-over */}
      {selectedDispute && (
        <>
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50" onClick={() => setSelectedDispute(null)} />
          <div className="fixed top-0 right-0 bottom-0 w-full max-w-lg z-50 bg-white shadow-2xl border-l border-gray-200 flex flex-col">

            {/* Header */}
            <div className="p-6 flex-shrink-0 border-b border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Gavel className="w-5 h-5 text-purple-600" />
                  <h3 className="text-lg font-bold text-gray-900">Dispute #{selectedDispute.id}</h3>
                </div>
                <button onClick={() => setSelectedDispute(null)} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="p-3 bg-gray-50 rounded-xl">
                  <p className="text-[10px] font-semibold text-gray-400 uppercase mb-1">Order</p>
                  <p className="font-semibold text-gray-900">#{selectedDispute.order_number || selectedDispute.order_id}</p>
                  <p className="text-xs text-gray-500">£{Number(selectedDispute.order_total || 0).toFixed(2)}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl">
                  <p className="text-[10px] font-semibold text-gray-400 uppercase mb-1">Reason</p>
                  <p className="font-medium text-gray-900 text-xs">{reasonLabel(selectedDispute.reason)}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl">
                  <p className="text-[10px] font-semibold text-gray-400 uppercase mb-1">Buyer</p>
                  <p className="font-medium text-gray-900 text-xs">{selectedDispute.customer_first_name} {selectedDispute.customer_last_name}</p>
                  <p className="text-[11px] text-gray-400 truncate">{selectedDispute.customer_email}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl">
                  <p className="text-[10px] font-semibold text-gray-400 uppercase mb-1">Seller</p>
                  <p className="font-medium text-gray-900 text-xs">{selectedDispute.store_name}</p>
                  <p className="text-[11px] text-gray-400 truncate">{selectedDispute.seller_email}</p>
                </div>
              </div>

              {/* Description */}
              <div className="mt-4 p-3 bg-amber-50 border border-amber-100 rounded-xl">
                <p className="text-xs text-gray-700">{selectedDispute.description}</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-3 bg-gray-50">
              {messages.length === 0 && (
                <div className="text-center py-8">
                  <MessageSquare className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-400 text-xs">No messages yet</p>
                </div>
              )}
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender_type === 'admin' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm ${
                    msg.sender_type === 'admin'
                      ? 'bg-purple-600 text-white rounded-br-md'
                      : msg.sender_type === 'seller'
                      ? 'bg-orange-100 text-orange-900 rounded-bl-md'
                      : 'bg-white text-gray-800 border border-gray-200 rounded-bl-md'
                  }`}>
                    <p className={`text-[10px] font-bold mb-1 uppercase tracking-wide ${
                      msg.sender_type === 'admin' ? 'text-purple-200' : msg.sender_type === 'seller' ? 'text-orange-500' : 'text-gray-400'
                    }`}>{msg.sender_type}</p>
                    <p className="text-xs leading-relaxed">{msg.message}</p>
                    <p className={`text-[10px] mt-1 ${msg.sender_type === 'admin' ? 'text-purple-300' : 'text-gray-400'}`}>{fmtFull(msg.created_at)}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="p-4 flex gap-2 flex-shrink-0 border-t border-gray-100 bg-white">
              <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMsg()}
                placeholder="Type a message..."
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
              <button onClick={sendMsg} disabled={!newMessage.trim()}
                className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-colors disabled:opacity-50">
                <Send className="w-4 h-4" />
              </button>
            </div>

            {/* Resolution Panel */}
            <div className="p-5 flex-shrink-0 border-t border-gray-100 bg-white">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Resolution</p>
              <div className="space-y-3">
                <select value={resolutionStatus} onChange={(e) => setResolutionStatus(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white">
                  <option value="open">Open</option>
                  <option value="under_review">Under Review</option>
                  <option value="resolved_buyer">Resolved — Buyer Wins</option>
                  <option value="resolved_seller">Resolved — Seller Wins</option>
                  <option value="resolved_split">Resolved — Split</option>
                  <option value="closed">Closed</option>
                </select>
                <input type="number" value={refundAmount} onChange={(e) => setRefundAmount(e.target.value)}
                  placeholder="Refund amount (£)" step="0.01" min="0"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
                <textarea value={resolutionNotes} onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="Resolution notes..." rows={2}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none" />
                <button onClick={updateStatus} disabled={saving}
                  className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50">
                  {saving ? 'Updating...' : 'Update Dispute'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  );
}
