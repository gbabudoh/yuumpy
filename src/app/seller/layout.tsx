'use client';

import { useState, useEffect, createContext, useContext } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  BarChart3,
  Settings,
  Store,
  ExternalLink,
  ArrowLeft,
  Menu,
  X,
  CreditCard,
  ShieldCheck
} from 'lucide-react';
import SellerPresenceHeartbeat from '@/components/SellerPresenceHeartbeat';
import SellerIncomingComms from '@/components/SellerIncomingComms';

interface Seller {
  id: number;
  store_name: string;
  store_slug: string;
  email: string;
  status: string;
  logo_url: string;
  total_sales: number;
  total_orders: number;
  average_rating: number;
  commission_rate: number;
}

const SellerContext = createContext<{ seller: Seller | null; loading: boolean }>({
  seller: null,
  loading: true,
});

export function useSellerContext() {
  return useContext(SellerContext);
}

const navItems = [
  { href: '/seller/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/seller/products', label: 'Products', icon: Package },
  { href: '/seller/orders', label: 'Orders', icon: ShoppingBag },
  { href: '/seller/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/seller/settings', label: 'Settings', icon: Settings },
];

function SellerSidebar({ seller }: { seller: Seller | null }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-5 left-5 z-50 p-2.5 rounded-xl text-white shadow-lg shadow-indigo-500/20"
        style={{ background: 'rgba(79, 70, 229, 0.9)', backdropFilter: 'blur(8px)' }}
        aria-label="Toggle menu"
      >
        {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 transition-opacity" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full z-40 w-72 transition-all duration-300 lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0 shadow-2xl shadow-indigo-500/10' : '-translate-x-full'
        } bg-white border-r border-gray-100`}
      >
        <div className="flex flex-col h-full">
          {/* Logo + Store Info */}
          <div className="px-7 py-8">
            <Link href="/" className="group block mb-10">
              <div className="flex items-center gap-3">
                <div className="relative h-8 w-32">
                  <Image 
                    src="/logo.png" 
                    alt="YUUMPY" 
                    fill 
                    className="object-contain object-left"
                    priority
                  />
                </div>
                <div className="px-2 py-0.5 rounded-md bg-indigo-50 border border-indigo-100">
                  <span className="text-[10px] text-indigo-600 font-bold tracking-widest uppercase">PRO</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-400 font-bold tracking-[0.2em] uppercase mt-2.5 pl-1">Seller Console</p>
            </Link>

            {seller && (
              <div className="group/store relative p-4 rounded-2xl transition-all duration-300 overflow-hidden bg-slate-50 border border-slate-100">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover/store:opacity-100 transition-opacity" />
                <div className="relative flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/20" style={{
                    background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                  }}>
                    {seller.store_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-900 text-sm font-bold truncate group-hover/store:text-indigo-600 transition-colors">{seller.store_name}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <div className={`w-2 h-2 rounded-full ${
                        seller.status === 'approved' ? 'bg-emerald-500' : seller.status === 'pending' ? 'bg-amber-500' : 'bg-red-500'
                      }`} />
                      <p className={`text-[11px] font-bold uppercase tracking-wider ${
                        seller.status === 'approved' ? 'text-emerald-600/90' : seller.status === 'pending' ? 'text-amber-600/90' : 'text-red-600/90'
                      }`}>
                        {seller.status === 'approved' ? 'Active' : seller.status === 'pending' ? 'Pending' : seller.status}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto custom-scrollbar">
            <p className="px-4 text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em] mb-3 mt-2">Management</p>
            {navItems.map(item => {
              const isActive = pathname === item.href || (item.href !== '/seller/dashboard' && pathname.startsWith(item.href));
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`group flex items-center gap-3.5 px-4 py-3 rounded-xl text-[13px] font-bold transition-all duration-300 ${
                    isActive 
                      ? 'text-indigo-600 bg-indigo-50 shadow-sm' 
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-[18px] h-[18px] transition-transform duration-300 ${isActive ? 'text-indigo-600' : 'group-hover:scale-110 group-hover:text-indigo-600'}`} />
                  {item.label}
                  {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-600 shadow-[0_0_8px_rgba(79,70,229,0.4)]" />}
                </Link>
              );
            })}

            <p className="px-4 text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em] mb-3 mt-8">Storefront</p>
            {seller && (
              <Link
                href={`/store/${seller.store_slug}`}
                onClick={() => setMobileOpen(false)}
                className="group flex items-center gap-3.5 px-4 py-3 rounded-xl text-[13px] font-bold text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-all duration-300"
                target="_blank"
              >
                <Store className="w-[18px] h-[18px] group-hover:text-indigo-600" />
                Visit Store
                <ExternalLink className="w-3.5 h-3.5 ml-auto opacity-40 group-hover:opacity-100 transition-opacity" />
              </Link>
            )}
          </nav>

          {/* Earnings Summary */}
          {seller && (
            <div className="p-4 mx-3 mb-4 rounded-2xl overflow-hidden relative group/earnings bg-indigo-50 border border-indigo-100/50">
              <div className="absolute top-0 right-0 p-2 opacity-5 group-hover/earnings:opacity-10 transition-opacity">
                <CreditCard className="w-12 h-12 -rotate-12" />
              </div>
              <div className="relative">
                <p className="text-[10px] text-indigo-600/70 font-black uppercase tracking-widest mb-1.5">Total Revenue</p>
                <p className="text-2xl font-black text-slate-900 tracking-tight">${Number(seller.total_sales || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center gap-1 text-[11px] text-slate-500 font-bold">
                    <ShoppingBag className="w-3 h-3 text-indigo-500" /> {seller.total_orders}
                  </div>
                  <div className="w-1 h-1 rounded-full bg-slate-300" />
                  <div className="flex items-center gap-1 text-[11px] text-indigo-600 font-black">
                    <ShieldCheck className="w-3 h-3" /> {seller.commission_rate}%
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Back to Account */}
          <div className="p-4 mt-auto border-t border-gray-50">
            <Link
              href="/account"
              className="flex items-center gap-3 w-full px-5 py-3 rounded-xl text-[13px] font-bold text-slate-500 hover:text-indigo-600 hover:bg-slate-50 transition-all duration-300 active:scale-95"
            >
              <ArrowLeft className="w-[18px] h-[18px]" />
              Back to Account
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [seller, setSeller] = useState<Seller | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/seller/auth/me')
      .then(res => {
        if (!res.ok) {
          // Not authenticated or not an approved seller — go to account
          router.push('/account/settings?tab=selling');
          return null;
        }
        return res.json();
      })
      .then(data => {
        if (data?.seller) setSeller(data.seller);
        else if (data !== null) router.push('/account/settings?tab=selling');
      })
      .catch(() => router.push('/account/settings?tab=selling'))
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 border-4 border-indigo-100 rounded-full" />
          <div className="absolute inset-0 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <SellerContext.Provider value={{ seller, loading }}>
      <div className="min-h-screen bg-slate-50">
        <SellerSidebar seller={seller} />
        <main className="lg:ml-72 min-h-screen">
          <div className="p-6 lg:p-8">
            {children}
          </div>
        </main>
        {seller && <SellerPresenceHeartbeat sellerId={seller.id} />}
        {seller && (
          <SellerIncomingComms
            sellerId={seller.id}
            storeSlug={seller.store_slug}
          />
        )}
      </div>
    </SellerContext.Provider>
  );
}
