'use client';

import { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Users, 
  Eye, 
  MousePointer, 
  DollarSign,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  Globe,
  Smartphone,
  Monitor,
  Tablet
} from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';

interface AnalyticsData {
  overview: {
    totalViews: number;
    totalClicks: number;
    totalRevenue: number;
    conversionRate: number;
    bounceRate: number;
    avgSessionDuration: number;
  };
  traffic: {
    date: string;
    views: number;
    clicks: number;
    revenue: number;
  }[];
  topPages: {
    page: string;
    views: number;
    clicks: number;
    conversionRate: number;
  }[];
  deviceStats: {
    desktop: number;
    mobile: number;
    tablet: number;
  };
  referrers: {
    source: string;
    visits: number;
    percentage: number;
  }[];
  goals: {
    name: string;
    completions: number;
    conversionRate: number;
  }[];
}

export default function AnalyticsDashboard() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('7d');
  const [selectedMetric, setSelectedMetric] = useState('views');

  useEffect(() => {
    fetchAnalyticsData();
  }, [dateRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      
      // Fetch real analytics data from API
      const response = await fetch(`/api/analytics/dashboard?dateRange=${dateRange}`);
      if (!response.ok) {
        throw new Error('Failed to fetch analytics data');
      }
      
      const apiData = await response.json();
      
      // Transform API data to match component interface
      const transformedData: AnalyticsData = {
        overview: apiData.overview,
        traffic: apiData.traffic,
        topPages: apiData.topPages,
        deviceStats: apiData.deviceStats,
        referrers: apiData.referrers,
        goals: apiData.goals
      };
      
      setAnalyticsData(transformedData);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const getPercentageChange = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading analytics...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!analyticsData) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Analytics Data</h3>
          <p className="text-gray-600">Analytics data will appear here once tracking is set up.</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div>
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
              <p className="text-gray-600">Track your website performance and user behavior</p>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>
              <button
                onClick={fetchAnalyticsData}
                className="flex items-center px-4 py-2 text-white rounded-lg transition-colors cursor-pointer hover:bg-purple-700"
                style={{ backgroundColor: '#8827ee' }}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Views</p>
                <p className="text-3xl font-bold text-gray-900">{formatNumber(analyticsData.overview.totalViews)}</p>
              </div>
              <Eye className="w-8 h-8 text-blue-600" />
            </div>
            <div className="mt-4 flex items-center text-sm text-green-600">
              <TrendingUp className="w-4 h-4 mr-1" />
              <span>+12% from last period</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Clicks</p>
                <p className="text-3xl font-bold text-gray-900">{formatNumber(analyticsData.overview.totalClicks)}</p>
              </div>
              <MousePointer className="w-8 h-8 text-green-600" />
            </div>
            <div className="mt-4 flex items-center text-sm text-green-600">
              <TrendingUp className="w-4 h-4 mr-1" />
              <span>+8% from last period</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-3xl font-bold text-gray-900">£{formatNumber(analyticsData.overview.totalRevenue)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-purple-600" />
            </div>
            <div className="mt-4 flex items-center text-sm text-green-600">
              <TrendingUp className="w-4 h-4 mr-1" />
              <span>+15% from last period</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                <p className="text-3xl font-bold text-gray-900">{analyticsData.overview.conversionRate}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-orange-600" />
            </div>
            <div className="mt-4 flex items-center text-sm text-green-600">
              <TrendingUp className="w-4 h-4 mr-1" />
              <span>+0.3% from last period</span>
            </div>
          </div>
        </div>

        {/* Charts and Detailed Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Traffic Chart */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <BarChart3 className="w-6 h-6 mr-3 text-blue-600" />
              Traffic Overview
            </h2>
            <div className="h-64 flex items-end justify-between space-x-2">
              {analyticsData.traffic.map((day, index) => (
                <div key={index} className="flex flex-col items-center flex-1">
                  <div className="w-full bg-blue-200 rounded-t" style={{ height: `${(day.views / 2000) * 200}px` }}></div>
                  <div className="text-xs text-gray-600 mt-2">
                    {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                  <div className="text-xs font-medium text-gray-900">{day.views}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Device Stats */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <Globe className="w-6 h-6 mr-3 text-green-600" />
              Device Breakdown
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Monitor className="w-5 h-5 text-blue-600 mr-3" />
                  <span className="text-gray-700">Desktop</span>
                </div>
                <div className="flex items-center">
                  <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${analyticsData.deviceStats.desktop}%` }}></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{analyticsData.deviceStats.desktop}%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Smartphone className="w-5 h-5 text-green-600 mr-3" />
                  <span className="text-gray-700">Mobile</span>
                </div>
                <div className="flex items-center">
                  <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: `${analyticsData.deviceStats.mobile}%` }}></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{analyticsData.deviceStats.mobile}%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Tablet className="w-5 h-5 text-purple-600 mr-3" />
                  <span className="text-gray-700">Tablet</span>
                </div>
                <div className="flex items-center">
                  <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                    <div className="bg-purple-600 h-2 rounded-full" style={{ width: `${analyticsData.deviceStats.tablet}%` }}></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{analyticsData.deviceStats.tablet}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Top Pages and Referrers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Top Pages */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <Eye className="w-6 h-6 mr-3 text-purple-600" />
              Top Pages
            </h2>
            <div className="space-y-4">
              {analyticsData.topPages.map((page, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{page.page}</p>
                    <p className="text-sm text-gray-600">{formatNumber(page.views)} views</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{formatNumber(page.clicks)} clicks</p>
                    <p className="text-sm text-green-600">{page.conversionRate}% conversion</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Traffic Sources */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <Globe className="w-6 h-6 mr-3 text-orange-600" />
              Traffic Sources
            </h2>
            <div className="space-y-4">
              {analyticsData.referrers.map((source, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{source.source}</p>
                    <p className="text-sm text-gray-600">{formatNumber(source.visits)} visits</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{source.percentage}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Goals and Conversions */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <TrendingUp className="w-6 h-6 mr-3 text-green-600" />
            Goals & Conversions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {analyticsData.goals.map((goal, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">{goal.name}</h3>
                <p className="text-2xl font-bold text-gray-900 mb-1">{formatNumber(goal.completions)}</p>
                <p className="text-sm text-green-600">{goal.conversionRate}% conversion rate</p>
              </div>
            ))}
          </div>
        </div>

        {/* Analytics Integration Status */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-blue-900 mb-4">Analytics Integration Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center justify-between p-4 bg-white rounded-lg">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                <span className="font-medium text-gray-900">Google Analytics</span>
              </div>
              <span className="text-sm text-green-600">Active</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-white rounded-lg">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                <span className="font-medium text-gray-900">Matomo Analytics</span>
              </div>
              <span className="text-sm text-green-600">Active</span>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}