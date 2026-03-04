'use client';

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit, 
  Package, 
  Filter, 
  Search, 
  Trash2, 
  Flower2, 
  Palette, 
  ShoppingBag, 
  Sparkles, 
  Flame, 
  Wind, 
  Sofa, 
  Gamepad2, 
  TreePine, 
  Gift, 
  Home, 
  Gem, 
  UtensilsCrossed, 
  Tag, 
  Bone, 
  Landmark, 
  Leaf, 
  Shirt, 
  Heart, 
  Smartphone, 
  Monitor, 
  Apple, 
  type LucideIcon 
} from 'lucide-react';
import Image from 'next/image';
import AdminLayout from '@/components/AdminLayout';

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  image_url: string;
  icon_url: string;
  parent_id: number | null;
  parent_name: string | null;
  sort_order: number;
  is_active: boolean;
  product_count: number;
  created_at: string;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [parentCategories, setParentCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedParent, setSelectedParent] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    parent_id: '',
    sort_order: 0,
    is_active: true
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [selectedIcon, setSelectedIcon] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState<string | null>(null);

  // Category Icon Mapping (Mirroring CategoryCard.tsx)
  const getCategoryIcon = (categoryName: string): LucideIcon => {
    const name = categoryName.toLowerCase();
    if (name.includes('aromatherapy')) return Flower2;
    if (name.includes('arts') || name.includes('crafts')) return Palette;
    if (name.includes('bags')) return ShoppingBag;
    if (name.includes('beauty')) return Sparkles;
    if (name.includes('candles')) return Flame;
    if (name.includes('drinkware')) return Apple;
    if (name.includes('fragrance')) return Wind;
    if (name.includes('furniture')) return Sofa;
    if (name.includes('games') || name.includes('toys')) return Gamepad2;
    if (name.includes('garden') || name.includes('outdoor')) return TreePine;
    if (name.includes('gifts')) return Gift;
    if (name.includes('home decor')) return Home;
    if (name.includes('jewellery')) return Gem;
    if (name.includes('kitchen') || name.includes('dining')) return UtensilsCrossed;
    if (name.includes('licensed') || name.includes('collections')) return Tag;
    if (name.includes('pet')) return Bone;
    if (name.includes('souvenirs')) return Landmark;
    if (name.includes('tea')) return Leaf;
    if (name.includes('unique')) return Sparkles;
    if (name.includes('wearables') || name.includes('fashion')) return Shirt;
    if (name.includes('wellness') || name.includes('self-care')) return Heart;
    if (name.includes('electronics')) return Smartphone;
    if (name.includes('digital')) return Monitor;
    return Package;
  };

  const iconColors: Record<string, { bg: string; text: string; ring: string }> = {
    aromatherapy: { bg: 'bg-pink-50', text: 'text-pink-500', ring: 'ring-pink-200' },
    arts: { bg: 'bg-orange-50', text: 'text-orange-500', ring: 'ring-orange-200' },
    bags: { bg: 'bg-amber-50', text: 'text-amber-600', ring: 'ring-amber-200' },
    beauty: { bg: 'bg-rose-50', text: 'text-rose-500', ring: 'ring-rose-200' },
    candles: { bg: 'bg-yellow-50', text: 'text-yellow-600', ring: 'ring-yellow-200' },
    drinkware: { bg: 'bg-sky-50', text: 'text-sky-500', ring: 'ring-sky-200' },
    fragrance: { bg: 'bg-violet-50', text: 'text-violet-500', ring: 'ring-violet-200' },
    furniture: { bg: 'bg-stone-100', text: 'text-stone-600', ring: 'ring-stone-200' },
    games: { bg: 'bg-indigo-50', text: 'text-indigo-500', ring: 'ring-indigo-200' },
    garden: { bg: 'bg-emerald-50', text: 'text-emerald-500', ring: 'ring-emerald-200' },
    gifts: { bg: 'bg-red-50', text: 'text-red-500', ring: 'ring-red-200' },
    home: { bg: 'bg-teal-50', text: 'text-teal-500', ring: 'ring-teal-200' },
    jewellery: { bg: 'bg-purple-50', text: 'text-purple-500', ring: 'ring-purple-200' },
    kitchen: { bg: 'bg-orange-50', text: 'text-orange-600', ring: 'ring-orange-200' },
    licensed: { bg: 'bg-blue-50', text: 'text-blue-500', ring: 'ring-blue-200' },
    pet: { bg: 'bg-lime-50', text: 'text-lime-600', ring: 'ring-lime-200' },
    souvenirs: { bg: 'bg-cyan-50', text: 'text-cyan-600', ring: 'ring-cyan-200' },
    tea: { bg: 'bg-green-50', text: 'text-green-600', ring: 'ring-green-200' },
    unique: { bg: 'bg-fuchsia-50', text: 'text-fuchsia-500', ring: 'ring-fuchsia-200' },
    wearables: { bg: 'bg-slate-50', text: 'text-slate-600', ring: 'ring-slate-200' },
    wellness: { bg: 'bg-pink-50', text: 'text-pink-500', ring: 'ring-pink-200' },
    default: { bg: 'bg-gray-50', text: 'text-gray-500', ring: 'ring-gray-200' },
  };

  const getColorKey = (name: string): string => {
    const n = name.toLowerCase();
    for (const key of Object.keys(iconColors)) {
      if (key !== 'default' && n.includes(key)) return key;
    }
    return 'default';
  };

  useEffect(() => {
    fetchCategories();
    fetchParentCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchParentCategories = async () => {
    try {
      const response = await fetch('/api/categories?parent_only=true');
      if (response.ok) {
        const data = await response.json();
        setParentCategories(data);
      }
    } catch (error) {
      console.error('Error fetching parent categories:', error);
    }
  };

  const generateUniqueSlug = async (baseSlug: string, excludeId?: number): Promise<string> => {
    let slug = baseSlug;
    let counter = 1;

    while (true) {
      const response = await fetch(`/api/categories/check-slug?slug=${slug}${excludeId ? `&exclude=${excludeId}` : ''}`);
      const data = await response.json();

      if (!data.exists) {
        return slug;
      }

      slug = `${baseSlug}-${counter}`;
      counter++;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const submitButton = e.currentTarget.querySelector('button[type="submit"]') as HTMLButtonElement;
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = editingCategory ? 'Updating...' : 'Creating...';
    }

    try {
      const url = editingCategory ? `/api/categories/${editingCategory.id}` : '/api/categories';
      const method = editingCategory ? 'PUT' : 'POST';

      // Handle image upload
      let imageUrl = '';
      if (selectedImage) {
        imageUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            resolve(e.target?.result as string || '');
          };
          reader.readAsDataURL(selectedImage);
        });
      } else if (editingCategory) {
        imageUrl = editingCategory.image_url || '';
      }

      // Handle icon
      let iconUrl = '';
      if (selectedIcon) {
        if (selectedIcon.size > 50 * 1024) {
          alert('Icon file is too large. Please use a smaller image (max 50KB).');
          return;
        }

        if (iconPreview) {
          iconUrl = iconPreview;
        } else {
          alert('Please wait for image processing to complete.');
          return;
        }
      } else if (editingCategory) {
        const existingIcon = editingCategory.icon_url || '';
        if (existingIcon && existingIcon.length > 4) {
          iconUrl = existingIcon;
        }
      }

      const uniqueSlug = await generateUniqueSlug(formData.slug, editingCategory?.id);

      const requestBody = {
        name: formData.name.trim(),
        slug: uniqueSlug,
        description: (formData.description || '').trim(),
        image_url: imageUrl || '',
        icon_url: iconUrl || '',
        parent_id: formData.parent_id ? parseInt(formData.parent_id) : null,
        sort_order: parseInt(formData.sort_order?.toString() || '0'),
        is_active: Boolean(formData.is_active)
      };

      if (!requestBody.name || !requestBody.slug) {
        throw new Error('Name and slug are required');
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      if (response.ok) {
        await fetchCategories();
        resetForm();
        alert(editingCategory ? 'Category updated successfully!' : 'Category created successfully!');
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Failed to save category' }));
        alert(errorData.error || 'Failed to save category');
      }
    } catch (error) {
      console.error('Error saving category:', error);
      alert(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = editingCategory ? 'Update Category' : 'Add Category';
      }
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      parent_id: category.parent_id?.toString() || '',
      sort_order: category.sort_order,
      is_active: category.is_active
    });
    setSelectedImage(null);

    if (category.icon_url && category.icon_url.length > 4) {
      setIconPreview(category.icon_url);
    } else {
      setIconPreview(null);
    }

    setSelectedIcon(null);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this category?')) {
      try {
        const response = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
        if (response.ok) {
          alert('Category deleted successfully!');
          fetchCategories();
        } else {
          const data = await response.json();
          alert(data.error || 'Failed to delete category');
        }
      } catch (error) {
        console.error('Error deleting category:', error);
        alert('An error occurred');
      }
    }
  };

  const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file.');
        return;
      }

      if (file.size > 500 * 1024) {
        alert('Image file is too large.');
        return;
      }

      setSelectedIcon(file);

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new window.Image();

      img.onload = () => {
        const targetSize = 96;
        canvas.width = targetSize;
        canvas.height = targetSize;
        if (ctx) {
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, targetSize, targetSize);
          const optimizedDataUrl = canvas.toDataURL('image/png');
          setIconPreview(optimizedDataUrl);
        }
      };

      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      description: '',
      parent_id: '',
      sort_order: 0,
      is_active: true
    });
    setSelectedImage(null);
    setSelectedIcon(null);
    setIconPreview(null);
    setEditingCategory(null);
    setShowForm(false);
  };

  const filteredCategories = categories.filter(category => {
    const isMainCategory = category.parent_id === null;
    const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase());
    return isMainCategory && matchesSearch;
  });

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-slate-600 font-medium">Loading categories...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="animate-fadeIn">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Package className="w-5 h-5 text-purple-600" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Inventory Management</span>
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Categories</h1>
            <p className="text-slate-500 font-medium mt-1">Direct taxonomy control & hierarchy management.</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="px-6 py-3 bg-purple-600 rounded-xl text-sm font-bold text-white hover:bg-purple-700 transition-all cursor-pointer shadow-lg shadow-purple-200 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            <span>Add Category</span>
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm mb-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search taxonomy..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:bg-white outline-none transition-all text-sm font-medium"
              />
            </div>
            <select
              value={selectedParent}
              onChange={(e) => setSelectedParent(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:bg-white outline-none transition-all text-sm font-medium"
            >
              <option value="">All Architectures</option>
              <option value="">Main Categories Only</option>
              {parentCategories.map(category => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
            <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl">
              <Filter className="w-4 h-4 text-purple-600" />
              <span className="text-xs font-bold text-slate-600 uppercase tracking-tight">
                {filteredCategories.length} Categories Indexed
              </span>
            </div>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCategories.map((category) => {
            const Icon = getCategoryIcon(category.name);
            const colorKey = getColorKey(category.name);
            const colors = iconColors[colorKey] || iconColors.default;
            
            return (
              <div key={category.id} className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm hover:shadow-xl hover:shadow-purple-100/50 transition-all duration-500 group relative overflow-hidden">
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 rounded-2xl ${colors.bg} flex items-center justify-center text-white ring-4 ring-white shadow-sm group-hover:scale-110 transition-transform duration-500`}>
                        {category.icon_url && category.icon_url.startsWith('data:image/') ? (
                          <Image
                            src={category.icon_url}
                            alt={category.name}
                            width={32}
                            height={32}
                            className="w-8 h-8 object-contain"
                          />
                        ) : (
                          <Icon className={`w-7 h-7 ${colors.text}`} />
                        )}
                      </div>
                      <div>
                        <h3 className="font-black text-slate-900 text-lg leading-tight">{category.name}</h3>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">{category.slug}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${category.is_active
                        ? 'bg-green-50 text-green-600'
                        : 'bg-red-50 text-red-600'
                      }`}>
                      {category.is_active ? 'Online' : 'Offline'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Inventory</span>
                      <span className="text-sm font-black text-slate-900">{category.product_count} Units</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(category)}
                        className="p-2.5 bg-slate-50 text-slate-600 hover:bg-purple-600 hover:text-white rounded-xl transition-all cursor-pointer shadow-sm"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(category.id)}
                        className="p-2.5 bg-slate-50 text-slate-600 hover:bg-red-500 hover:text-white rounded-xl transition-all cursor-pointer shadow-sm"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredCategories.length === 0 && (
          <div className="bg-white rounded-3xl border border-dashed border-slate-200 p-20 text-center">
            <Package className="w-16 h-16 text-slate-200 mx-auto mb-6" />
            <h3 className="text-2xl font-black text-slate-900 mb-2">Null Taxonomy Detected</h3>
            <p className="text-slate-500 font-medium mb-8">No categories matching your current filters were found in the ecosystem.</p>
            <button
              onClick={() => setShowForm(true)}
              className="px-8 py-3 bg-purple-600 rounded-xl text-sm font-bold text-white hover:bg-purple-700 transition-all cursor-pointer shadow-lg shadow-purple-200"
            >
              Initialize Category
            </button>
          </div>
        )}

        {/* Category Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-[100] animate-fadeIn">
            <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/20">
              <div className="p-10">
                <div className="flex items-center justify-between mb-10">
                  <div>
                    <span className="text-[10px] font-black text-purple-600 uppercase tracking-[0.3em] mb-2 block">System Configuration</span>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                      {editingCategory ? 'Modify Category' : 'Register New Category'}
                    </h2>
                  </div>
                  <button onClick={resetForm} className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors cursor-pointer">
                    ✕
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="bg-slate-50/50 p-8 rounded-3xl border border-slate-100">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Taxonomy Level</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { id: 'main', title: 'Main Node', desc: 'Root architecture' },
                        { id: 'sub', title: 'Child Node', desc: 'Category branch' }
                      ].map((item) => (
                        <label key={item.id} className={`flex items-start p-5 border-2 rounded-2xl cursor-pointer transition-all ${
                          (item.id === 'main' ? !formData.parent_id : !!formData.parent_id)
                            ? 'border-purple-600 bg-white shadow-lg shadow-purple-100'
                            : 'border-slate-100 bg-white/50 hover:border-slate-200'
                        }`}>
                          <input
                            type="radio"
                            name="categoryType"
                            checked={item.id === 'main' ? !formData.parent_id : !!formData.parent_id}
                            onChange={() => setFormData({ 
                              ...formData, 
                              parent_id: item.id === 'main' ? '' : (parentCategories[0]?.id.toString() || '') 
                            })}
                            className="mt-1 mr-3 accent-purple-600"
                          />
                          <div>
                            <div className="font-bold text-slate-900 text-sm leading-tight">{item.title}</div>
                            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter mt-1">{item.desc}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {formData.parent_id && (
                      <div className="md:col-span-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Parent Architecture</label>
                        <select
                          required
                          value={formData.parent_id}
                          onChange={(e) => setFormData({ ...formData, parent_id: e.target.value })}
                          className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-purple-500 outline-none transition-all font-bold text-slate-900"
                        >
                          <option value="">Select Parent</option>
                          {parentCategories.map(category => (
                            <option key={category.id} value={category.id}>{category.name}</option>
                          ))}
                        </select>
                      </div>
                    )}
                    
                    <div className="md:col-span-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Category Label</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => {
                          const name = e.target.value;
                          const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                          setFormData({ ...formData, name, slug });
                        }}
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-purple-500 outline-none transition-all font-bold text-slate-900"
                        placeholder="e.g., Quantum Computing"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Description (Optional)</label>
                    <textarea
                      rows={3}
                      value={formData.description || ''}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-purple-500 outline-none transition-all font-medium text-slate-700"
                      placeholder="Briefly define this category segment..."
                    />
                  </div>

                  {/* Icon Selection - Modernized */}
                  <div className="bg-purple-50/50 p-8 rounded-3xl border border-purple-100">
                    <h3 className="text-xs font-black text-purple-400 uppercase tracking-widest mb-6">Brand Identity</h3>
                    
                    <div className="bg-white border border-purple-100 rounded-2xl p-4 mb-6 shadow-sm">
                      <p className="text-[10px] font-bold text-purple-800 leading-relaxed uppercase tracking-tight">
                        💡 Intelligent Mapping: Leave empty to use auto-mapping.
                      </p>
                    </div>

                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleIconChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <div className="flex flex-col items-center justify-center p-10 border-2 border-dashed border-purple-200 rounded-3xl bg-white hover:border-purple-400 transition-colors group">
                        <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 mb-4 group-hover:scale-110 transition-transform">
                          <Plus className="w-6 h-6" />
                        </div>
                        <span className="text-sm font-black text-slate-900">Upload Custom Icon</span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter mt-1">PNG or SVG • Max 50KB</span>
                      </div>
                    </div>

                    {iconPreview && (
                      <div className="mt-6 flex items-center gap-6 p-4 bg-white rounded-2xl border border-purple-100 animate-fadeIn">
                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-50 border border-slate-100 flex items-center justify-center">
                          <Image src={iconPreview} alt="Preview" width={48} height={48} className="w-12 h-12 object-contain" unoptimized />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-purple-600 uppercase tracking-widest">Selected Override</p>
                          <p className="text-xs font-bold text-slate-900 mt-1">Ready for persistence.</p>
                        </div>
                        <button type="button" onClick={() => setIconPreview(null)} className="ml-auto text-[10px] font-black text-red-500 uppercase tracking-widest hover:text-red-700">Remove</button>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-6">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={formData.is_active}
                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                        className="w-6 h-6 rounded-lg border-2 border-slate-200 text-purple-600 focus:ring-purple-500 cursor-pointer"
                      />
                      <span className="text-xs font-black text-slate-600 uppercase tracking-widest group-hover:text-slate-900 transition-colors">Active Protocol</span>
                    </label>

                    <div className="flex gap-4">
                      <button
                        type="button"
                        onClick={resetForm}
                        className="px-8 py-4 bg-slate-50 rounded-2xl text-xs font-black text-slate-600 uppercase tracking-widest hover:bg-slate-100 transition-all cursor-pointer"
                      >
                        Abort
                      </button>
                      <button
                        type="submit"
                        className="px-10 py-4 bg-purple-600 rounded-2xl text-xs font-black text-white uppercase tracking-widest hover:bg-purple-700 shadow-xl shadow-purple-200 transition-all cursor-pointer"
                      >
                        {editingCategory ? 'Commit Changes' : 'Execute Registration'}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
