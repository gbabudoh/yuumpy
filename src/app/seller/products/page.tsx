'use client';

import { useSellerContext } from '../layout';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { 
  Package, 
  Plus, 
  Edit2, 
  Trash2, 
  X,
  ChevronDown,
  Box,
  Globe,
  Palette,
  Shirt,
  Footprints
} from 'lucide-react';

const AVAILABLE_REGIONS = [
  'UK', 'Canada', 'USA',
  'Austria', 'Belgium', 'Bulgaria', 'Croatia', 'Cyprus', 'Estonia',
  'Finland', 'France', 'Germany', 'Greece', 'Ireland', 'Italy',
  'Latvia', 'Lithuania', 'Luxembourg', 'Malta', 'Netherlands',
  'Portugal', 'Slovakia', 'Slovenia', 'Spain'
];



const COLOUR_OPTIONS = [
  { name: 'Black', hex: '#000000' }, { name: 'White', hex: '#FFFFFF' },
  { name: 'Red', hex: '#EF4444' }, { name: 'Blue', hex: '#3B82F6' },
  { name: 'Green', hex: '#22C55E' }, { name: 'Yellow', hex: '#EAB308' },
  { name: 'Purple', hex: '#A855F7' }, { name: 'Pink', hex: '#EC4899' },
  { name: 'Orange', hex: '#F97316' }, { name: 'Grey', hex: '#6B7280' },
  { name: 'Navy', hex: '#1E3A5F' }, { name: 'Beige', hex: '#D4B896' },
  { name: 'Brown', hex: '#92400E' }, { name: 'Teal', hex: '#14B8A6' },
  { name: 'Gold', hex: '#D4AF37' }, { name: 'Silver', hex: '#C0C0C0' },
  { name: 'Coral', hex: '#FF6B6B' }, { name: 'Burgundy', hex: '#800020' },
  { name: 'Olive', hex: '#808000' }, { name: 'Cream', hex: '#FFFDD0' },
];

const CLOTHING_SIZES = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL'];

const SHOE_SIZES_UK = ['3', '3.5', '4', '4.5', '5', '5.5', '6', '6.5', '7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11', '11.5', '12', '13', '14'];
const SHOE_SIZES_EU = ['35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46', '47', '48'];
const SHOE_SIZES_US = ['4', '4.5', '5', '5.5', '6', '6.5', '7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11', '11.5', '12', '13', '14', '15'];

interface ColourVariant {
  label: string;
  colour: string;
  hex: string;
  imageUrl: string;
}

interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  short_description: string;
  price: string;
  original_price: string;
  image_url: string;
  category_id: number | null;
  category_name: string;
  brand_id: number | null;
  brand_name: string;
  stock_quantity: number;
  product_condition: string;
  seller_approved: boolean;
  is_active: boolean;
  currency: string;
  regions: string[] | string | null;
  colour_variants: ColourVariant[] | string | null;
  clothing_sizes: string[] | string | null;
  shoe_sizes: { system: string; sizes: string[] } | string | null;
  created_at: string;
}

export default function SellerProductsPage() {
  const { seller } = useSellerContext();
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [brands, setBrands] = useState<{ id: number; name: string }[]>([]);

  const [form, setForm] = useState({
    name: '', description: '', shortDescription: '', price: '', originalPrice: '',
    categoryId: '', brandId: '', imageUrl: '', productCondition: 'new', stockQuantity: '',
    currency: 'USD', regions: [] as string[],
    colourVariants: [] as ColourVariant[],
    clothingSizes: [] as string[],
    shoeSizes: [] as string[],
    shoeSizeSystem: 'UK' as string,
  });
  const [showColours, setShowColours] = useState(false);
  const [showClothingSizes, setShowClothingSizes] = useState(false);
  const [showShoeSizes, setShowShoeSizes] = useState(false);
  const [uploadingVariantIdx, setUploadingVariantIdx] = useState<number | null>(null);
  const [uploadingMainImage, setUploadingMainImage] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: number; name: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (searchParams.get('new') === '1') setShowForm(true);
  }, [searchParams]);

  useEffect(() => {
    fetchProducts();
    fetch('/api/categories?parent_only=true').then(r => r.json()).then(d => setCategories(Array.isArray(d) ? d : [])).catch(() => {});
    fetch('/api/brands').then(r => r.json()).then(d => setBrands(Array.isArray(d) ? d : d.brands || [])).catch(() => {});
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/seller/products');
      const data = await res.json();
      setProducts(data.products || []);
    } catch { } finally { setLoading(false); }
  };

  const resetForm = () => {
    setForm({ name: '', description: '', shortDescription: '', price: '', originalPrice: '', categoryId: '', brandId: '', imageUrl: '', productCondition: 'new', stockQuantity: '', currency: 'USD', regions: [], colourVariants: [], clothingSizes: [], shoeSizes: [], shoeSizeSystem: 'UK' });
    setShowColours(false); setShowClothingSizes(false); setShowShoeSizes(false);
    setUploadingVariantIdx(null);
    setEditingProduct(null);
    setShowForm(false);
  };

  const handleEdit = (product: Product) => {
    const parseJson = <T,>(val: T | string | null, fallback: T): T => {
      if (!val) return fallback;
      if (typeof val === 'string') { try { return JSON.parse(val); } catch { return fallback; } }
      return val;
    };
    const parsedRegions = parseJson<string[]>(product.regions, []);
    const parsedColours = parseJson<ColourVariant[]>(product.colour_variants, []);
    const parsedClothing = parseJson<string[]>(product.clothing_sizes, []);
    const parsedShoeData = parseJson<{ system: string; sizes: string[] }>(product.shoe_sizes, { system: 'UK', sizes: [] });

    setForm({
      name: product.name,
      description: product.description || '',
      shortDescription: product.short_description || '',
      price: product.price,
      originalPrice: product.original_price || '',
      categoryId: product.category_id?.toString() || '',
      brandId: product.brand_id?.toString() || '',
      imageUrl: product.image_url || '',
      productCondition: product.product_condition || 'new',
      stockQuantity: product.stock_quantity?.toString() || '',
      currency: product.currency || 'USD',
      regions: parsedRegions,
      colourVariants: parsedColours,
      clothingSizes: parsedClothing,
      shoeSizes: parsedShoeData.sizes || [],
      shoeSizeSystem: parsedShoeData.system || 'UK',
    });
    setShowColours(parsedColours.length > 0);
    setShowClothingSizes(parsedClothing.length > 0);
    setShowShoeSizes((parsedShoeData.sizes || []).length > 0);
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const payload = {
      ...(editingProduct ? { id: editingProduct.id } : {}),
      name: form.name, description: form.description, shortDescription: form.shortDescription,
      price: parseFloat(form.price), originalPrice: form.originalPrice ? parseFloat(form.originalPrice) : null,
      categoryId: form.categoryId ? parseInt(form.categoryId) : null,
      brandId: form.brandId ? parseInt(form.brandId) : null,
      imageUrl: form.imageUrl, productCondition: form.productCondition,
      stockQuantity: form.stockQuantity ? parseInt(form.stockQuantity) : null,
      currency: form.currency,
      regions: form.regions,
      colourVariants: form.colourVariants,
      clothingSizes: form.clothingSizes,
      shoeSizes: form.shoeSizes.length > 0 ? { system: form.shoeSizeSystem, sizes: form.shoeSizes } : [],
    };

    try {
      const res = await fetch('/api/seller/products', {
        method: editingProduct ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        await fetchProducts();
        resetForm();
      }
    } catch { } finally { setSaving(false); }
  };

  const handleDelete = (id: number) => {
    const product = products.find(p => p.id === id);
    setDeleteConfirm({ id, name: product?.name || 'this product' });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    setDeleting(true);
    try {
      await fetch(`/api/seller/products?id=${deleteConfirm.id}`, { method: 'DELETE' });
      await fetchProducts();
    } finally {
      setDeleting(false);
      setDeleteConfirm(null);
    }
  };

  const handleVariantImageUpload = async (idx: number, file: File) => {
    setUploadingVariantIdx(idx);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'yuumpy/variants');
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.url) {
        setForm(f => {
          const updated = [...f.colourVariants];
          updated[idx] = { ...updated[idx], imageUrl: data.url };
          return { ...f, colourVariants: updated };
        });
      }
    } catch { } finally { setUploadingVariantIdx(null); }
  };

  const handleMainImageUpload = async (file: File) => {
    setUploadingMainImage(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'yuumpy/products');
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.url) {
        setForm(f => ({ ...f, imageUrl: data.url }));
      }
    } catch { } finally { setUploadingMainImage(false); }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-[10px] font-black text-indigo-600 uppercase tracking-widest">Inventory</span>
            <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Store Management</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Products</h1>
          <p className="text-slate-500 font-medium">Manage your product listings and inventory</p>
        </div>
        {seller?.status === 'approved' && (
          <button
            onClick={() => { resetForm(); setShowForm(!showForm); }}
            className={`flex items-center gap-2 px-6 py-3.5 rounded-2xl font-black text-sm transition-all duration-300 shadow-lg ${
              showForm 
                ? 'bg-slate-100 text-slate-600 hover:bg-slate-200 shadow-none' 
                : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-indigo-500/25 active:scale-95'
            }`}
          >
            {showForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            {showForm ? 'Cancel' : 'Add Product'}
          </button>
        )}
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="relative overflow-hidden rounded-[2.5rem] bg-white border border-gray-100 shadow-2xl shadow-slate-200/50">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 to-purple-500" />
          
          <form onSubmit={handleSubmit} className="p-8 sm:p-10 space-y-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center">
                <Package className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">{editingProduct ? 'Edit Product' : 'Create New Product'}</h3>
                <p className="text-slate-500 text-sm font-medium">Fill in the details below to list your device</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Product Name *</label>
                  <input 
                    className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 text-slate-900 font-bold placeholder:text-slate-300 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 transition-all"
                    placeholder="e.g. iPhone 15 Pro Max - 256GB - Titanium"
                    value={form.name} 
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))} 
                    required 
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Currency</label>
                    <div className="relative">
                      <select 
                        className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 text-slate-900 font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 transition-all appearance-none cursor-pointer"
                        value={form.currency} 
                        onChange={e => setForm(f => ({ ...f, currency: e.target.value }))}
                      >
                        <option value="USD">USA (USD $)</option>
                        <option value="GBP">UK (GBP £)</option>
                        <option value="EUR">Europe (EUR €)</option>
                        <option value="CAD">Canada (CAD C$)</option>
                      </select>
                      <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Price *</label>
                    <div className="relative group">
                      <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                        <span className="text-sm font-bold">
                          {form.currency === 'GBP' ? '£' : form.currency === 'EUR' ? '€' : form.currency === 'CAD' ? 'C$' : '$'}
                        </span>
                      </div>
                      <input 
                        type="number" 
                        step="0.01" 
                        className="w-full pl-12 pr-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 text-slate-900 font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 transition-all"
                        placeholder="0.00"
                        value={form.price} 
                        onChange={e => setForm(f => ({ ...f, price: e.target.value }))} 
                        required 
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Original Price</label>
                    <div className="relative group">
                      <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400">
                        <span className="text-sm font-bold">
                          {form.currency === 'GBP' ? '£' : form.currency === 'EUR' ? '€' : form.currency === 'CAD' ? 'C$' : '$'}
                        </span>
                      </div>
                      <input 
                        type="number" 
                        step="0.01" 
                        className="w-full pl-12 pr-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 text-slate-400 font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 transition-all"
                        placeholder="0.00"
                        value={form.originalPrice} 
                        onChange={e => setForm(f => ({ ...f, originalPrice: e.target.value }))} 
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Product Category</label>
                    <div className="relative">
                      <select 
                        className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 text-slate-900 font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 transition-all appearance-none cursor-pointer"
                        value={form.categoryId} 
                        onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))}
                      >
                        <option value="">Select Category</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                      <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Brand</label>
                    <div className="relative">
                      <select 
                        className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 text-slate-900 font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 transition-all appearance-none cursor-pointer"
                        value={form.brandId} 
                        onChange={e => setForm(f => ({ ...f, brandId: e.target.value }))}
                      >
                        <option value="">Select Brand</option>
                        {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                      </select>
                      <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Condition</label>
                  <div className="relative">
                    <select 
                      className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 text-slate-900 font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 transition-all appearance-none cursor-pointer"
                      value={form.productCondition} 
                      onChange={e => setForm(f => ({ ...f, productCondition: e.target.value }))}
                    >
                      <option value="new">New</option>
                      <option value="refurbished">Refurbished</option>
                      <option value="used">Used</option>
                    </select>
                    <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Stock Quantity</label>
                  <div className="relative group">
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400">
                      <Box className="w-4 h-4" />
                    </div>
                    <input 
                      type="number" 
                      className="w-full pl-12 pr-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 text-slate-900 font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 transition-all"
                      placeholder="0"
                      value={form.stockQuantity} 
                      onChange={e => setForm(f => ({ ...f, stockQuantity: e.target.value }))} 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Product Image</label>
                  {form.imageUrl ? (
                    <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-slate-50 border border-slate-100">
                      <Image src={form.imageUrl} alt="Product" width={300} height={300} className="w-full h-full object-cover" />
                      <div className="absolute bottom-2 left-2 right-2 flex gap-2">
                        <label className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-white/90 backdrop-blur text-xs font-black text-slate-700 hover:bg-white cursor-pointer transition-all shadow-sm">
                          <Edit2 className="w-3.5 h-3.5" /> Change
                          <input type="file" accept="image/*" className="hidden"
                            onChange={e => { const f = e.target.files?.[0]; if (f) handleMainImageUpload(f); }} />
                        </label>
                        <button type="button" onClick={() => setForm(f => ({ ...f, imageUrl: '' }))}
                          className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white/90 backdrop-blur text-xs font-black text-rose-500 hover:bg-white cursor-pointer transition-all shadow-sm">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label className="block w-full aspect-square rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 hover:border-indigo-300 cursor-pointer overflow-hidden transition-all group">
                      <div className="flex flex-col items-center justify-center h-full text-slate-300 group-hover:text-indigo-400 transition-colors">
                        {uploadingMainImage ? (
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
                        ) : (
                          <>
                            <Plus className="w-8 h-8 mb-1" />
                            <span className="text-[11px] font-bold">Upload Image</span>
                            <span className="text-[10px] text-slate-300 mt-0.5">Click to browse</span>
                          </>
                        )}
                      </div>
                      <input type="file" accept="image/*" className="hidden"
                        onChange={e => { const f = e.target.files?.[0]; if (f) handleMainImageUpload(f); }} />
                    </label>
                  )}
                </div>
              </div>

              <div className="md:col-span-2 lg:col-span-3 space-y-2">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Short Description</label>
                <textarea 
                  rows={2} 
                  className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 text-slate-900 font-bold placeholder:text-slate-300 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 transition-all resize-none"
                  placeholder="Brief summary of your product..."
                  value={form.shortDescription} 
                  onChange={e => setForm(f => ({ ...f, shortDescription: e.target.value }))} 
                />
              </div>

              <div className="md:col-span-2 lg:col-span-3 space-y-2">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Long Description</label>
                <textarea 
                  rows={6} 
                  className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 text-slate-900 font-bold placeholder:text-slate-300 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 transition-all resize-none"
                  placeholder="Full details about your product — materials, features, care instructions..."
                  value={form.description} 
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))} 
                />
              </div>

              {/* Region Selection */}
              <div className="md:col-span-2 lg:col-span-3 space-y-3">
                <div className="flex items-center gap-2 ml-1">
                  <Globe className="w-4 h-4 text-slate-400" />
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Display Regions</label>
                  {form.regions.length > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-[10px] font-black text-indigo-600">{form.regions.length} selected</span>
                  )}
                </div>
                <p className="text-slate-400 text-xs font-medium ml-1">Select which regions your product should be visible in. Leave empty for all regions.</p>
                <div className="flex flex-wrap gap-2 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  {AVAILABLE_REGIONS.map(region => {
                    const isSelected = form.regions.includes(region);
                    return (
                      <button
                        key={region}
                        type="button"
                        onClick={() => setForm(f => ({
                          ...f,
                          regions: isSelected
                            ? f.regions.filter(r => r !== region)
                            : [...f.regions, region]
                        }))}
                        className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all duration-200 border ${
                          isSelected
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/20'
                            : 'bg-white text-slate-500 border-slate-200 hover:border-indigo-300 hover:text-indigo-600'
                        }`}
                      >
                        {region}
                      </button>
                    );
                  })}
                </div>
                {form.regions.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setForm(f => ({ ...f, regions: [] }))}
                    className="text-[11px] font-bold text-slate-400 hover:text-rose-500 ml-1 transition-colors"
                  >
                    Clear all regions
                  </button>
                )}
              </div>
            </div>

            {/* Variation Toggles */}
            <div className="flex flex-wrap gap-3 pt-2">
              <button type="button" onClick={() => setShowColours(v => !v)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black border transition-all ${showColours ? 'bg-purple-50 border-purple-200 text-purple-700' : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-purple-200 hover:text-purple-600'}`}>
                <Palette className="w-4 h-4" /> Colour Variations {showColours && <span className="text-[10px]">✓</span>}
              </button>
              <button type="button" onClick={() => setShowClothingSizes(v => !v)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black border transition-all ${showClothingSizes ? 'bg-teal-50 border-teal-200 text-teal-700' : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-teal-200 hover:text-teal-600'}`}>
                <Shirt className="w-4 h-4" /> Clothing Sizes {showClothingSizes && <span className="text-[10px]">✓</span>}
              </button>
              <button type="button" onClick={() => setShowShoeSizes(v => !v)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black border transition-all ${showShoeSizes ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-amber-200 hover:text-amber-600'}`}>
                <Footprints className="w-4 h-4" /> Shoe Sizes {showShoeSizes && <span className="text-[10px]">✓</span>}
              </button>
            </div>

            {/* Colour Variations */}
            {showColours && (
              <div className="space-y-4 p-6 rounded-2xl bg-purple-50/50 border border-purple-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Palette className="w-4 h-4 text-purple-500" />
                    <label className="text-[11px] font-black text-purple-600 uppercase tracking-[0.2em]">Colour Variations</label>
                    {form.colourVariants.length > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-purple-100 text-[10px] font-black text-purple-600">{form.colourVariants.length}</span>
                    )}
                  </div>
                  <button type="button"
                    onClick={() => setForm(f => ({ ...f, colourVariants: [...f.colourVariants, { label: '', colour: '', hex: '#000000', imageUrl: '' }] }))}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-600 text-white text-xs font-black hover:bg-purple-700 transition-colors">
                    <Plus className="w-3.5 h-3.5" /> Add Variant
                  </button>
                </div>

                {form.colourVariants.length === 0 && (
                  <p className="text-purple-400 text-xs font-medium text-center py-4">Click &quot;Add Variant&quot; to add colour variations with images</p>
                )}

                <div className="space-y-3">
                  {form.colourVariants.map((variant, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-4 rounded-xl bg-white border border-purple-100 shadow-sm">
                      {/* Image upload area */}
                      <div className="flex-shrink-0">
                        <label className="block w-20 h-20 rounded-xl bg-slate-50 border-2 border-dashed border-slate-200 hover:border-purple-300 cursor-pointer overflow-hidden transition-colors relative group">
                          {variant.imageUrl ? (
                            <Image src={variant.imageUrl} alt={variant.label || 'Variant'} width={80} height={80} className="w-full h-full object-cover" />
                          ) : (
                            <div className="flex flex-col items-center justify-center h-full text-slate-300 group-hover:text-purple-400 transition-colors">
                              {uploadingVariantIdx === idx ? (
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-500" />
                              ) : (
                                <>
                                  <Plus className="w-5 h-5" />
                                  <span className="text-[9px] font-bold mt-0.5">Image</span>
                                </>
                              )}
                            </div>
                          )}
                          <input type="file" accept="image/*" className="hidden"
                            onChange={e => { const f = e.target.files?.[0]; if (f) handleVariantImageUpload(idx, f); }} />
                        </label>
                      </div>

                      {/* Variant details */}
                      <div className="flex-1 space-y-2">
                        <input
                          placeholder="Variant name, e.g. Cotton Dress"
                          value={variant.label}
                          onChange={e => setForm(f => {
                            const updated = [...f.colourVariants];
                            updated[idx] = { ...updated[idx], label: e.target.value };
                            return { ...f, colourVariants: updated };
                          })}
                          className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-100 text-sm font-bold text-slate-900 placeholder:text-slate-300 outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-300 transition-all"
                        />
                        <div className="flex flex-wrap gap-1.5">
                          {COLOUR_OPTIONS.map(c => (
                            <button key={c.name} type="button"
                              onClick={() => setForm(f => {
                                const updated = [...f.colourVariants];
                                updated[idx] = { ...updated[idx], colour: c.name, hex: c.hex };
                                return { ...f, colourVariants: updated };
                              })}
                              title={c.name}
                              className={`w-7 h-7 rounded-lg border-2 transition-all ${variant.colour === c.name ? 'border-purple-500 scale-110 shadow-md' : 'border-slate-200 hover:border-purple-300'}`}
                              style={{ backgroundColor: c.hex }}
                            />
                          ))}
                          {/* Custom colour picker */}
                          <div className="flex items-center gap-1.5 ml-1">
                            <label className={`w-7 h-7 rounded-lg border-2 cursor-pointer overflow-hidden transition-all ${!COLOUR_OPTIONS.some(c => c.name === variant.colour) && variant.colour ? 'border-purple-500 scale-110 shadow-md' : 'border-dashed border-slate-300 hover:border-purple-300'}`}
                              title="Pick custom colour">
                              <input type="color" className="opacity-0 absolute w-0 h-0"
                                value={variant.hex || '#000000'}
                                onChange={e => setForm(f => {
                                  const updated = [...f.colourVariants];
                                  updated[idx] = { ...updated[idx], hex: e.target.value, colour: '' };
                                  return { ...f, colourVariants: updated };
                                })} />
                              <div className="w-full h-full" style={{ backgroundColor: !COLOUR_OPTIONS.some(c => c.name === variant.colour) && variant.colour ? variant.hex : '#e2e8f0' }}>
                                {!(!COLOUR_OPTIONS.some(c => c.name === variant.colour) && variant.colour) && (
                                  <span className="flex items-center justify-center h-full text-slate-400 text-[10px] font-black">+</span>
                                )}
                              </div>
                            </label>
                            {!COLOUR_OPTIONS.some(c => c.name === variant.colour) && (
                              <input
                                placeholder="Colour name"
                                value={variant.colour}
                                onChange={e => setForm(f => {
                                  const updated = [...f.colourVariants];
                                  updated[idx] = { ...updated[idx], colour: e.target.value };
                                  return { ...f, colourVariants: updated };
                                })}
                                className="w-24 px-2 py-1 rounded-lg bg-slate-50 border border-slate-200 text-[11px] font-bold text-slate-700 placeholder:text-slate-300 outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-300"
                              />
                            )}
                          </div>
                        </div>
                        {variant.colour && (
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-purple-600">
                            <span className="w-3 h-3 rounded-full border border-slate-200" style={{ backgroundColor: variant.hex }} />
                            {variant.colour}
                          </span>
                        )}
                      </div>

                      {/* Remove button */}
                      <button type="button"
                        onClick={() => setForm(f => ({ ...f, colourVariants: f.colourVariants.filter((_, i) => i !== idx) }))}
                        className="flex-shrink-0 w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 text-slate-400 hover:text-rose-500 hover:border-rose-200 flex items-center justify-center transition-all">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Clothing Sizes */}
            {showClothingSizes && (
              <div className="space-y-4 p-6 rounded-2xl bg-teal-50/50 border border-teal-100">
                <div className="flex items-center gap-2">
                  <Shirt className="w-4 h-4 text-teal-500" />
                  <label className="text-[11px] font-black text-teal-600 uppercase tracking-[0.2em]">Clothing Sizes</label>
                  {form.clothingSizes.length > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-teal-100 text-[10px] font-black text-teal-600">{form.clothingSizes.length}</span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {CLOTHING_SIZES.map(size => {
                    const isSelected = form.clothingSizes.includes(size);
                    return (
                      <button key={size} type="button"
                        onClick={() => setForm(f => ({
                          ...f,
                          clothingSizes: isSelected ? f.clothingSizes.filter(s => s !== size) : [...f.clothingSizes, size]
                        }))}
                        className={`w-14 h-11 rounded-xl text-xs font-black border transition-all ${isSelected ? 'bg-teal-600 text-white border-teal-600 shadow-md shadow-teal-500/20' : 'bg-white text-slate-500 border-slate-200 hover:border-teal-300 hover:text-teal-600'}`}>
                        {size}
                      </button>
                    );
                  })}
                </div>
                {form.clothingSizes.length > 0 && (
                  <button type="button" onClick={() => setForm(f => ({ ...f, clothingSizes: [] }))}
                    className="text-[11px] font-bold text-slate-400 hover:text-rose-500 transition-colors">Clear all sizes</button>
                )}
              </div>
            )}

            {/* Shoe Sizes */}
            {showShoeSizes && (
              <div className="space-y-4 p-6 rounded-2xl bg-amber-50/50 border border-amber-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Footprints className="w-4 h-4 text-amber-500" />
                    <label className="text-[11px] font-black text-amber-600 uppercase tracking-[0.2em]">Shoe Sizes</label>
                    {form.shoeSizes.length > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 text-[10px] font-black text-amber-600">{form.shoeSizes.length}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 bg-white rounded-xl border border-slate-200 p-1">
                    {['UK', 'EU', 'US'].map(sys => (
                      <button key={sys} type="button"
                        onClick={() => setForm(f => ({ ...f, shoeSizeSystem: sys, shoeSizes: [] }))}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all ${form.shoeSizeSystem === sys ? 'bg-amber-500 text-white shadow-sm' : 'text-slate-400 hover:text-amber-600'}`}>
                        {sys}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(form.shoeSizeSystem === 'EU' ? SHOE_SIZES_EU : form.shoeSizeSystem === 'US' ? SHOE_SIZES_US : SHOE_SIZES_UK).map(size => {
                    const isSelected = form.shoeSizes.includes(size);
                    return (
                      <button key={size} type="button"
                        onClick={() => setForm(f => ({
                          ...f,
                          shoeSizes: isSelected ? f.shoeSizes.filter(s => s !== size) : [...f.shoeSizes, size]
                        }))}
                        className={`w-14 h-11 rounded-xl text-xs font-black border transition-all ${isSelected ? 'bg-amber-500 text-white border-amber-500 shadow-md shadow-amber-500/20' : 'bg-white text-slate-500 border-slate-200 hover:border-amber-300 hover:text-amber-600'}`}>
                        {size}
                      </button>
                    );
                  })}
                </div>
                {form.shoeSizes.length > 0 && (
                  <button type="button" onClick={() => setForm(f => ({ ...f, shoeSizes: [] }))}
                    className="text-[11px] font-bold text-slate-400 hover:text-rose-500 transition-colors">Clear all sizes</button>
                )}
              </div>
            )}

            <div className="flex items-center justify-end gap-4 pt-4 border-t border-slate-50">
              <button 
                type="button"
                onClick={resetForm}
                className="px-8 py-4 rounded-2xl font-black text-sm text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-all active:scale-95"
              >
                Discard Changes
              </button>
              <button 
                type="submit" 
                disabled={saving} 
                className="px-10 py-4 rounded-2xl font-black text-sm text-white bg-indigo-600 hover:bg-slate-900 shadow-xl shadow-indigo-500/20 hover:shadow-slate-900/20 transition-all active:scale-95 disabled:opacity-50"
              >
                {saving ? 'Processing...' : editingProduct ? 'Update Listing' : 'Publish Product'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Products Table */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500" />
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-24 rounded-[3rem] bg-white border border-dashed border-slate-200">
          <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center mb-6">
            <Package className="w-10 h-10 text-slate-300" />
          </div>
          <h3 className="text-xl font-black text-slate-900 mb-2">No products listing yet</h3>
          <p className="text-slate-500 font-medium max-w-sm">
            Your inventory is currently empty. Start by adding your first product to reach customers.
          </p>
          <button 
            onClick={() => setShowForm(true)}
            className="mt-8 flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-50 text-indigo-600 font-black text-sm hover:bg-indigo-100 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add First Product
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden animate-in zoom-in-95 duration-500">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50/50 border-bottom border-gray-50">
                  <th className="text-left text-[11px] text-slate-400 font-black uppercase tracking-[0.2em] p-6">Product</th>
                  <th className="text-left text-[11px] text-slate-400 font-black uppercase tracking-[0.2em] p-6">Category</th>
                  <th className="text-left text-[11px] text-slate-400 font-black uppercase tracking-[0.2em] p-6">Price</th>
                  <th className="text-left text-[11px] text-slate-400 font-black uppercase tracking-[0.2em] p-6">Inventory</th>
                  <th className="text-left text-[11px] text-slate-400 font-black uppercase tracking-[0.2em] p-6">Regions</th>
                  <th className="text-left text-[11px] text-slate-400 font-black uppercase tracking-[0.2em] p-6">Status</th>
                  <th className="text-right text-[11px] text-slate-400 font-black uppercase tracking-[0.2em] p-6">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {products.map(product => (
                  <tr key={product.id} className="group hover:bg-indigo-50/30 transition-colors">
                    <td className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 overflow-hidden border border-slate-50 group-hover:scale-105 transition-transform">
                          {product.image_url ? (
                            <Image src={product.image_url} alt="" width={48} height={48} className="w-full h-full object-cover" />
                          ) : (
                            <Package className="w-6 h-6" />
                          )}
                        </div>
                        <div className="flex flex-col">
                          <p className="text-slate-900 font-black text-sm group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{product.name}</p>
                          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-0.5">ID: {product.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-6">
                      <span className="text-slate-600 text-[13px] font-bold">{product.category_name || 'Electronics'}</span>
                    </td>
                    <td className="p-6">
                      <div className="flex flex-col">
                        <span className="text-slate-900 text-sm font-black tracking-tight">
                          {product.currency === 'GBP' ? '£' : product.currency === 'EUR' ? '€' : product.currency === 'CAD' ? 'C$' : '$'}
                          {parseFloat(product.price).toFixed(2)}
                        </span>
                        {product.original_price && (
                          <span className="text-slate-400 text-[11px] line-through">
                            {product.currency === 'GBP' ? '£' : product.currency === 'EUR' ? '€' : product.currency === 'CAD' ? 'C$' : '$'}
                            {parseFloat(product.original_price).toFixed(2)}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${
                          (product.stock_quantity ?? 0) > 10 ? 'bg-emerald-500' : (product.stock_quantity ?? 0) > 0 ? 'bg-amber-500' : 'bg-red-500'
                        }`} />
                        <span className="text-slate-900 font-bold text-sm tracking-tight">{product.stock_quantity ?? 'UNLIMITED'}</span>
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {(() => {
                          let regions: string[] = [];
                          if (product.regions) {
                            if (Array.isArray(product.regions)) regions = product.regions;
                            else if (typeof product.regions === 'string') {
                              try { regions = JSON.parse(product.regions); } catch { regions = []; }
                            }
                          }
                          return regions.length > 0 ? regions.slice(0, 3).map(r => (
                            <span key={r} className="px-2 py-0.5 rounded-md bg-slate-50 border border-slate-100 text-[10px] font-bold text-slate-500">{r}</span>
                          )).concat(regions.length > 3 ? [<span key="more" className="px-2 py-0.5 rounded-md bg-indigo-50 border border-indigo-100 text-[10px] font-bold text-indigo-500">+{regions.length - 3}</span>] : []) : (
                            <span className="text-[10px] font-bold text-slate-300">All regions</span>
                          );
                        })()}
                      </div>
                    </td>
                    <td className="p-6">
                      {(() => {
                        const currentStatus = !product.is_active ? 'disabled' : product.seller_approved ? 'active' : 'pending';
                        const statusStyles = {
                          active: 'bg-emerald-50 border-emerald-200 text-emerald-700',
                          pending: 'bg-amber-50 border-amber-200 text-amber-700',
                          disabled: 'bg-slate-50 border-slate-200 text-slate-500',
                        };
                        return (
                          <div className="relative">
                            <select
                              value={currentStatus}
                              onChange={async (e) => {
                                const newStatus = e.target.value;
                                await fetch('/api/seller/products', {
                                  method: 'PATCH',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ id: product.id, status: newStatus }),
                                });
                                fetchProducts();
                              }}
                              className={`appearance-none pl-3 pr-8 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border cursor-pointer outline-none transition-all ${statusStyles[currentStatus as keyof typeof statusStyles]}`}
                            >
                              <option value="active">✓ Active</option>
                              <option value="pending">◷ Pending</option>
                              <option value="disabled">✕ Disabled</option>
                            </select>
                            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none opacity-50" />
                          </div>
                        );
                      })()}
                    </td>
                    <td className="p-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleEdit(product)} 
                          className="w-10 h-10 rounded-xl bg-white border border-slate-100 text-slate-400 hover:text-indigo-600 hover:border-indigo-100 hover:shadow-lg hover:shadow-indigo-500/10 flex items-center justify-center transition-all"
                          title="Edit Product"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(product.id)} 
                          className="w-10 h-10 rounded-xl bg-white border border-slate-100 text-slate-400 hover:text-rose-600 hover:border-rose-100 hover:shadow-lg hover:shadow-rose-500/10 flex items-center justify-center transition-all"
                          title="Remove Product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => !deleting && setDeleteConfirm(null)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200" />
          <div
            className="relative bg-white rounded-3xl shadow-2xl max-w-sm w-full p-8 animate-in zoom-in-95 fade-in duration-200"
            onClick={e => e.stopPropagation()}
          >
            {/* Warning Icon */}
            <div className="mx-auto w-16 h-16 rounded-2xl bg-rose-50 flex items-center justify-center mb-6">
              <Trash2 className="w-7 h-7 text-rose-500" />
            </div>

            {/* Content */}
            <h3 className="text-xl font-black text-slate-900 text-center tracking-tight">Remove Product</h3>
            <p className="text-sm text-slate-400 text-center mt-2 font-medium leading-relaxed">
              Are you sure you want to delete{' '}
              <span className="text-slate-700 font-bold">&ldquo;{deleteConfirm.name}&rdquo;</span>?
              This action cannot be undone.
            </p>

            {/* Actions */}
            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setDeleteConfirm(null)}
                disabled={deleting}
                className="flex-1 py-3 rounded-2xl text-sm font-black text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="flex-1 py-3 rounded-2xl text-sm font-black text-white bg-rose-500 hover:bg-rose-600 shadow-lg shadow-rose-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deleting ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <><Trash2 className="w-4 h-4" /> Delete</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
