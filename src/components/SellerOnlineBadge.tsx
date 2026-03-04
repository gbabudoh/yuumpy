'use client';

import { useState, useEffect } from 'react';

interface SellerOnlineBadgeProps {
  storeSlug: string;
  className?: string;
}

export default function SellerOnlineBadge({ storeSlug, className = '' }: SellerOnlineBadgeProps) {
  const [online, setOnline] = useState<boolean | null>(null);

  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch(`/api/seller/presence?store_slug=${encodeURIComponent(storeSlug)}`);
        if (res.ok) { const d = await res.json(); setOnline(d.online); }
      } catch { setOnline(false); }
    };
    check();
    const iv = setInterval(check, 30000);
    return () => clearInterval(iv);
  }, [storeSlug]);

  if (online === null) return null;

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 bg-white/80 backdrop-blur-md border rounded-full shadow-sm transition-all duration-500 ${
      online
        ? 'border-emerald-200 text-emerald-700 shadow-emerald-100/50'
        : 'border-slate-200 text-slate-500 shadow-slate-100/50'
    } ${className}`}>
      <span className="relative flex h-2 w-2">
        {online && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        )}
        <span className={`relative inline-flex rounded-full h-2 w-2 ${online ? 'bg-emerald-500' : 'bg-slate-400'}`} />
      </span>
      <span className="text-[10px] font-black uppercase tracking-widest">
        {online ? 'Online' : 'Offline'}
      </span>
    </span>
  );
}
