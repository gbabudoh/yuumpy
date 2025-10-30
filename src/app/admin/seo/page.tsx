'use client';

import { useState, useEffect } from 'react';
import { Search, Save, EyeOff } from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';

interface SEOSettings {
  id?: number;
  page_type: string;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
  og_title?: string;
  og_description?: string;
  og_image?: string;
  twitter_title?: string;
  twitter_description?: string;
  twitter_image?: string;
  no_index: boolean;
  no_follow: boolean;
}

const PAGE_TYPES = [
  { value: 'home', label: 'Homepage' },
  { value: 'products', label: 'All Products' },
  { value: 'categories', label: 'Categories' },
  { value: 'about', label: 'About Page' },
  { value: 'advert', label: 'Advertising Page' },
  { value: 'privacy-policy', label: 'Privacy Policy' },
  { value: 'terms', label: 'Terms of Service' },
];

export default function SEOManagementPage() {
  const [settings, setSettings] = useState<SEOSettings[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedPageType, setSelectedPageType] = useState('home');
  const [currentSettings, setCurrentSettings] = useState<SEOSettings>({
    page_type: 'home',
    no_index: false,
    no_follow: false });

  useEffect(() => {
    fetchSEOSettings();
  }, []);

  useEffect(() => {
    const setting = settings.find(s => s.page_type === selectedPageType);
    if (setting) {
      setCurrentSettings(setting);
    } else {
      setCurrentSettings({
        page_type: selectedPageType,
        no_index: false,
        no_follow: false });
    }
  }, [selectedPageType, settings]);

  const fetchSEOSettings = async () => {
    try {
      const response = await fetch('/api/seo/settings', {
        method: 'POST' });
      const data = await response.json();
      
      if (data.success) {
        setSettings(data.data);
      }
    } catch (error) {
      console.error('Error fetching SEO settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/seo/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json' },
        body: JSON.stringify(currentSettings) });
      
      const data = await response.json();
      
      if (data.success) {
        // Update local settings
        const updatedSettings = settings.filter(s => s.page_type !== selectedPageType);
        updatedSettings.push(currentSettings);
        setSettings(updatedSettings);
        
        alert('SEO settings saved successfully!');
      } else {
        alert('Error saving SEO settings: ' + data.error);
      }
    } catch (error) {
      console.error('Error saving SEO settings:', error);
      alert('Error saving SEO settings');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof SEOSettings, value: string | boolean) => {
    setCurrentSettings(prev => ({
      ...prev,
      [field]: value }));
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900">SEO Management</h2>
          <p className="text-gray-600">Manage SEO settings for different pages across your website</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Page Type Selector */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Page Types</h3>
              <div className="space-y-2">
                {PAGE_TYPES.map((pageType) => (
                  <button
                    key={pageType.value}
                    onClick={() => setSelectedPageType(pageType.value)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors cursor-pointer ${
                      selectedPageType === pageType.value
                        ? 'bg-purple-100 text-purple-700 border border-purple-200'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {pageType.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* SEO Settings Form */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  SEO Settings - {PAGE_TYPES.find(p => p.value === selectedPageType)?.label}
                </h3>
                <button
                  onClick={saveSettings}
                  disabled={saving}
                  className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Saving...' : 'Save Settings'}</span>
                </button>
              </div>

              <div className="space-y-6">
                {/* Basic Meta Tags */}
                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-gray-900">Basic Meta Tags</h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Meta Title
                    </label>
                    <input
                      type="text"
                      value={currentSettings.meta_title || ''}
                      onChange={(e) => handleInputChange('meta_title', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Enter meta title..."
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Recommended: 50-60 characters
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Meta Description
                    </label>
                    <textarea
                      value={currentSettings.meta_description || ''}
                      onChange={(e) => handleInputChange('meta_description', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Enter meta description..."
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Recommended: 150-160 characters
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Meta Keywords
                    </label>
                    <input
                      type="text"
                      value={currentSettings.meta_keywords || ''}
                      onChange={(e) => handleInputChange('meta_keywords', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Enter keywords separated by commas..."
                    />
                  </div>
                </div>

                {/* Open Graph Tags */}
                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-gray-900">Open Graph (Facebook)</h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      OG Title
                    </label>
                    <input
                      type="text"
                      value={currentSettings.og_title || ''}
                      onChange={(e) => handleInputChange('og_title', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Enter Open Graph title..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      OG Description
                    </label>
                    <textarea
                      value={currentSettings.og_description || ''}
                      onChange={(e) => handleInputChange('og_description', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Enter Open Graph description..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      OG Image URL
                    </label>
                    <input
                      type="url"
                      value={currentSettings.og_image || ''}
                      onChange={(e) => handleInputChange('og_image', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Enter image URL..."
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Recommended: 1200x630 pixels
                    </p>
                  </div>
                </div>

                {/* Twitter Tags */}
                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-gray-900">Twitter Cards</h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Twitter Title
                    </label>
                    <input
                      type="text"
                      value={currentSettings.twitter_title || ''}
                      onChange={(e) => handleInputChange('twitter_title', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Enter Twitter title..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Twitter Description
                    </label>
                    <textarea
                      value={currentSettings.twitter_description || ''}
                      onChange={(e) => handleInputChange('twitter_description', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Enter Twitter description..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Twitter Image URL
                    </label>
                    <input
                      type="url"
                      value={currentSettings.twitter_image || ''}
                      onChange={(e) => handleInputChange('twitter_image', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Enter image URL..."
                    />
                  </div>
                </div>

                {/* Indexing Options */}
                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-gray-900">Indexing Options</h4>
                  
                  <div className="space-y-3">
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={currentSettings.no_index}
                        onChange={(e) => handleInputChange('no_index', e.target.checked)}
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <div className="flex items-center space-x-2">
                        <EyeOff className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-700">No Index (Prevent search engines from indexing this page)</span>
                      </div>
                    </label>

                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={currentSettings.no_follow}
                        onChange={(e) => handleInputChange('no_follow', e.target.checked)}
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <div className="flex items-center space-x-2">
                        <EyeOff className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-700">No Follow (Prevent search engines from following links on this page)</span>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}