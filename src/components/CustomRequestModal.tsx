'use client';

import React, { useState } from 'react';
import { X, Send, Camera, Info, Loader2 } from 'lucide-react';

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

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
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
      }
    } catch (error) {
      console.error('Submit custom request error:', error);
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

              <div className="space-y-2">
                <label className="text-sm font-semibold text-neutral-700">Describe what you&apos;re looking for</label>
                <textarea 
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. &apos;I love this table but could you make it 10cm wider and in a darker oak finish?&apos;"
                  className="w-full h-32 p-4 bg-neutral-50 border border-neutral-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-neutral-900 placeholder:text-neutral-400"
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-neutral-700">Inspiration Images (Optional)</label>
                  <button type="button" className="text-xs font-bold text-indigo-600 hover:text-indigo-700">Browse</button>
                </div>
                <div className="flex items-center justify-center w-full h-24 border-2 border-dashed border-neutral-200 rounded-2xl bg-neutral-50 hover:bg-neutral-100 transition-colors cursor-pointer group">
                  <div className="flex flex-col items-center gap-1">
                    <Camera className="w-6 h-6 text-neutral-400 group-hover:text-indigo-500" />
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Upload Files</span>
                  </div>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-neutral-400 text-white font-bold rounded-2xl shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4" /> Send Request
                  </>
                )}
              </button>
            </>
          )}
        </form>
      </div>
    </div>
  );
};
