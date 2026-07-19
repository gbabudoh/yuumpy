'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, MessageSquare, Eye, X, Send, Scale, Hash } from 'lucide-react';

interface Dispute {
  id: number;
  order_id: number;
  reason: string;
  description: string;
  status: string;
  resolution_notes: string | null;
  refund_amount: number | null;
  created_at: string;
  customer_first_name: string;
  customer_last_name: string;
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

export default function SellerDisputesPage() {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [messages, setMessages] = useState<DisputeMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/seller/disputes?status=${filter}`);
      if (res.ok) {
        const data = await res.json();
        setDisputes(data.disputes || []);
      }
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [filter]);

  const openDispute = async (dispute: Dispute) => {
    setSelectedDispute(dispute);
    try {
      const res = await fetch('/api/seller/disputes', {
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
    if (!newMessage.trim() || !selectedDispute || sending) return;
    setSending(true);
    try {
      const res = await fetch('/api/seller/disputes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add_message', dispute_id: selectedDispute.id, message: newMessage }),
      });
      if (res.ok) {
        setMessages(prev => [...prev, { id: Date.now(), dispute_id: selectedDispute.id, sender_type: 'seller', sender_id: 0, message: newMessage, created_at: new Date().toISOString() }]);
        setNewMessage('');
        fetchData();
      }
    } catch { /* ignore */ }
    finally { setSending(false); }
  };

  const fmt = (d: string) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  const fmtFull = (d: string) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  const reasonLabel = (r: string) => r.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  const statusBadge = (s: string) => {
    if (['open', 'seller_responded'].includes(s)) return 'bg-amber-100 text-amber-700';
    if (s === 'under_review') return 'bg-blue-100 text-blue-700';
    if (['resolved_buyer', 'resolved_seller', 'resolved_split'].includes(s)) return 'bg-emerald-100 text-emerald-700';
    return 'bg-gray-100 text-gray-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-gray-300 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Disputes</h1>
        <p className="text-slate-500 mt-1">Orders a customer has raised a problem with</p>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {['all', 'open', 'seller_responded', 'under_review', 'resolved_buyer', 'resolved_seller', 'closed'].map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === f ? 'bg-indigo-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}>
            {f === 'all' ? 'All' : reasonLabel(f)}
          </button>
        ))}
      </div>

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
                      <span className="flex items-center gap-1"><Hash className="w-3 h-3" /> {d.customer_first_name} {d.customer_last_name}</span>
                      <span className="font-medium text-gray-600">£{Number(d.order_total || 0).toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-gray-400">{fmt(d.created_at)}</p>
                    {d.refund_amount != null && <p className="text-xs text-blue-600 font-medium mt-1">Refund: £{Number(d.refund_amount).toFixed(2)}</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedDispute && (
        <>
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50" onClick={() => setSelectedDispute(null)} />
          <div className="fixed top-0 right-0 bottom-0 w-full max-w-lg z-50 bg-white shadow-2xl border-l border-gray-200 flex flex-col">

            <div className="p-6 flex-shrink-0 border-b border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Eye className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-lg font-bold text-gray-900">Dispute #{selectedDispute.id}</h3>
                </div>
                <button onClick={() => setSelectedDispute(null)} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

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
                <div className="p-3 bg-gray-50 rounded-xl col-span-2">
                  <p className="text-[10px] font-semibold text-gray-400 uppercase mb-1">Buyer</p>
                  <p className="font-medium text-gray-900 text-xs">{selectedDispute.customer_first_name} {selectedDispute.customer_last_name}</p>
                </div>
              </div>

              <div className="mt-4 p-3 bg-amber-50 border border-amber-100 rounded-xl">
                <p className="text-xs text-gray-700">{selectedDispute.description}</p>
              </div>

              {selectedDispute.resolution_notes && (
                <div className="mt-3 p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
                  <p className="text-[10px] font-semibold text-emerald-700 uppercase mb-1">Admin Resolution</p>
                  <p className="text-xs text-emerald-900">{selectedDispute.resolution_notes}</p>
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-3 bg-gray-50">
              {messages.length === 0 && (
                <div className="text-center py-8">
                  <MessageSquare className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-400 text-xs">No messages yet — reply below</p>
                </div>
              )}
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender_type === 'seller' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm ${
                    msg.sender_type === 'seller'
                      ? 'bg-indigo-600 text-white rounded-br-md'
                      : msg.sender_type === 'admin'
                      ? 'bg-purple-100 text-purple-900 rounded-bl-md'
                      : 'bg-white text-gray-800 border border-gray-200 rounded-bl-md'
                  }`}>
                    <p className={`text-[10px] font-bold mb-1 uppercase tracking-wide ${
                      msg.sender_type === 'seller' ? 'text-indigo-200' : msg.sender_type === 'admin' ? 'text-purple-500' : 'text-gray-400'
                    }`}>{msg.sender_type === 'seller' ? 'You' : msg.sender_type}</p>
                    <p className="text-xs leading-relaxed">{msg.message}</p>
                    <p className={`text-[10px] mt-1 ${msg.sender_type === 'seller' ? 'text-indigo-300' : 'text-gray-400'}`}>{fmtFull(msg.created_at)}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 flex gap-2 flex-shrink-0 border-t border-gray-100 bg-white">
              <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMsg()}
                placeholder="Respond to this dispute..."
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
              <button onClick={sendMsg} disabled={!newMessage.trim() || sending}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors disabled:opacity-50">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </>
      )}

      <div className="mt-6 flex items-start gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
        <AlertTriangle className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
        <p className="text-xs text-gray-500">
          Disputes are opened by buyers from their order page. You can respond here and admin makes the final call on resolution.
        </p>
      </div>
    </div>
  );
}
