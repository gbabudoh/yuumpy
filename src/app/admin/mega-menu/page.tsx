'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import {
  LayoutGrid, Eye, EyeOff, ChevronUp, ChevronDown,
  Save, RefreshCw, GripVertical, CheckCircle2, XCircle,
  Package, Sparkles
} from 'lucide-react';

interface MenuCategory {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  is_active: boolean;
  show_in_menu: boolean;
  menu_order: number;
  product_count: number;
}

export default function MegaMenuPage() {
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/mega-menu');
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
        setDirty(false);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const toggleVisibility = (id: number) => {
    setCategories(prev =>
      prev.map(c => c.id === id ? { ...c, show_in_menu: !c.show_in_menu } : c)
    );
    setDirty(true);
    setSaved(false);
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const next = [...categories];
    [next[index - 1], next[index]] = [next[index], next[index - 1]];
    setCategories(next.map((c, i) => ({ ...c, menu_order: i })));
    setDirty(true);
    setSaved(false);
  };

  const moveDown = (index: number) => {
    if (index === categories.length - 1) return;
    const next = [...categories];
    [next[index], next[index + 1]] = [next[index + 1], next[index]];
    setCategories(next.map((c, i) => ({ ...c, menu_order: i })));
    setDirty(true);
    setSaved(false);
  };

  const saveChanges = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/mega-menu', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categories: categories.map((c, i) => ({
            id: c.id,
            show_in_menu: c.show_in_menu,
            menu_order: i,
          })),
        }),
      });
      if (res.ok) {
        setSaved(true);
        setDirty(false);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const enabledCount = categories.filter(c => c.show_in_menu).length;

  return (
    <AdminLayout>
      <div className="p-6 max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
                <LayoutGrid className="w-5 h-5 text-indigo-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Mega Menu Manager</h1>
            </div>
            <p className="text-sm text-gray-500 ml-13">Control which categories appear in the navigation mega menu and their order</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchCategories}
              className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-500 transition-colors"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={saveChanges}
              disabled={!dirty || saving}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                saved
                  ? 'bg-green-100 text-green-700 border border-green-200'
                  : dirty
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              {saved ? (
                <><CheckCircle2 className="w-4 h-4" /> Saved!</>
              ) : saving ? (
                <><RefreshCw className="w-4 h-4 animate-spin" /> Saving…</>
              ) : (
                <><Save className="w-4 h-4" /> Save Changes</>
              )}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          {/* Left: Category List */}
          <div className="xl:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-gray-900">All Categories</h2>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {enabledCount} of {categories.length} showing in mega menu
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => { setCategories(prev => prev.map(c => ({ ...c, show_in_menu: true }))); setDirty(true); }}
                    className="text-xs px-3 py-1.5 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 font-medium transition-colors"
                  >
                    Show All
                  </button>
                  <button
                    onClick={() => { setCategories(prev => prev.map(c => ({ ...c, show_in_menu: false }))); setDirty(true); }}
                    className="text-xs px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 font-medium transition-colors"
                  >
                    Hide All
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="p-12 text-center">
                  <RefreshCw className="w-6 h-6 text-gray-300 animate-spin mx-auto mb-3" />
                  <p className="text-sm text-gray-400">Loading categories…</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {categories.map((cat, index) => (
                    <div
                      key={cat.id}
                      className={`flex items-center gap-4 px-6 py-4 transition-colors ${
                        cat.show_in_menu ? 'bg-white hover:bg-gray-50' : 'bg-gray-50/50 opacity-60 hover:opacity-80'
                      }`}
                    >
                      {/* Drag handle + order buttons */}
                      <div className="flex flex-col items-center gap-0.5 text-gray-300">
                        <button
                          onClick={() => moveUp(index)}
                          disabled={index === 0}
                          className="p-0.5 hover:text-indigo-500 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                        >
                          <ChevronUp className="w-4 h-4" />
                        </button>
                        <GripVertical className="w-4 h-4" />
                        <button
                          onClick={() => moveDown(index)}
                          disabled={index === categories.length - 1}
                          className="p-0.5 hover:text-indigo-500 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                        >
                          <ChevronDown className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Position badge */}
                      <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 shrink-0">
                        {index + 1}
                      </div>

                      {/* Category info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-gray-900 text-sm">{cat.name}</p>
                          {!cat.is_active && (
                            <span className="text-[10px] px-2 py-0.5 bg-orange-100 text-orange-600 rounded-full font-bold">INACTIVE</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 truncate mt-0.5">
                          {cat.description || `/${cat.slug}`}
                        </p>
                      </div>

                      {/* Product count */}
                      <div className="text-center shrink-0">
                        <p className="text-sm font-bold text-gray-700">{cat.product_count}</p>
                        <p className="text-[10px] text-gray-400">products</p>
                      </div>

                      {/* Toggle */}
                      <button
                        onClick={() => toggleVisibility(cat.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                          cat.show_in_menu
                            ? 'bg-indigo-50 text-indigo-600 hover:bg-red-50 hover:text-red-600 border border-indigo-100 hover:border-red-100'
                            : 'bg-gray-100 text-gray-400 hover:bg-indigo-50 hover:text-indigo-600 border border-gray-200 hover:border-indigo-100'
                        }`}
                      >
                        {cat.show_in_menu ? (
                          <><Eye className="w-3.5 h-3.5" /> Visible</>
                        ) : (
                          <><EyeOff className="w-3.5 h-3.5" /> Hidden</>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: Live Preview */}
          <div className="xl:col-span-1">
            <div className="sticky top-6">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100">
                  <h2 className="font-semibold text-gray-900 text-sm">Live Preview</h2>
                  <p className="text-xs text-gray-400 mt-0.5">What customers will see in the mega menu</p>
                </div>

                {/* Mini mega menu preview */}
                <div className="p-4">
                  <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl px-4 py-2.5 mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <LayoutGrid className="w-3.5 h-3.5 text-white" />
                      <span className="text-xs font-bold text-white">SHOP BY CATEGORY</span>
                    </div>
                    <span className="text-[10px] text-white/70 font-medium">VIEW ALL</span>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5 max-h-[420px] overflow-y-auto">
                    {categories.filter(c => c.show_in_menu).length === 0 ? (
                      <div className="col-span-2 py-6 text-center">
                        <XCircle className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                        <p className="text-xs text-gray-400 font-medium">No categories visible</p>
                      </div>
                    ) : (
                      categories.filter(c => c.show_in_menu).map((cat, i) => (
                        <div
                          key={cat.id}
                          className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 border border-gray-100"
                        >
                          <div className="w-6 h-6 rounded-md bg-purple-100 flex items-center justify-center shrink-0">
                            <Package className="w-3 h-3 text-purple-500" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[11px] font-semibold text-gray-800 truncate leading-tight">{cat.name}</p>
                            <p className="text-[9px] text-gray-400">{cat.product_count} items</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      <span className="text-[10px] text-green-600 font-bold">ESCROW PROTECTED</span>
                    </div>
                    <span className="text-[10px] text-gray-400">{enabledCount} categories</span>
                  </div>
                </div>
              </div>

              {/* Tips */}
              <div className="mt-4 bg-indigo-50 rounded-xl p-4 border border-indigo-100">
                <div className="flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-indigo-700 mb-1">Tips</p>
                    <ul className="text-xs text-indigo-600 space-y-1">
                      <li>• Use ↑↓ arrows to reorder categories</li>
                      <li>• Click <strong>Visible</strong> to hide a category</li>
                      <li>• Changes take effect after saving</li>
                      <li>• Recommended: 6–12 categories</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Unsaved changes banner */}
        {dirty && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-gray-900 text-white px-6 py-3 rounded-2xl shadow-2xl z-50">
            <span className="text-sm font-medium">You have unsaved changes</span>
            <button
              onClick={saveChanges}
              disabled={saving}
              className="px-4 py-1.5 bg-indigo-500 hover:bg-indigo-400 rounded-xl text-sm font-bold transition-colors"
            >
              {saving ? 'Saving…' : 'Save Now'}
            </button>
            <button onClick={fetchCategories} className="text-gray-400 hover:text-white transition-colors">
              <XCircle className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
