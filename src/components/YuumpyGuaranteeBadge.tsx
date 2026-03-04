'use client';

import React from 'react';
import { Shield, Lock, Clock } from 'lucide-react';

interface YuumpyGuaranteeBadgeProps {
  variant?: 'compact' | 'full' | 'inline';
  className?: string;
}

export default function YuumpyGuaranteeBadge({ variant = 'compact', className = '' }: YuumpyGuaranteeBadgeProps) {
  if (variant === 'inline') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
          style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.15))', border: '1px solid rgba(99,102,241,0.25)' }}>
          <Shield className="w-3.5 h-3.5 text-indigo-400" />
          <span className="text-indigo-300">Yuumpy Guarantee</span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
          style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)' }}>
          <Lock className="w-3.5 h-3.5 text-green-400" />
          <span className="text-green-300">Escrow Protected</span>
        </div>
      </div>
    );
  }

  if (variant === 'full') {
    return (
      <div className={`p-5 rounded-2xl ${className}`}
        style={{
          background: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(139,92,246,0.08))',
          border: '1px solid rgba(99,102,241,0.2)',
        }}>
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5 text-indigo-400" />
          <h4 className="text-white font-semibold">Yuumpy Guarantee</h4>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
          <div className="flex items-start gap-2">
            <Lock className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-gray-200 font-medium">Escrow Protection</p>
              <p className="text-gray-400 text-xs">Payment held securely until delivery confirmed</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Clock className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-gray-200 font-medium">7-Day Hold</p>
              <p className="text-gray-400 text-xs">Funds released 7 days after delivery</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Shield className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-gray-200 font-medium">Dispute Support</p>
              <p className="text-gray-400 text-xs">24/7 resolution team if anything goes wrong</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // compact (default)
  return (
    <div className={`flex items-center gap-3 p-3 rounded-xl ${className}`}
      style={{
        background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(34,197,94,0.05))',
        border: '1px solid rgba(99,102,241,0.2)',
      }}>
      <Shield className="w-5 h-5 text-indigo-400 shrink-0" />
      <div>
        <p className="text-sm font-semibold text-white">Yuumpy Guarantee</p>
        <p className="text-xs text-gray-400">Escrow protected · 7-day buyer protection</p>
      </div>
    </div>
  );
}
