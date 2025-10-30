'use client';

import { useState, useEffect } from 'react';
import { 
  Settings, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Save,
  TestTube,
  Eye,
  BarChart3,
  Globe,
  Shield
} from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';

interface AnalyticsConfig {
  googleAnalytics: {
    enabled: boolean;
    trackingId: string;
    propertyId: string;
    accessToken: string;
    status: 'connected' | 'disconnected' | 'error';
  };
  matomo: {
    enabled: boolean;
    url: string;
    siteId: string;
    status: 'connected' | 'disconnected' | 'error';
  };
  customEvents: {
    productViews: boolean;
    bannerClicks: boolean;
    emailSignups: boolean;
    purchases: boolean;
  };
  privacy: {
    anonymizeIP: boolean;
    respectDoNotTrack: boolean;
    cookieConsent: boolean;
  };
}

export default function AnalyticsSettings() {
  const [config, setConfig] = useState<AnalyticsConfig>({
    googleAnalytics: {
      enabled: false,
      trackingId: '',
      propertyId: '',
      accessToken: '',
      status: 'disconnected'
    },
    matomo: {
      enabled: false,
      url: '',
      siteId: '',
      status: 'disconnected'
    },
    customEvents: {
      productViews: true,
      bannerClicks: true,
      emailSignups: true,
      purchases: true
    },
    privacy: {
      anonymizeIP: true,
      respectDoNotTrack: true,
      cookieConsent: true
    }
  });

  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  useEffect(() => {
    loadCurrentConfig();
  }, []);

  const loadCurrentConfig = async () => {
    try {
      // Load configuration from API instead of environment variables
      const response = await fetch('/api/analytics/settings');
      const result = await response.json();
      
      if (result.success && result.data) {
        // Ensure all properties are defined to prevent controlled/uncontrolled input errors
        const apiConfig = {
          ...result.data,
          googleAnalytics: {
            enabled: result.data.googleAnalytics?.enabled || false,
            trackingId: result.data.googleAnalytics?.trackingId || '',
            propertyId: result.data.googleAnalytics?.propertyId || '',
            accessToken: result.data.googleAnalytics?.accessToken || '',
            status: result.data.googleAnalytics?.status || 'disconnected'
          },
          matomo: {
            enabled: result.data.matomo?.enabled || false,
            url: result.data.matomo?.url || '',
            siteId: result.data.matomo?.siteId || '',
            status: result.data.matomo?.status || 'disconnected'
          },
          customEvents: {
            productViews: result.data.customEvents?.productViews || true,
            bannerClicks: result.data.customEvents?.bannerClicks || true,
            emailSignups: result.data.customEvents?.emailSignups || true,
            purchases: result.data.customEvents?.purchases || true
          },
          privacy: {
            anonymizeIP: result.data.privacy?.anonymizeIP || true,
            respectDoNotTrack: result.data.privacy?.respectDoNotTrack || true,
            cookieConsent: result.data.privacy?.cookieConsent || true
          }
        };
        setConfig(apiConfig);
      } else {
        // Fallback to environment variables if no saved config
        const hasFrontendTracking = !!process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID;
        const hasAPICredentials = !!(process.env.GOOGLE_ANALYTICS_PROPERTY_ID && process.env.GOOGLE_ANALYTICS_ACCESS_TOKEN);
        
        const currentConfig: AnalyticsConfig = {
          googleAnalytics: {
            enabled: hasFrontendTracking,
            trackingId: process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID || '',
            propertyId: process.env.GOOGLE_ANALYTICS_PROPERTY_ID || '',
            accessToken: process.env.GOOGLE_ANALYTICS_ACCESS_TOKEN || '',
            status: hasFrontendTracking ? (hasAPICredentials ? 'connected' : 'connected') : 'disconnected'
          },
          matomo: {
            enabled: !!(process.env.NEXT_PUBLIC_MATOMO_URL && process.env.NEXT_PUBLIC_MATOMO_SITE_ID),
            url: process.env.NEXT_PUBLIC_MATOMO_URL || '',
            siteId: process.env.NEXT_PUBLIC_MATOMO_SITE_ID || '',
            status: !!(process.env.NEXT_PUBLIC_MATOMO_URL && process.env.NEXT_PUBLIC_MATOMO_SITE_ID) ? 'connected' : 'disconnected'
          },
          customEvents: {
            productViews: true,
            bannerClicks: true,
            emailSignups: true,
            purchases: true
          },
          privacy: {
            anonymizeIP: true,
            respectDoNotTrack: true,
            cookieConsent: true
          }
        };
        
        setConfig(currentConfig);
      }
    } catch (error) {
      console.error('Error loading analytics config:', error);
      setMessage({ type: 'error', text: 'Failed to load analytics configuration' });
    }
  };

  const testConnection = async (service: 'google' | 'matomo') => {
    setTesting(service);
    setMessage(null);

    // For Google Analytics, if we only have frontend tracking, show a helpful message
    if (service === 'google' && config.googleAnalytics.enabled && !process.env.GOOGLE_ANALYTICS_PROPERTY_ID) {
      setMessage({ 
        type: 'info', 
        text: 'Google Analytics frontend tracking is working! API testing requires GOOGLE_ANALYTICS_PROPERTY_ID and GOOGLE_ANALYTICS_ACCESS_TOKEN, but these are only needed for advanced admin features.' 
      });
      setTesting(null);
      return;
    }

    try {
      const response = await fetch(`/api/analytics/test-connection?service=${service}`);
      const result = await response.json();

      if (result.success) {
        setMessage({ type: 'success', text: `${service === 'google' ? 'Google Analytics' : 'Matomo'} connection successful!` });
        setConfig(prev => ({
          ...prev,
          [service === 'google' ? 'googleAnalytics' : 'matomo']: {
            ...prev[service === 'google' ? 'googleAnalytics' : 'matomo'],
            status: 'connected'
          }
        }));
      } else {
        setMessage({ type: 'error', text: `${service === 'google' ? 'Google Analytics' : 'Matomo'} connection failed: ${result.error}` });
        setConfig(prev => ({
          ...prev,
          [service === 'google' ? 'googleAnalytics' : 'matomo']: {
            ...prev[service === 'google' ? 'googleAnalytics' : 'matomo'],
            status: 'error'
          }
        }));
      }
    } catch (error) {
      setMessage({ type: 'error', text: `Failed to test ${service === 'google' ? 'Google Analytics' : 'Matomo'} connection` });
    } finally {
      setTesting(null);
    }
  };

  const saveConfig = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/analytics/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json' },
        body: JSON.stringify(config) });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Analytics settings saved successfully!' });
      } else {
        throw new Error('Failed to save settings');
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save analytics settings' });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'connected':
        return 'Connected';
      case 'error':
        return 'Connection Error';
      default:
        return 'Not Connected';
    }
  };

  return (
    <AdminLayout>
      <div>
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics Settings</h1>
          <p className="text-gray-600">Configure and manage your analytics tracking services</p>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg flex items-center ${
            message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' :
            message.type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' :
            'bg-blue-50 text-blue-800 border border-blue-200'
          }`}>
            {message.type === 'success' ? <CheckCircle className="w-5 h-5 mr-2" /> :
             message.type === 'error' ? <XCircle className="w-5 h-5 mr-2" /> :
             <AlertCircle className="w-5 h-5 mr-2" />}
            {message.text}
          </div>
        )}

        <div className="space-y-8">
          {/* Google Analytics Configuration */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <BarChart3 className="w-6 h-6 text-blue-600 mr-3" />
                <h2 className="text-xl font-semibold text-gray-900">Google Analytics</h2>
              </div>
              <div className="flex items-center space-x-2">
                {getStatusIcon(config.googleAnalytics.status)}
                <span className="text-sm font-medium text-gray-700">
                  {getStatusText(config.googleAnalytics.status)}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              {/* Information Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-blue-600 mr-2 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Google Analytics Configuration</p>
                    <p className="mb-2">There are two types of Google Analytics integration:</p>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      <li><strong>Frontend Tracking:</strong> Uses NEXT_PUBLIC_GOOGLE_ANALYTICS_ID for basic page tracking (required)</li>
                      <li><strong>API Access:</strong> Uses GOOGLE_ANALYTICS_PROPERTY_ID and GOOGLE_ANALYTICS_ACCESS_TOKEN for advanced analytics data (optional)</li>
                    </ul>
                    <p className="text-xs mt-2 text-blue-700">
                      <strong>Note:</strong> API credentials are only needed for advanced analytics features in the admin panel. Basic tracking works without them.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="ga-enabled"
                  checked={config.googleAnalytics.enabled}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    googleAnalytics: { ...prev.googleAnalytics, enabled: e.target.checked }
                  }))}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="ga-enabled" className="ml-2 text-sm font-medium text-gray-700">
                  Enable Google Analytics tracking
                </label>
              </div>

              <div>
                <label htmlFor="ga-tracking-id" className="block text-sm font-medium text-gray-700 mb-2">
                  Measurement ID (G-XXXXXXXXXX)
                </label>
                <input
                  type="text"
                  id="ga-tracking-id"
                  value={config.googleAnalytics.trackingId}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    googleAnalytics: { ...prev.googleAnalytics, trackingId: e.target.value }
                  }))}
                  placeholder="G-FZF75F0F4P"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="ga-property-id" className="block text-sm font-medium text-gray-700 mb-2">
                  Stream ID (Property ID)
                </label>
                <input
                  type="text"
                  id="ga-property-id"
                  value={config.googleAnalytics.propertyId}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    googleAnalytics: { ...prev.googleAnalytics, propertyId: e.target.value }
                  }))}
                  placeholder="12332331303"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="ga-access-token" className="block text-sm font-medium text-gray-700 mb-2">
                  Access Token (Optional - for advanced features)
                </label>
                <input
                  type="password"
                  id="ga-access-token"
                  value={config.googleAnalytics.accessToken}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    googleAnalytics: { ...prev.googleAnalytics, accessToken: e.target.value }
                  }))}
                  placeholder="ya29.a0AfH6SMC..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={() => testConnection('google')}
                  disabled={testing === 'google'}
                  className="flex items-center px-4 py-2 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer hover:bg-purple-700"
                  style={{ backgroundColor: '#8827ee' }}
                >
                  {testing === 'google' ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <TestTube className="w-4 h-4 mr-2" />
                  )}
                  Test API Connection
                </button>
                
                {/* Show current configuration status */}
                <div className="text-sm text-gray-600 flex items-center">
                  <span className="mr-2">Status:</span>
                  {config.googleAnalytics.enabled ? (
                    <span className="text-green-600 font-medium">Frontend tracking enabled</span>
                  ) : (
                    <span className="text-red-600 font-medium">Not configured</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Matomo Configuration */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <Globe className="w-6 h-6 text-green-600 mr-3" />
                <h2 className="text-xl font-semibold text-gray-900">Matomo Analytics</h2>
              </div>
              <div className="flex items-center space-x-2">
                {getStatusIcon(config.matomo.status)}
                <span className="text-sm font-medium text-gray-700">
                  {getStatusText(config.matomo.status)}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="matomo-enabled"
                  checked={config.matomo.enabled}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    matomo: { ...prev.matomo, enabled: e.target.checked }
                  }))}
                  className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <label htmlFor="matomo-enabled" className="ml-2 text-sm font-medium text-gray-700">
                  Enable Matomo Analytics tracking
                </label>
              </div>

              <div>
                <label htmlFor="matomo-url" className="block text-sm font-medium text-gray-700 mb-2">
                  Matomo URL
                </label>
                <input
                  type="url"
                  id="matomo-url"
                  value={config.matomo.url}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    matomo: { ...prev.matomo, url: e.target.value }
                  }))}
                  placeholder="https://your-matomo-instance.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="matomo-site-id" className="block text-sm font-medium text-gray-700 mb-2">
                  Site ID
                </label>
                <input
                  type="text"
                  id="matomo-site-id"
                  value={config.matomo.siteId}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    matomo: { ...prev.matomo, siteId: e.target.value }
                  }))}
                  placeholder="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={() => testConnection('matomo')}
                  disabled={testing === 'matomo' || !config.matomo.url || !config.matomo.siteId}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {testing === 'matomo' ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <TestTube className="w-4 h-4 mr-2" />
                  )}
                  Test Connection
                </button>
              </div>
            </div>
          </div>

          {/* Custom Events Configuration */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center mb-6">
              <Eye className="w-6 h-6 text-purple-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">Custom Event Tracking</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="product-views"
                  checked={config.customEvents.productViews}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    customEvents: { ...prev.customEvents, productViews: e.target.checked }
                  }))}
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <label htmlFor="product-views" className="ml-2 text-sm font-medium text-gray-700">
                  Track product page views
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="banner-clicks"
                  checked={config.customEvents.bannerClicks}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    customEvents: { ...prev.customEvents, bannerClicks: e.target.checked }
                  }))}
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <label htmlFor="banner-clicks" className="ml-2 text-sm font-medium text-gray-700">
                  Track banner ad clicks
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="email-signups"
                  checked={config.customEvents.emailSignups}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    customEvents: { ...prev.customEvents, emailSignups: e.target.checked }
                  }))}
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <label htmlFor="email-signups" className="ml-2 text-sm font-medium text-gray-700">
                  Track email signups
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="purchases"
                  checked={config.customEvents.purchases}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    customEvents: { ...prev.customEvents, purchases: e.target.checked }
                  }))}
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <label htmlFor="purchases" className="ml-2 text-sm font-medium text-gray-700">
                  Track purchases and conversions
                </label>
              </div>
            </div>
          </div>

          {/* Privacy Settings */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center mb-6">
              <Shield className="w-6 h-6 text-orange-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">Privacy & Compliance</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="anonymize-ip"
                  checked={config.privacy.anonymizeIP}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    privacy: { ...prev.privacy, anonymizeIP: e.target.checked }
                  }))}
                  className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                />
                <label htmlFor="anonymize-ip" className="ml-2 text-sm font-medium text-gray-700">
                  Anonymize IP addresses
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="respect-dnt"
                  checked={config.privacy.respectDoNotTrack}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    privacy: { ...prev.privacy, respectDoNotTrack: e.target.checked }
                  }))}
                  className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                />
                <label htmlFor="respect-dnt" className="ml-2 text-sm font-medium text-gray-700">
                  Respect Do Not Track headers
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="cookie-consent"
                  checked={config.privacy.cookieConsent}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    privacy: { ...prev.privacy, cookieConsent: e.target.checked }
                  }))}
                  className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                />
                <label htmlFor="cookie-consent" className="ml-2 text-sm font-medium text-gray-700">
                  Require cookie consent before tracking
                </label>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={saveConfig}
              disabled={loading}
              className="flex items-center px-6 py-3 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer hover:bg-purple-700"
              style={{ backgroundColor: '#8827ee' }}
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
