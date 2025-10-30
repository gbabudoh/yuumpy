'use client';

import { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Package, 
  Users, 
  DollarSign, 
  TrendingUp, 
  ShoppingBag,
  Eye,
  MousePointer,
  CreditCard,
  Settings,
  Database,
  FileText,
  Shield,
  Plus,
  Edit,
  Trash2,
  Mail
} from 'lucide-react';
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
          totalRevenue: 12450.75,
          totalViews: 8942,
          totalClicks: 1247,
          totalBannerAds: 12,
          totalEmails: 24,
          newEmails: 3
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
      <div>
        {/* Dashboard Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Yuumpy Affiliate Marketplace - Control Panel</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Products</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalProducts}</p>
              </div>
              <Package className="w-8 h-8 text-blue-600" />
            </div>
            <div className="mt-4 flex items-center text-sm text-green-600">
              <TrendingUp className="w-4 h-4 mr-1" />
              <span>+12% this month</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-3xl font-bold text-gray-900">£{stats.totalRevenue.toLocaleString()}</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
            <div className="mt-4 flex items-center text-sm text-green-600">
              <TrendingUp className="w-4 h-4 mr-1" />
              <span>+8% this month</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Page Views</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalViews.toLocaleString()}</p>
              </div>
              <Eye className="w-8 h-8 text-purple-600" />
            </div>
            <div className="mt-4 flex items-center text-sm text-green-600">
              <TrendingUp className="w-4 h-4 mr-1" />
              <span>+15% this month</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Affiliate Clicks</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalClicks.toLocaleString()}</p>
              </div>
              <MousePointer className="w-8 h-8 text-orange-600" />
            </div>
            <div className="mt-4 flex items-center text-sm text-green-600">
              <TrendingUp className="w-4 h-4 mr-1" />
              <span>+22% this month</span>
            </div>
          </div>
        </div>

        {/* Quick Setup Guide */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
          <h2 className="text-lg font-semibold text-blue-900 mb-3">📋 Quick Setup Guide</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
            <div>
              <strong>1. Create Categories:</strong> Go to Categories → Add main categories (Electronics, Fashion, etc.)
            </div>
            <div>
              <strong>2. Add Subcategories:</strong> In Categories → Select parent category when adding (Smartphones under Electronics)
            </div>
            <div>
              <strong>3. Create Brands:</strong> Go to Brands → Add brands (Apple, Samsung, Nike, etc.)
            </div>
            <div>
              <strong>4. Add Products:</strong> Go to Products → Select category/subcategory and optional brand
            </div>
          </div>
        </div>

        {/* Management Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Content Management */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <Package className="w-6 h-6 mr-3 text-blue-600" />
              Content Management
            </h2>
            <div className="space-y-4">
              <a
                href="/admin/products"
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors group"
              >
                <div className="flex items-center space-x-3">
                  <Package className="w-5 h-5 text-blue-600 group-hover:text-blue-700" />
                  <div>
                    <h3 className="font-medium text-gray-900">Products</h3>
                    <p className="text-sm text-gray-600">{stats.totalProducts} items</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-1 text-blue-600 hover:bg-blue-100 rounded">
                    <Plus className="w-4 h-4" />
                  </button>
                  <button className="p-1 text-gray-600 hover:bg-gray-100 rounded">
                    <Edit className="w-4 h-4" />
                  </button>
                </div>
              </a>

              <a
                href="/admin/categories"
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-green-50 hover:border-green-300 transition-colors group"
              >
                <div className="flex items-center space-x-3">
                  <BarChart3 className="w-5 h-5 text-green-600 group-hover:text-green-700" />
                  <div>
                    <h3 className="font-medium text-gray-900">Categories & Sub-categories</h3>
                    <p className="text-sm text-gray-600">{stats.totalCategories} categories</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-1 text-green-600 hover:bg-green-100 rounded">
                    <Plus className="w-4 h-4" />
                  </button>
                  <button className="p-1 text-gray-600 hover:bg-gray-100 rounded">
                    <Edit className="w-4 h-4" />
                  </button>
                </div>
              </a>

              <a
                href="/admin/brands"
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-purple-50 hover:border-purple-300 transition-colors group"
              >
                <div className="flex items-center space-x-3">
                  <Shield className="w-5 h-5 text-purple-600 group-hover:text-purple-700" />
                  <div>
                    <h3 className="font-medium text-gray-900">Brands</h3>
                    <p className="text-sm text-gray-600">{stats.totalBrands} brands</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-1 text-purple-600 hover:bg-purple-100 rounded">
                    <Plus className="w-4 h-4" />
                  </button>
                  <button className="p-1 text-gray-600 hover:bg-gray-100 rounded">
                    <Edit className="w-4 h-4" />
                  </button>
                </div>
              </a>

              <a
                href="/admin/banner-ads"
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-orange-50 hover:border-orange-300 transition-colors group"
              >
                <div className="flex items-center space-x-3">
                  <CreditCard className="w-5 h-5 text-orange-600 group-hover:text-orange-700" />
                  <div>
                    <h3 className="font-medium text-gray-900">Banner Ads</h3>
                    <p className="text-sm text-gray-600">{stats.totalBannerAds} campaigns</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-1 text-orange-600 hover:bg-orange-100 rounded">
                    <Plus className="w-4 h-4" />
                  </button>
                  <button className="p-1 text-gray-600 hover:bg-gray-100 rounded">
                    <Edit className="w-4 h-4" />
                  </button>
                </div>
              </a>

              <a
                href="/admin/emails"
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-indigo-50 hover:border-indigo-300 transition-colors group"
              >
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-indigo-600 group-hover:text-indigo-700" />
                  <div>
                    <h3 className="font-medium text-gray-900">Email Inquiries</h3>
                    <p className="text-sm text-gray-600">{stats.totalEmails} total, {stats.newEmails} new</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {stats.newEmails > 0 && (
                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                      {stats.newEmails}
                    </span>
                  )}
                  <button className="p-1 text-indigo-600 hover:bg-indigo-100 rounded">
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </a>
            </div>
          </div>

          {/* Analytics & Reports */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <BarChart3 className="w-6 h-6 mr-3 text-purple-600" />
              Analytics & Reports
            </h2>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-3">Performance Overview</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Conversion Rate</p>
                    <p className="font-semibold text-green-600">3.2%</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Avg. Order Value</p>
                    <p className="font-semibold text-blue-600">£45.50</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Click-through Rate</p>
                    <p className="font-semibold text-purple-600">13.9%</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Revenue per Click</p>
                    <p className="font-semibold text-orange-600">£10.00</p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-3">Top Performing Categories</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Electronics</span>
                    <span className="font-semibold">45% of clicks</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Fashion</span>
                    <span className="font-semibold">32% of clicks</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Household</span>
                    <span className="font-semibold">15% of clicks</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Cosmetics</span>
                    <span className="font-semibold">8% of clicks</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <Settings className="w-6 h-6 mr-3 text-gray-600" />
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <a
              href="/admin/products?action=add"
              className="p-4 text-center border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors group"
            >
              <Package className="w-6 h-6 mx-auto mb-2 text-blue-600 group-hover:text-blue-700" />
              <span className="text-sm font-medium text-gray-900">Add Product</span>
            </a>

            <a
              href="/admin/categories?action=add"
              className="p-4 text-center border border-gray-200 rounded-lg hover:bg-green-50 hover:border-green-300 transition-colors group"
            >
              <BarChart3 className="w-6 h-6 mx-auto mb-2 text-green-600 group-hover:text-green-700" />
              <span className="text-sm font-medium text-gray-900">Add Category</span>
            </a>

            <a
              href="/admin/brands?action=add"
              className="p-4 text-center border border-gray-200 rounded-lg hover:bg-purple-50 hover:border-purple-300 transition-colors group"
            >
              <Shield className="w-6 h-6 mx-auto mb-2 text-purple-600 group-hover:text-purple-700" />
              <span className="text-sm font-medium text-gray-900">Add Brand</span>
            </a>

            <a
              href="/admin/banner-ads?action=add"
              className="p-4 text-center border border-gray-200 rounded-lg hover:bg-orange-50 hover:border-orange-300 transition-colors group"
            >
              <CreditCard className="w-6 h-6 mx-auto mb-2 text-orange-600 group-hover:text-orange-700" />
              <span className="text-sm font-medium text-gray-900">Create Ad</span>
            </a>

            <a
              href="/admin/analytics"
              className="p-4 text-center border border-gray-200 rounded-lg hover:bg-indigo-50 hover:border-indigo-300 transition-colors group"
            >
              <BarChart3 className="w-6 h-6 mx-auto mb-2 text-indigo-600 group-hover:text-indigo-700" />
              <span className="text-sm font-medium text-gray-900">View Reports</span>
            </a>

            <a
              href="/admin/settings"
              className="p-4 text-center border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors group"
            >
              <Settings className="w-6 h-6 mx-auto mb-2 text-gray-600 group-hover:text-gray-700" />
              <span className="text-sm font-medium text-gray-900">Settings</span>
            </a>
          </div>
        </div>
      </div>
    </AdminLayout>
    </AdminAuthWrapper>
  );
}