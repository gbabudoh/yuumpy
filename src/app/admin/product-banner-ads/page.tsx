'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Calendar, PoundSterling, Eye, EyeOff, Trash2 } from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';

interface ProductBannerAd {
  id: number;
  title: string;
  description: string;
  image_url: string;
  link_url?: string;
  is_active: boolean;
  start_date?: string;
  end_date?: string;
  expires_at?: string;
  duration?: string;
  is_repeating?: boolean;
  created_at: string;
}

export default function ProductBannerAdsPage() {
  const [bannerAds, setBannerAds] = useState<ProductBannerAd[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingAd, setEditingAd] = useState<ProductBannerAd | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image_url: '',
    link_url: '',
    is_active: true,
    start_date: '',
    end_date: '',
    duration: '1_week' as '1_week' | '2_weeks' | '3_weeks' | '4_weeks' | '6_months',
    is_repeating: false
  });
  const [submitting, setSubmitting] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    fetchBannerAds();
  }, []);

  const fetchBannerAds = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/product-banner-ads?t=${Date.now()}`);
      
      if (response.ok) {
        const data = await response.json();
        setBannerAds(Array.isArray(data) ? data : []);
      } else {
        setBannerAds([]);
      }
    } catch (error) {
      console.error('Error fetching product banner ads:', error);
      setBannerAds([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateEndDate = (startDate: string, duration: string) => {
    if (!startDate) return '';
    
    const start = new Date(startDate);
    const endDate = new Date(start);
    
    switch (duration) {
      case '1_week':
        endDate.setDate(start.getDate() + 7);
        break;
      case '2_weeks':
        endDate.setDate(start.getDate() + 14);
        break;
      case '3_weeks':
        endDate.setDate(start.getDate() + 21);
        break;
      case '4_weeks':
        endDate.setDate(start.getDate() + 28);
        break;
      case '6_months':
        endDate.setMonth(start.getMonth() + 6);
        break;
    }
    
    return endDate.toISOString().split('T')[0];
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (!selectedImage && !imagePreview && !editingAd) {
        alert('Please upload a banner image');
        setSubmitting(false);
        return;
      }

      let imageUrl = formData.image_url;

      if (selectedImage) {
        const formDataUpload = new FormData();
        formDataUpload.append('file', selectedImage);

        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formDataUpload });

        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json();
          imageUrl = uploadData.url;
        } else {
          alert('Failed to upload image');
          setSubmitting(false);
          return;
        }
      } else if (imagePreview && !selectedImage && editingAd) {
        imageUrl = editingAd.image_url || imagePreview;
      }

      let calculatedEndDate = formData.end_date;
      if (formData.start_date && formData.duration) {
        calculatedEndDate = calculateEndDate(formData.start_date, formData.duration);
      }

      const requestData = {
        ...formData,
        image_url: imageUrl,
        end_date: calculatedEndDate,
        expires_at: calculatedEndDate ? new Date(calculatedEndDate).toISOString() : null
      };

      const url = editingAd ? `/api/product-banner-ads/${editingAd.id}` : '/api/product-banner-ads';
      const method = editingAd ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json' },
        body: JSON.stringify(requestData) });

      if (response.ok) {
        const data = await response.json();
        
        if (editingAd) {
          setBannerAds(prev => prev.map(ad => ad.id === editingAd.id ? data : ad));
        } else {
          setBannerAds(prev => [...prev, data]);
        }
        resetForm();
        setShowCreateForm(false);
        setEditingAd(null);
        alert(editingAd ? 'Product banner ad updated successfully!' : 'Product banner ad created successfully!');
        
        await fetchBannerAds();
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to save product banner ad');
      }
    } catch (error) {
      console.error('Error saving product banner ad:', error);
      alert('An error occurred while saving the product banner ad');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      image_url: '',
      link_url: '',
      is_active: true,
      start_date: '',
      end_date: '',
      duration: '1_week',
      is_repeating: false
    });
    setSelectedImage(null);
    setImagePreview(null);
  };

  const handleEdit = (ad: any) => {
    try {
      if (!ad) {
        console.error('Product banner ad is null or undefined');
        alert('Error: No product banner ad data provided');
        return;
      }
      
      setEditingAd(ad);
      setFormData({
        title: ad.title || '',
        description: ad.description || '',
        image_url: ad.image_url || '',
        link_url: ad.link_url || '',
        is_active: ad.is_active !== undefined ? ad.is_active : true,
        start_date: ad.start_date || '',
        end_date: ad.end_date || '',
        duration: ad.duration || '1_week',
        is_repeating: ad.is_repeating || false
      });
      setImagePreview(ad.image_url || null);
      setSelectedImage(null);
      setShowCreateForm(true);
    } catch (error) {
      console.error('Error in handleEdit:', error);
      alert('Error editing product banner ad: ' + error.message);
    }
  };

  const handleCancel = () => {
    resetForm();
    setShowCreateForm(false);
    setEditingAd(null);
  };

  const handleToggleActive = async (id: number, isActive: boolean) => {
    try {
      const response = await fetch(`/api/product-banner-ads/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !isActive }) });

      if (response.ok) {
        setBannerAds(prev => 
          prev.map(ad => 
            ad.id === id ? { ...ad, is_active: !isActive } : ad
          )
        );
      }
    } catch (error) {
      console.error('Error toggling product banner ad:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this product banner ad?')) {
      return;
    }

    try {
      const response = await fetch(`/api/product-banner-ads/${id}`, {
        method: 'DELETE' });

      if (response.ok) {
        setBannerAds(prev => prev.filter(ad => ad.id !== id));
      }
    } catch (error) {
      console.error('Error deleting product banner ad:', error);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading product banner ads...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div>
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Product Page Banner Ads</h1>
            <p className="text-gray-600">Manage banner ads that appear on product pages below product details</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={fetchBannerAds}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center cursor-pointer"
            >
              <span>Refresh</span>
            </button>
            <button
              onClick={() => setShowCreateForm(true)}
              className="text-white px-6 py-3 rounded-lg transition-colors flex items-center space-x-2 cursor-pointer hover:bg-purple-700"
            style={{ backgroundColor: '#8827ee' }}
            >
              <Plus className="w-5 h-5" />
              <span>Create Product Banner Ad</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Product Ads</p>
                <p className="text-3xl font-bold text-gray-900">{bannerAds.length}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <PoundSterling className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Active Ads</p>
                <p className="text-3xl font-bold text-gray-900">
                  {Array.isArray(bannerAds) ? bannerAds.filter(ad => ad.is_active).length : 0}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <Eye className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">This Month</p>
                <p className="text-3xl font-bold text-gray-900">£1,250</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Banner Ads Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Product Page Banner Ads</h3>
          </div>
          
          {bannerAds.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <PoundSterling className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Product Banner Ads</h3>
              <p className="text-gray-600 mb-6">Create your first product banner ad to start earning revenue</p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="text-white px-6 py-3 rounded-lg transition-colors cursor-pointer hover:bg-purple-700"
                style={{ backgroundColor: '#8827ee' }}
              >
                Create Product Banner Ad
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ad Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Duration
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {bannerAds.map((ad, index) => {
                    if (!ad || !ad.id) {
                      console.warn('Invalid product banner ad at index:', index, ad);
                      return null;
                    }
                    return (
                    <tr key={`product-banner-${ad.id}-${index}`} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-16 w-16">
                            <img
                              className="h-16 w-16 rounded-lg object-cover"
                              src={ad.image_url || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwMCIgaGVpZ2h0PSI2MDAiIHZpZXdCb3g9IjAgMCAxMjAwIDYwMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjEyMDAiIGhlaWdodD0iNjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik01NjAgMjAwSDY0MFY0MDBINjAwVjI0MEg1NjBWMjAwWiIgZmlsbD0iIzlDQTNBRiIvPgo8cGF0aCBkPSJNNTIwIDI0MEg2ODBWMzYwSDY0MFYzMjBINTIwVjI0MFoiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+'}
                              alt={ad.title || 'Product Banner Ad'}
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {ad.title || 'Untitled Banner'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {ad.description || 'No description'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleToggleActive(ad.id, ad.is_active)}
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold cursor-pointer ${
                            ad.is_active
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {ad.is_active ? (
                            <span>
                              <Eye className="w-3 h-3 mr-1" />
                              Active
                            </span>
                          ) : (
                            <span>
                              <EyeOff className="w-3 h-3 mr-1" />
                              Inactive
                            </span>
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {ad.duration || 'Not set'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              console.log('🔍 Edit button clicked for product ad:', ad);
                              handleEdit(ad);
                            }}
                            className="text-blue-600 hover:text-blue-900 cursor-pointer"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(ad.id)}
                            className="text-red-600 hover:text-red-900 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Create/Edit Form Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {editingAd ? 'Edit Product Banner Ad' : 'Create Product Banner Ad'}
                  </h3>
                  <button
                    onClick={handleCancel}
                    className="text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter banner title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Enter banner description"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Banner Image *
                  </label>
                  <div className="space-y-4">
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Upload a banner image (JPG, PNG, GIF - Recommended: 400x200px)
                      </p>
                    </div>

                    {(imagePreview || selectedImage) && (
                      <div className="mt-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
                        <div className="relative inline-block">
                          <img
                            src={imagePreview || (selectedImage ? URL.createObjectURL(selectedImage) : '')}
                            alt="Banner preview"
                            className="max-w-full h-32 object-cover rounded-lg border border-gray-300"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Link URL
                  </label>
                  <input
                    type="url"
                    value={formData.link_url}
                    onChange={(e) => setFormData({...formData, link_url: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://example.com"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.start_date}
                      onChange={(e) => {
                        const newStartDate = e.target.value;
                        const newEndDate = formData.duration ? calculateEndDate(newStartDate, formData.duration) : '';
                        setFormData({
                          ...formData, 
                          start_date: newStartDate,
                          end_date: newEndDate
                        });
                      }}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duration *
                    </label>
                    <select
                      value={formData.duration}
                      onChange={(e) => {
                        const newDuration = e.target.value as typeof formData.duration;
                        const newEndDate = formData.start_date ? calculateEndDate(formData.start_date, newDuration) : '';
                        setFormData({
                          ...formData, 
                          duration: newDuration,
                          end_date: newEndDate
                        });
                      }}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="1_week">1 Week</option>
                      <option value="2_weeks">2 Weeks</option>
                      <option value="3_weeks">3 Weeks</option>
                      <option value="4_weeks">4 Weeks</option>
                      <option value="6_months">6 Months</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date (Auto-calculated)
                  </label>
                  <input
                    type="date"
                    value={formData.end_date}
                    readOnly
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    End date is automatically calculated based on start date and duration
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="is_active"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700">
                      Active (visible to users)
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="is_repeating"
                      checked={formData.is_repeating}
                      onChange={(e) => setFormData({...formData, is_repeating: e.target.checked})}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="is_repeating" className="ml-2 block text-sm text-gray-700">
                      Repeating campaign (automatically renew after expiration)
                    </label>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-6">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-3 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 cursor-pointer hover:bg-purple-700"
                    style={{ backgroundColor: '#8827ee' }}
                  >
                    {submitting ? (
                      <span className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Saving...</span>
                      </span>
                    ) : (
                      <span>{editingAd ? 'Update Product Banner Ad' : 'Create Product Banner Ad'}</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}