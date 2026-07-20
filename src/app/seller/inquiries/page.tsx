'use client';

import { useSellerContext } from '@/hooks/useSellerContext';
import { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  CheckCircle, 
  XCircle, 
  DollarSign, 
  User, 
  Package, 
  Calendar,
  Loader2,
  Send
} from 'lucide-react';


interface CustomRequest {
  id: number;
  customer_id: number;
  seller_id: number;
  product_id: number | null;
  description: string;
  attachment_urls: string[] | null;
  status: 'pending' | 'accepted' | 'declined' | 'quoted' | 'completed';
  quoted_price: number | null;
  created_at: string;
  first_name: string;
  last_name: string;
  product_name: string | null;
}

export default function SellerInquiriesPage() {
  const { seller } = useSellerContext();
  const [requests, setRequests] = useState<CustomRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);
  const [quoteValues, setQuoteValues] = useState<Record<number, string>>({});

  useEffect(() => {
    if (seller) {
      fetchRequests();
    }
  }, [seller]);

  const fetchRequests = async () => {
    try {
      const res = await fetch('/api/custom-requests');
      const data = await res.json();
      if (data.requests) {
        setRequests(data.requests);
      }
    } catch (error) {
      console.error('Failed to fetch requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (requestId: number, status: string, quotedPrice?: number) => {
    setUpdating(requestId);
    try {
      const res = await fetch('/api/custom-requests', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, status, quotedPrice })
      });
      if (res.ok) {
        fetchRequests();
        if (quotedPrice) {
          setQuoteValues(prev => {
            const next = { ...prev };
            delete next[requestId];
            return next;
          });
        }
      }
    } catch (error) {
      console.error('Failed to update request:', error);
    } finally {
      setUpdating(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'accepted': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'quoted': return 'bg-indigo-50 text-indigo-600 border-indigo-100';
      case 'declined': return 'bg-rose-50 text-rose-600 border-rose-100';
      default: return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-full" />
          <div className="absolute inset-0 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
        <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">Loading Inquiries...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-[10px] font-black text-indigo-600 uppercase tracking-widest">Customer Comms</span>
            <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Custom Requests</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Inquiries</h1>
          <p className="text-slate-500 font-medium">Review and respond to bespoke order requests from your customers.</p>
        </div>
      </div>

      {requests.length === 0 ? (
        <div className="bg-white rounded-[2.5rem] border border-slate-100 p-20 text-center space-y-4">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
            <MessageSquare className="w-10 h-10 text-slate-200" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">No inquiries yet</h3>
          <p className="text-slate-500 max-w-sm mx-auto">When customers send you custom requests from your profile, they will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {requests.map((request) => (
            <div key={request.id} className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-500 group">
              <div className="flex flex-col lg:flex-row">
                {/* Main Content */}
                <div className="flex-1 p-8 lg:p-10 space-y-8">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center border border-indigo-100">
                        <User className="w-6 h-6 text-indigo-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-slate-900">{request.first_name} {request.last_name}</h3>
                        <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                          <Calendar className="w-3 h-3" />
                          {new Date(request.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </div>
                      </div>
                    </div>
                    <span className={`px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest ${getStatusColor(request.status)}`}>
                      {request.status}
                    </span>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      <MessageSquare className="w-3.5 h-3.5" />
                      Request Details
                    </div>
                    <p className="text-slate-600 leading-relaxed font-medium bg-slate-50 p-6 rounded-3xl border border-slate-100">
                      {request.description}
                    </p>
                  </div>

                  {request.product_name && (
                    <div className="flex items-center gap-3 p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100/50">
                      <Package className="w-4 h-4 text-indigo-500" />
                      <span className="text-xs font-bold text-indigo-900 uppercase tracking-wide">Ref: {request.product_name}</span>
                    </div>
                  )}
                </div>

                {/* Sidebar Actions */}
                <div className="lg:w-80 bg-slate-50/50 border-l border-slate-100 p-8 lg:p-10 flex flex-col justify-between gap-8">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Current Quote</label>
                      <div className="text-2xl font-black text-slate-900">
                        {request.quoted_price ? `$${Number(request.quoted_price).toFixed(2)}` : 'No quote yet'}
                      </div>
                    </div>

                    {request.status === 'pending' || request.status === 'accepted' ? (
                      <div className="space-y-4">
                        <div className="relative group">
                          <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input 
                            type="number" 
                            step="0.01"
                            placeholder="Set Quote Price"
                            className="w-full pl-10 pr-4 py-4 rounded-2xl bg-white border border-slate-200 text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none"
                            value={quoteValues[request.id] || ''}
                            onChange={(e) => setQuoteValues({ ...quoteValues, [request.id]: e.target.value })}
                          />
                        </div>
                        <button 
                          onClick={() => handleUpdateStatus(request.id, 'quoted', parseFloat(quoteValues[request.id]))}
                          disabled={updating === request.id || !quoteValues[request.id]}
                          className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          {updating === request.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                          Send Quote
                        </button>
                      </div>
                    ) : null}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {request.status === 'pending' && (
                      <>
                        <button 
                          onClick={() => handleUpdateStatus(request.id, 'accepted')}
                          disabled={updating === request.id}
                          className="flex items-center justify-center gap-2 py-3 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          Accept
                        </button>
                        <button 
                          onClick={() => handleUpdateStatus(request.id, 'declined')}
                          disabled={updating === request.id}
                          className="flex items-center justify-center gap-2 py-3 bg-rose-50 text-rose-600 border border-rose-100 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          Decline
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
