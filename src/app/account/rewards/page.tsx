'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Gift, ShoppingBag, Sparkles, TrendingUp, Award, Clock,
  Calendar, ArrowUpRight, ArrowLeft, Info
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface RewardsData { pointsBalance: number; lifetimeEarned: number; lifetimeRedeemed: number; }
interface HistoryItem { id: number; points: number; transaction_type: 'earned' | 'redeemed' | 'expired' | 'adjusted'; description: string; order_number?: string; created_at: string; }

export default function RewardsPage() {
  const router = useRouter();
  const [rewards, setRewards] = useState<RewardsData | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { checkAuth(); }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/customer/auth/me');
      if (!res.ok) { router.push('/account/login'); return; }
      fetchRewards();
    } catch { router.push('/account/login'); }
  };

  const fetchRewards = async () => {
    try {
      const res = await fetch('/api/customer/rewards');
      if (res.ok) { const d = await res.json(); setRewards(d.rewards); setHistory(d.history || []); }
    } catch {} finally { setLoading(false); }
  };

  const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  const txStyle: Record<string, { icon: any; color: string; bg: string; sign: string }> = {
    earned:   { icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50', sign: '+' },
    redeemed: { icon: Gift,       color: 'text-violet-600',  bg: 'bg-violet-50',  sign: '-' },
    expired:  { icon: Clock,      color: 'text-red-600',     bg: 'bg-red-50',     sign: '-' },
    adjusted: { icon: Award,      color: 'text-blue-600',    bg: 'bg-blue-50',    sign: '' },
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f8fa] flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-14 h-14 mx-auto">
            <div className="w-14 h-14 border-[3px] border-gray-200 rounded-full animate-spin border-t-gray-900" />
            <Sparkles className="w-5 h-5 text-gray-900 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="mt-4 text-gray-400 text-sm">Loading rewards...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f8fa]">
      <Header />
      <div className="bg-white border-b border-gray-100/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-5 sm:py-6">
          <div className="flex items-center gap-3">
            <Link href="/account" className="p-2 -ml-2 rounded-xl hover:bg-gray-50 transition-colors" aria-label="Back to account">
              <ArrowLeft className="w-5 h-5 text-gray-400" />
            </Link>
            <div>
              <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 tracking-tight">My Rewards</h1>
              <p className="text-[13px] text-gray-400 mt-0.5">Earn and redeem points</p>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Points Balance */}
        <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl p-7 sm:p-8 text-white shadow-xl shadow-gray-900/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
          <div className="relative">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-gray-400 text-sm mb-1">Available Points</p>
                <p className="text-4xl sm:text-5xl font-bold tracking-tight">{rewards?.pointsBalance || 0}</p>
              </div>
              <div className="w-14 h-14 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <Gift className="w-7 h-7 text-white" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-5 border-t border-white/10">
              <div>
                <p className="text-gray-400 text-[12px] mb-0.5">Lifetime Earned</p>
                <p className="text-xl font-bold">{rewards?.lifetimeEarned || 0}</p>
              </div>
              <div>
                <p className="text-gray-400 text-[12px] mb-0.5">Lifetime Redeemed</p>
                <p className="text-xl font-bold">{rewards?.lifetimeRedeemed || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* How it works */}
        <div className="flex items-start gap-3 p-4 bg-blue-50/60 border border-blue-100 rounded-xl">
          <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-900 mb-0.5">How Rewards Work</p>
            <p className="text-[13px] text-blue-700/80 leading-relaxed">Earn 1 point for every £1 spent on direct purchases. Redeem points for discounts on future orders. Points expire 1 year after being earned.</p>
          </div>
        </div>

        {/* History */}
        <section className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-50">
            <h2 className="text-[17px] font-semibold text-gray-900">Points History</h2>
            <p className="text-[13px] text-gray-400 mt-0.5">Track your earned and redeemed points</p>
          </div>

          {history.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-4">
                <Award className="w-7 h-7 text-gray-300" />
              </div>
              <p className="text-sm font-medium text-gray-900 mb-1">No history yet</p>
              <p className="text-[13px] text-gray-400 mb-5">Start earning points by making purchases</p>
              <Link href="/products" className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition-colors">
                <ShoppingBag className="w-4 h-4" /> Start Shopping
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {history.map((item) => {
                const s = txStyle[item.transaction_type] || txStyle.adjusted;
                const Icon = s.icon;
                return (
                  <div key={item.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50/60 transition-colors">
                    <div className={`w-9 h-9 rounded-lg ${s.bg} flex items-center justify-center shrink-0`}>
                      <Icon className={`w-[18px] h-[18px] ${s.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 capitalize">{item.transaction_type}</p>
                      <p className="text-[12px] text-gray-500 truncate">{item.description}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[11px] text-gray-400">{fmtDate(item.created_at)}</span>
                        {item.order_number && (
                          <Link href={`/account/orders/${item.order_number}`} className="text-[11px] text-blue-600 hover:text-blue-700 font-medium flex items-center gap-0.5">
                            #{item.order_number} <ArrowUpRight className="w-3 h-3" />
                          </Link>
                        )}
                      </div>
                    </div>
                    <span className={`text-lg font-bold ${s.color} shrink-0`}>
                      {s.sign}{item.points}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
