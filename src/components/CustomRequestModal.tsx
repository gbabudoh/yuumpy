'use client';

import React, { useState } from 'react';
import { X, Send, Camera, Info, Loader2, AlertCircle, User } from 'lucide-react';
import { useEffect } from 'react';
import Link from 'next/link';

interface CustomRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  sellerId: number;
  sellerName: string;
  productId?: number;
  productName?: string;
}

export const CustomRequestModal: React.FC<CustomRequestModalProps> = ({ 
  isOpen, 
  onClose, 
  sellerId, 
  sellerName,
  productId,
  productName
}) => {
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    if (isOpen) {
      checkAuth();
    }
  }, [isOpen]);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/customer/auth/me');
      if (res.ok) {
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
      }
    } catch {
      setIsLoggedIn(false);
    } finally {
      setIsCheckingAuth(false);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const res = await fetch('/api/custom-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sellerId,
          productId,
          description,
        })
      });

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          onClose();
          setSuccess(false);
          setDescription('');
        }, 3000);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to send request. Please ensure you are logged in.');
      }
    } catch (err) {
      console.error('Submit custom request error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-neutral-900/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-neutral-100">
        <div className="p-6 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50">
          <div>
            <h2 className="text-xl font-bold text-neutral-900">Custom Request</h2>
            <p className="text-xs text-neutral-500 mt-1">Send a bespoke order to {sellerName}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition-colors text-neutral-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {success ? (
            <div className="text-center py-10">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Send className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-neutral-900">Request Sent!</h3>
              <p className="text-neutral-500 mt-2">The artisan will review your request and get back to you with a quote.</p>
            </div>
          ) : (
            <>
              {productName && (
                <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl flex items-start gap-3">
                  <Info className="w-4 h-4 text-indigo-500 mt-0.5" />
                  <p className="text-xs text-indigo-700">
                    You are requesting a custom version of <strong>{productName}</strong>.
                  </p>
                </div>
              )}

              {error && (
                <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-start gap-3">
                  <AlertCircle className="w-4 h-4 text-rose-500 mt-0.5" />
                  <p className="text-xs text-rose-700 font-bold">{error}</p>
                </div>
              )}

              {!isCheckingAuth && !isLoggedIn ? (
                <div className="py-10 flex flex-col items-center text-center space-y-6 animate-fadeIn">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center">
                    <User className="w-8 h-8 text-indigo-600" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-neutral-900">Registration Required</h3>
                    <p className="text-sm text-neutral-500 max-w-xs">
                      To protect your purchases and manage your custom orders, please register or login first.
                    </p>
                  </div>
                  <div className="flex flex-col w-full gap-3">
                    <Link 
                      href="/account/login"
                      className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-indigo-600/20 text-center"
                    >
                      Login to Yuumpy
                    </Link>
                    <Link 
                      href="/account/register"
                      className="w-full py-4 bg-white border border-neutral-100 hover:bg-neutral-50 text-neutral-900 rounded-2xl text-xs font-black uppercase tracking-widest transition-all text-center"
                    >
                      Create Account
                    </Link>
                  </div>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-neutral-700">Describe what you&apos;re looking for</label>
                    <textarea 
                      required
                      placeholder="Share your ideas, dimensions, or specific requirements..."
                      className="w-full px-4 py-3 rounded-xl bg-neutral-50 border border-neutral-100 focus:bg-white focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all outline-none text-sm font-medium min-h-[120px] resize-none"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-semibold text-neutral-700">Inspiration Images (Optional)</label>
                      <button type="button" className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:text-indigo-700 transition-colors">Browse</button>
                    </div>
                    <div className="group cursor-pointer">
                      <div className="border-2 border-dashed border-neutral-100 group-hover:border-indigo-200 group-hover:bg-indigo-50/30 rounded-2xl p-8 transition-all duration-300 text-center">
                        <Camera className="w-8 h-8 text-neutral-300 group-hover:text-indigo-400 mx-auto mb-3 transition-colors" />
                        <p className="text-xs font-black text-neutral-400 group-hover:text-indigo-500 uppercase tracking-widest">Upload Files</p>
                      </div>
                    </div>
                  </div>

                  <button 
                    type="submit"
                    disabled={loading || description.length < 10}
                    className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2 group"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    )}
                    Send Request
                  </button>
                </>
              )}
            </>
          )}
        </form>
      </div>
    </div>
  );
};
