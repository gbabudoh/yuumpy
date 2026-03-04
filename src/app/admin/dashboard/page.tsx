'use client';

import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Package, 
  DollarSign, 
  Eye,
  MousePointer,
  CreditCard,
  Settings,
  Shield,
  Plus,
  FileText
} from 'lucide-react';
import Link from 'next/link';
import AdminLayout from '@/components/AdminLayout';
import AdminAuthWrapper from '@/components/AdminAuthWrapper';

interface DashboardStats {
  totalProducts: number;
  totalCategories: number;
  totalBrands: number;
  totalRevenue: number;
  totalViews: number;
  totalClicks: number;
  totalBannerAds: number;
  totalEmails: number;
  newEmails: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalCategories: 0,
    totalBrands: 0,
    totalRevenue: 0,
    totalViews: 0,
    totalClicks: 0,
    totalBannerAds: 0,
    totalEmails: 0,
    newEmails: 0
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        // Fetch real data from database
        const [productsRes, categoriesRes, brandsRes] = await Promise.all([
          fetch('/api/products'),
          fetch('/api/categories'),
          fetch('/api/brands')
        ]);

        const [productsData, categories, brands] = await Promise.all([
          productsRes.json(),
          categoriesRes.json(),
          brandsRes.json()
        ]);

        setStats({
          totalProducts: productsData.pagination?.total || productsData.products?.length || 0,
          totalCategories: categories.length || 0,
          totalBrands: brands.length || 0,
          totalRevenue: 0,
          totalViews: 0,
          totalClicks: 0,
          totalBannerAds: 0,
          totalEmails: 0,
          newEmails: 0
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        setStats({
          totalProducts: 0,
          totalCategories: 0,
          totalBrands: 0,
          totalRevenue: 0,
          totalViews: 0,
          totalClicks: 0,
          totalBannerAds: 0,
          totalEmails: 0,
          newEmails: 0
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminAuthWrapper>
      <AdminLayout>
      <div className="animate-fadeIn">
        {/* Dashboard Header */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="w-5 h-5 text-purple-600" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Executive Summary</span>
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Admin Dashboard</h1>
            <p className="text-slate-500 font-medium mt-1">Real-time marketplace oversight & control panel.</p>
          </div>
          <div className="flex gap-3">
            <button className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all cursor-pointer shadow-sm">
              Export Report
            </button>
            <button className="px-5 py-2.5 bg-purple-600 rounded-xl text-xs font-bold text-white hover:bg-purple-700 transition-all cursor-pointer shadow-lg shadow-purple-200">
              Refresh Data
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {[
            { label: 'Total Products', value: stats.totalProducts, icon: Package, color: 'purple', trend: '+12%' },
            { label: 'Total Revenue', value: `£${stats.totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'blue', trend: '+5%' },
            { label: 'Page Views', value: stats.totalViews.toLocaleString(), icon: Eye, color: 'indigo', trend: '+18%' },
            { label: 'Affiliate Clicks', value: stats.totalClicks.toLocaleString(), icon: MousePointer, color: 'orange', trend: '+24%' }
          ].map((item, idx) => (
            <div key={idx} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-purple-100/50 transition-all duration-500 group">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-2xl bg-${item.color}-50 flex items-center justify-center text-${item.color}-600 group-hover:scale-110 transition-transform`}>
                  <item.icon className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-black text-green-500 bg-green-50 px-2.5 py-1 rounded-full">{item.trend}</span>
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{item.label}</p>
              <h3 className="text-3xl font-black text-slate-900 tracking-tight">{item.value}</h3>
              <div className="mt-4 pt-4 border-t border-slate-50">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Updated 2 mins ago</p>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Setup Guide */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-3xl p-8 mb-10 relative overflow-hidden shadow-2xl shadow-purple-200">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-3xl -mr-20 -mt-20 rounded-full" />
          <div className="relative z-10">
            <h2 className="text-xl font-black text-white mb-6 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Shield className="w-5 h-5" />
              </div>
              Onboarding Checklist
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { step: '1', title: 'Categories', desc: 'Define your main taxonomy' },
                { step: '2', title: 'Sub-cats', desc: 'Granular product mapping' },
                { step: '3', title: 'Brands', desc: 'Add verified manufacturers' },
                { step: '4', title: 'Inventory', desc: 'Import your affiliate products' }
              ].map((item, idx) => (
                <div key={idx} className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                  <span className="text-[10px] font-black text-purple-200 mb-1 block">STEP 0{item.step}</span>
                  <h4 className="font-bold text-white mb-1">{item.title}</h4>
                  <p className="text-xs text-purple-100/70 font-medium leading-tight">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left: Content Management */}
          <div className="lg:col-span-12">
            <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                    <Package className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">Ecosystem Management</h2>
                </div>
                <Link href="/admin/products" className="text-xs font-bold text-purple-600 hover:text-purple-700 tracking-wide uppercase">Manage All →</Link>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { name: 'Products', count: stats.totalProducts, icon: Package, href: '/admin/products', color: 'blue' },
                  { name: 'Categories', count: stats.totalCategories, icon: BarChart3, href: '/admin/categories', color: 'green' },
                  { name: 'Brands', count: stats.totalBrands, icon: Shield, href: '/admin/brands', color: 'purple' }
                ].map((section, idx) => (
                  <Link 
                    key={idx}
                    href={section.href}
                    className="group bg-slate-50/50 hover:bg-white border border-slate-100 hover:border-purple-200 p-6 rounded-2xl transition-all duration-300 hover:shadow-xl hover:shadow-purple-100/50"
                  >
                    <div className={`w-12 h-12 rounded-xl bg-${section.color}-50 flex items-center justify-center text-${section.color}-600 mb-4 group-hover:scale-110 transition-transform`}>
                      <section.icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-slate-900 mb-1">{section.name}</h3>
                    <p className="text-xs text-slate-500 font-medium">{section.count} indexed items</p>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-10">
          <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                <Settings className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">System Short-cuts</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {[
                { name: 'Add Product', icon: Plus, href: '/admin/products?action=add' },
                { name: 'New Category', icon: Plus, href: '/admin/categories?action=add' },
                { name: 'Register Brand', icon: Shield, href: '/admin/brands?action=add' },
                { name: 'Create Ad', icon: CreditCard, href: '/admin/banner-ads?action=add' },
                { name: 'Reports', icon: FileText, href: '/admin/analytics' },
                { name: 'Settings', icon: Settings, href: '/admin/settings' }
              ].map((action, idx) => (
                <Link
                  key={idx}
                  href={action.href}
                  className="flex flex-col items-center justify-center p-6 bg-slate-50/50 rounded-2xl border border-dotted border-slate-200 hover:border-purple-300 hover:bg-purple-50 transition-all group"
                >
                  <action.icon className="w-5 h-5 text-slate-400 group-hover:text-purple-600 group-hover:scale-110 transition-all mb-3" />
                  <span className="text-[10px] font-black uppercase tracking-tight text-slate-500 group-hover:text-purple-700 text-center">{action.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
    </AdminAuthWrapper>
  );
}