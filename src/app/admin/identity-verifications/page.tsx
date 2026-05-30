'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import AdminLayout from '@/components/AdminLayout';
import {
  ShieldCheck, Eye, CheckCircle2, XCircle, Clock,
  RefreshCw, X, AlertTriangle, EyeOff, Timer
} from 'lucide-react';

interface Verification {
  id: number;
  seller_id: number;
  document_type: string;
  status: 'pending' | 'approved' | 'rejected';
  admin_notes: string | null;
  submitted_at: string;
  reviewed_at: string | null;
  store_name: string;
  email: string;
}

const DOC_LABEL: Record<string, string> = {
  passport: 'Passport',
  national_id: 'National ID',
  drivers_licence: "Driver's Licence",
};

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
};

const VIEWER_SECONDS = 60;

export default function IdentityVerificationsPage() {
  const [verifications, setVerifications] = useState<Verification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('pending');

  // Viewer state
  const [viewingId, setViewingId] = useState<number | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [blurred, setBlurred] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(VIEWER_SECONDS);

  // Review state
  const [reviewingId, setReviewingId] = useState<number | null>(null);
  const [reviewStatus, setReviewStatus] = useState<'approved' | 'rejected'>('approved');
  const [reviewNotes, setReviewNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const objectUrlRef = useRef<string | null>(null);

  const getToken = () => {
    if (typeof window === 'undefined') return '';
    try {
      const user = JSON.parse(localStorage.getItem('adminUser') || '{}');
      return user.token || '';
    } catch { return ''; }
  };

  const fetchVerifications = useCallback(async () => {
    setLoading(true);
    try {
      const token = getToken();
      const url = filter ? `/api/admin/identity-verifications?status=${filter}` : '/api/admin/identity-verifications';
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setVerifications(await res.json());
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { fetchVerifications(); }, [fetchVerifications]);

  // Blur on screenshot attempts / focus loss
  useEffect(() => {
    if (!viewingId) return;

    const blur = () => setBlurred(true);

    const onKey = (e: KeyboardEvent) => {
      if (
        e.key === 'PrintScreen' ||
        (e.metaKey && e.shiftKey && ['3', '4', '5'].includes(e.key)) ||
        (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 's')
      ) {
        setBlurred(true);
      }
    };

    document.addEventListener('visibilitychange', blur);
    window.addEventListener('blur', blur);
    window.addEventListener('keydown', onKey);

    return () => {
      document.removeEventListener('visibilitychange', blur);
      window.removeEventListener('blur', blur);
      window.removeEventListener('keydown', onKey);
    };
  }, [viewingId]);

  const closeViewer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    setViewingId(null);
    setImageSrc(null);
    setBlurred(false);
    setSecondsLeft(VIEWER_SECONDS);
  }, []);

  const openViewer = async (id: number) => {
    setViewingId(id);
    setImageLoading(true);
    setBlurred(false);
    setSecondsLeft(VIEWER_SECONDS);

    try {
      const token = getToken();
      const res = await fetch(`/api/admin/identity-verifications/${id}/image`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to load image');

      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      objectUrlRef.current = objectUrl;
      setImageSrc(objectUrl);

      // Start countdown
      timerRef.current = setInterval(() => {
        setSecondsLeft(prev => {
          if (prev <= 1) {
            closeViewer();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch {
      closeViewer();
      alert('Could not load document image.');
    } finally {
      setImageLoading(false);
    }
  };

  const submitReview = async () => {
    if (!reviewingId) return;
    setSubmitting(true);
    try {
      const token = getToken();
      const res = await fetch(`/api/admin/identity-verifications/${reviewingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: reviewStatus, admin_notes: reviewNotes }),
      });
      if (res.ok) {
        setReviewingId(null);
        setReviewNotes('');
        fetchVerifications();
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="p-6 max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Identity Verifications</h1>
              <p className="text-sm text-gray-400">Review seller identity documents</p>
            </div>
          </div>
          <button onClick={fetchVerifications} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6">
          {['pending', 'approved', 'rejected', ''].map(s => (
            <button
              key={s || 'all'}
              onClick={() => setFilter(s)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                filter === s ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              {s ? s.charAt(0).toUpperCase() + s.slice(1) : 'All'}
            </button>
          ))}
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <RefreshCw className="w-5 h-5 animate-spin text-purple-400" />
          </div>
        ) : verifications.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <ShieldCheck className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No {filter || ''} verifications</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Seller</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Document</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Status</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Submitted</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {verifications.map(v => (
                  <tr key={v.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-900">{v.store_name || '—'}</p>
                      <p className="text-xs text-gray-400">{v.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-gray-700">{DOC_LABEL[v.document_type] || v.document_type}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${STATUS_STYLES[v.status]}`}>
                        {v.status === 'pending' && <Clock className="w-3 h-3" />}
                        {v.status === 'approved' && <CheckCircle2 className="w-3 h-3" />}
                        {v.status === 'rejected' && <XCircle className="w-3 h-3" />}
                        {v.status.charAt(0).toUpperCase() + v.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(v.submitted_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openViewer(v.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-100 text-xs font-bold transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" /> View ID
                        </button>
                        {v.status === 'pending' && (
                          <button
                            onClick={() => { setReviewingId(v.id); setReviewStatus('approved'); setReviewNotes(''); }}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 text-purple-600 hover:bg-purple-100 text-xs font-bold transition-colors"
                          >
                            Review
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Secure Image Viewer Modal ── */}
      {viewingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="relative bg-gray-950 rounded-3xl overflow-hidden shadow-2xl max-w-2xl w-full mx-4">

            {/* Header bar */}
            <div className="flex items-center justify-between px-5 py-4 bg-gray-900 border-b border-white/10">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-purple-400" />
                <span className="text-white text-sm font-bold">Secure Document Viewer</span>
                <span className="text-gray-400 text-xs">— no download, no save</span>
              </div>
              <div className="flex items-center gap-3">
                {/* Countdown */}
                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black ${
                  secondsLeft <= 15 ? 'bg-red-500/20 text-red-400' : 'bg-white/10 text-white'
                }`}>
                  <Timer className="w-3 h-3" />
                  {secondsLeft}s
                </div>
                <button onClick={closeViewer} className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Image area */}
            <div
              className="relative select-none"
              onContextMenu={e => e.preventDefault()}
              style={{ WebkitUserSelect: 'none', userSelect: 'none' }}
            >
              {imageLoading ? (
                <div className="flex items-center justify-center h-80">
                  <RefreshCw className="w-8 h-8 animate-spin text-purple-400" />
                </div>
              ) : imageSrc ? (
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imageSrc}
                    alt="Identity document"
                    draggable={false}
                    className={`w-full max-h-[65vh] object-contain transition-all duration-300 pointer-events-none ${
                      blurred ? 'blur-xl scale-105' : 'blur-0'
                    }`}
                    style={{ WebkitUserDrag: 'none' } as React.CSSProperties}
                  />
                  {/* Blurred overlay */}
                  {blurred && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40">
                      <EyeOff className="w-10 h-10 text-white/60 mb-3" />
                      <p className="text-white font-bold text-sm mb-1">Document hidden</p>
                      <p className="text-white/50 text-xs mb-4">Screen activity detected</p>
                      <button
                        onClick={() => setBlurred(false)}
                        className="px-5 py-2 bg-white text-gray-900 rounded-xl text-sm font-bold hover:bg-gray-100 transition-colors"
                      >
                        Tap to reveal ({secondsLeft}s remaining)
                      </button>
                    </div>
                  )}
                </div>
              ) : null}

              {/* Progress bar */}
              <div className="h-1 bg-gray-800">
                <div
                  className={`h-full transition-all duration-1000 ${secondsLeft <= 15 ? 'bg-red-500' : 'bg-purple-500'}`}
                  style={{ width: `${(secondsLeft / VIEWER_SECONDS) * 100}%` }}
                />
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-3 bg-gray-900 flex items-center gap-2">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <p className="text-xs text-gray-400">
                This document is watermarked and encrypted. Viewing is logged. Window auto-closes in {secondsLeft} seconds.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Review Modal ── */}
      {reviewingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full mx-4 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900">Review Decision</h2>
              <button onClick={() => setReviewingId(null)} className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex gap-3 mb-5">
              {(['approved', 'rejected'] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setReviewStatus(s)}
                  className={`flex-1 py-3 rounded-2xl text-sm font-bold border-2 transition-all ${
                    reviewStatus === s
                      ? s === 'approved'
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-red-500 bg-red-50 text-red-700'
                      : 'border-gray-100 text-gray-400 hover:border-gray-200'
                  }`}
                >
                  {s === 'approved' ? '✓ Approve' : '✕ Reject'}
                </button>
              ))}
            </div>

            <div className="mb-5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-2">
                Notes {reviewStatus === 'rejected' ? '(required — shown to seller)' : '(optional)'}
              </label>
              <textarea
                value={reviewNotes}
                onChange={e => setReviewNotes(e.target.value)}
                rows={3}
                placeholder={reviewStatus === 'rejected' ? 'Explain why the document was rejected…' : 'Optional internal note…'}
                className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 resize-none"
              />
            </div>

            <button
              onClick={submitReview}
              disabled={submitting || (reviewStatus === 'rejected' && !reviewNotes.trim())}
              className={`w-full py-3 rounded-2xl font-bold text-sm transition-all ${
                submitting || (reviewStatus === 'rejected' && !reviewNotes.trim())
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : reviewStatus === 'approved'
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-red-600 text-white hover:bg-red-700'
              }`}
            >
              {submitting ? <span className="flex items-center justify-center gap-2"><RefreshCw className="w-4 h-4 animate-spin" /> Submitting…</span>
                : `Confirm ${reviewStatus === 'approved' ? 'Approval' : 'Rejection'}`}
            </button>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
