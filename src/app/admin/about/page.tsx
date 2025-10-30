'use client';

import { useState, useEffect } from 'react';
import { FileText, Save, X, Eye } from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';

interface PageContent {
  id: string;
  title: string;
  slug: string;
  content: string;
  meta_title?: string;
  meta_description?: string;
  is_active: boolean;
  updated_at: string;
}

export default function AboutPageManagement() {
  const [pageContent, setPageContent] = useState<PageContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    meta_title: '',
    meta_description: '',
    is_active: true
  });

  useEffect(() => {
    fetchPageContent();
  }, []);

  const fetchPageContent = async () => {
    try {
      const response = await fetch('/api/pages?slug=about');
      if (response.ok) {
        const data = await response.json();
        if (data) {
          setPageContent(data);
          setFormData({
            title: data.title,
            content: data.content,
            meta_title: data.meta_title || '',
            meta_description: data.meta_description || '',
            is_active: data.is_active
          });
        }
      }
    } catch (error) {
      console.error('Error fetching page content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const url = pageContent ? `/api/pages/${pageContent.id}` : '/api/pages';
      const method = pageContent ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          slug: 'about'
        })
      });

      if (response.ok) {
        alert('About page updated successfully!');
        fetchPageContent();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to save page');
      }
    } catch (error) {
      console.error('Error saving page:', error);
      alert('An error occurred while saving the page');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading About page content...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">About Page Management</h1>
            <p className="text-gray-600 mt-2">Update the content for the About Us page</p>
          </div>
          <div className="flex items-center space-x-4">
            <a
              href="/about"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2 cursor-pointer"
            >
              <Eye className="w-4 h-4" />
              <span>Preview Page</span>
            </a>
          </div>
        </div>

        {/* Content Form */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Page Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="About Us"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meta Title (SEO)
                </label>
                <input
                  type="text"
                  value={formData.meta_title}
                  onChange={(e) => setFormData({...formData, meta_title: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="About Us - Yuumpy"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meta Description (SEO)
                </label>
                <input
                  type="text"
                  value={formData.meta_description}
                  onChange={(e) => setFormData({...formData, meta_description: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Learn about Yuumpy, your trusted affiliate marketplace platform."
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Page Content *
                </label>
                <textarea
                  rows={20}
                  required
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                  placeholder="Enter page content (HTML supported)"
                />
                <p className="text-xs text-gray-500 mt-1">
                  You can use HTML tags for formatting. Use Tailwind CSS classes for styling.
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Page Active</span>
              </label>
            </div>

            <div className="flex justify-end space-x-4 pt-6">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 text-white rounded-lg transition-colors flex items-center space-x-2 disabled:opacity-50 cursor-pointer hover:bg-purple-700"
                style={{ backgroundColor: '#8827ee' }}
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Last Updated Info */}
        {pageContent && (
          <div className="mt-6 text-sm text-gray-500">
            Last updated: {new Date(pageContent.updated_at).toLocaleString()}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}