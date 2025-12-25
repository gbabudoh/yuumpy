'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Gift, ShoppingBag, Sparkles, User, LogOut, Settings, Bell,
  Package, TrendingUp, Award, Clock, Calendar, ArrowUpRight
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface RewardsData {
  pointsBalance: number;
  lifetimeEarned: number;
  lifetimeRedeemed: number;
}

interface RewardsHistoryItem {
  id: number;
  points: number;
  transaction_type: 'earned' | 'redeemed' | 'expired' | 'adjusted';
  description: string;
  order_number?: string;
  created_at: string;
}

interface Customer {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
}

export default function RewardsPage() {
  const router = useRouter();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [rewards, setRewards] = useState<RewardsData | null>(null);
  const [history, setHistory] = useState<RewardsHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/customer/auth/me');
      if (!response.ok) {
        router.push('/account/login');
        return;
      }
      const data = await response.json();
      setCustomer(data.customer);
      fetchRewards();
    } catch {
      router.push('/account/login');
    }
  };

  const fetchRewards = async () => {
    try {
      const response = await fetch('/api/customer/rewards');
      if (response.ok) {
        const data = await response.json();
        setRewards(data.rewards);
        setHistory(data.history || []);
      }
    } catch (error) {
      console.error('Error fetching rewards:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/customer/auth/logout', { method: 'POST' });
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'earned':
        return <TrendingUp className="w-5 h-5 text-green-600" />;
      case 'redeemed':
        return <Gift className="w-5 h-5 text-purple-600" />;
      case 'expired':
        return <Clock className="w-5 h-5 text-red-600" />;
      default:
        return <Award className="w-5 h-5 text-blue-600" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'earned':
        return 'bg-green-50 border-green-200 text-green-700';
      case 'redeemed':
        return 'bg-purple-50 border-purple-200 text-purple-700';
      case 'expired':
        return 'bg-red-50 border-red-200 text-red-700';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-700';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-amber-200 rounded-full animate-spin border-t-amber-600 mx-auto"></div>
            <Sparkles className="w-6 h-6 text-amber-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="mt-4 text-gray-600 font-medium">Loading your rewards...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <Header />
      
      {/* Hero Section */}
      <div className="bg-[#DCDCDC] text-gray-800">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center ring-4 ring-amber-400/30">
                <Gift className="w-8 h-8 text-white" />
              </div>
              <div>
                <p className="text-gray-600 text-sm">My Rewards</p>
                <h1 className="text-2xl md:text-3xl font-bold">
                  {customer?.firstName} {customer?.lastName}
                </h1>
                <p className="text-gray-500 text-sm">{customer?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="p-2 bg-gray-500/20 hover:bg-gray-500/30 rounded-xl transition-colors cursor-pointer">
                <Bell className="w-5 h-5" />
              </button>
              <button className="p-2 bg-gray-500/20 hover:bg-gray-500/30 rounded-xl transition-colors cursor-pointer">
                <Settings className="w-5 h-5" />
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-gray-500/20 hover:bg-gray-500/30 rounded-xl transition-colors text-sm font-medium cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Points Balance Card */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl shadow-lg shadow-amber-500/30 p-8 mb-8 text-white">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-amber-100 text-sm mb-2">Available Points</p>
              <p className="text-5xl font-bold">{rewards?.pointsBalance || 0}</p>
            </div>
            <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <Gift className="w-10 h-10 text-white" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/20">
            <div>
              <p className="text-amber-100 text-xs mb-1">Lifetime Earned</p>
              <p className="text-2xl font-bold">{rewards?.lifetimeEarned || 0}</p>
            </div>
            <div>
              <p className="text-amber-100 text-xs mb-1">Lifetime Redeemed</p>
              <p className="text-2xl font-bold">{rewards?.lifetimeRedeemed || 0}</p>
            </div>
          </div>
        </div>

        {/* Info Card */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8">
          <div className="flex items-start gap-3">
            <Award className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-900 mb-1">How Rewards Work</p>
              <p className="text-sm text-blue-700">
                Earn 1 point for every £1 spent on direct purchases. Points can be redeemed for discounts on future orders. 
                Points expire 1 year after being earned.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
          <Link href="/account/orders" className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:border-green-300 hover:shadow-md transition-all group">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
              <Package className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900 text-sm">My Orders</p>
              <p className="text-xs text-gray-500">View orders</p>
            </div>
          </Link>
          <Link href="/" className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all group">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
              <ShoppingBag className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900 text-sm">Continue Shopping</p>
              <p className="text-xs text-gray-500">Earn more points</p>
            </div>
          </Link>
          <Link href="/contact" className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all group">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
              <Settings className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900 text-sm">Get Help</p>
              <p className="text-xs text-gray-500">Contact support</p>
            </div>
          </Link>
        </div>

        {/* Rewards History */}
        <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Calendar className="w-6 h-6 text-amber-600" />
              Rewards History
            </h2>
            <p className="text-sm text-gray-500 mt-1">Track your points earned and redeemed</p>
          </div>

          {history.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No rewards history yet</h3>
              <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                Start earning points by making purchases. You'll earn 1 point for every £1 spent!
              </p>
              <Link
                href="/products"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-amber-500/30 transition-all"
              >
                <ShoppingBag className="w-5 h-5" />
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {history.map((item) => (
                <div
                  key={item.id}
                  className={`p-6 hover:bg-gray-50/50 transition-colors ${getTransactionColor(item.transaction_type)}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="flex-shrink-0">
                        {getTransactionIcon(item.transaction_type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-gray-900 capitalize">
                            {item.transaction_type}
                          </p>
                          {item.order_number && (
                            <>
                              <span className="text-gray-400">•</span>
                              <Link
                                href={`/account/orders/${item.order_number}`}
                                className="text-sm text-gray-600 hover:text-amber-600 transition-colors flex items-center gap-1"
                              >
                                Order #{item.order_number}
                                <ArrowUpRight className="w-3 h-3" />
                              </Link>
                            </>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{item.description}</p>
                        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(item.created_at)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-xl font-bold ${
                        item.transaction_type === 'earned' ? 'text-green-600' : 
                        item.transaction_type === 'redeemed' ? 'text-purple-600' : 
                        'text-red-600'
                      }`}>
                        {item.transaction_type === 'earned' ? '+' : '-'}
                        {item.points}
                      </p>
                      <p className="text-xs text-gray-500">points</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}

