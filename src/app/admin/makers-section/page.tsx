'use client';

import { useState, useEffect, useRef } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { imgproxy } from '@/lib/imgproxy';
import {
  Image as ImageIcon, Upload, Save, RefreshCw, CheckCircle2,
  XCircle, AlertCircle, Eye, Quote, Type
} from 'lucide-react';

interface MakersSettings {
  makers_image_url: string;
  makers_quote: string;
  makers_label: string;
}

const DEFAULTS: MakersSettings = {
  makers_image_url: '',
  makers_quote: '"The beauty is in the imperfections."',
  makers_label: 'Provenance',
};

export default function MakersSectionPage() {
  const [settings, setSettings] = useState<MakersSettings>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { fetchSettings(); }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/makers-section');
      if (res.ok) setSettings(await res.json());
    } finally {
      setLoading(false);
    }
  };

  const update = (key: keyof MakersSettings, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setDirty(true);
    setSaved(false);
  };

  const uploadImage = async (file: File) => {
    setUploading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      form.append('folder', 'makers-section');

      const res = await fetch('/api/upload', { method: 'POST', body: form });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Upload failed');
      update('makers_image_url', data.url);
    } catch (e: any) {
      alert(`Upload failed: ${e.message}`);
    } finally {
      setUploading(false);
    }
  };

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/makers-section', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        setSaved(true);
        setDirty(false);
        setTimeout(() => setSaved(false), 3000);
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-6 h-6 animate-spin text-purple-400" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6 max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
              <ImageIcon className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Makers Section</h1>
              <p className="text-sm text-gray-400">Manage the homepage &ldquo;Meet the Makers&rdquo; feature image and quote</p>
            </div>
          </div>
          <button
            onClick={save}
            disabled={!dirty || saving}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
              saved ? 'bg-green-100 text-green-700 border border-green-200'
              : dirty ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            {saved ? <><CheckCircle2 className="w-4 h-4" /> Saved!</>
             : saving ? <><RefreshCw className="w-4 h-4 animate-spin" /> Saving&hellip;</>
             : <><Save className="w-4 h-4" /> Save Changes</>}
          </button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">

          {/* Left: Controls */}
          <div className="xl:col-span-3 space-y-5">

            {/* Image Upload */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <ImageIcon className="w-4 h-4 text-purple-500" />
                <h2 className="font-semibold text-gray-900">Feature Image</h2>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp,image/avif"
                className="hidden"
                onChange={e => e.target.files?.[0] && uploadImage(e.target.files[0])}
              />

              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-full border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center gap-3 hover:border-purple-300 hover:bg-purple-50/30 transition-all group"
              >
                {uploading ? (
                  <>
                    <RefreshCw className="w-8 h-8 text-purple-400 animate-spin" />
                    <p className="text-sm font-semibold text-purple-600">Uploading to MinIO&hellip;</p>
                  </>
                ) : settings.makers_image_url ? (
                  <>
                    <CheckCircle2 className="w-8 h-8 text-green-500" />
                    <p className="text-sm font-semibold text-green-700">Image uploaded</p>
                    <p className="text-xs text-gray-400 text-center max-w-64 truncate">{settings.makers_image_url}</p>
                    <p className="text-xs text-purple-500 font-medium group-hover:underline">Click to replace</p>
                  </>
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-gray-300 group-hover:text-purple-400 transition-colors" />
                    <p className="text-sm font-semibold text-gray-600 group-hover:text-purple-600 transition-colors">Click to upload image</p>
                    <p className="text-xs text-gray-400">JPG, PNG, WebP, AVIF — recommended 4:5 ratio</p>
                  </>
                )}
              </button>

              {settings.makers_image_url && (
                <div className="mt-3 flex items-center gap-2 p-2 bg-green-50 rounded-lg border border-green-100">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />
                  <p className="text-xs text-green-700 truncate flex-1">{settings.makers_image_url}</p>
                  <button onClick={() => update('makers_image_url', '')} className="text-red-400 hover:text-red-600">
                    <XCircle className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              <div className="mt-4">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Or paste image URL</label>
                <input
                  type="url"
                  value={settings.makers_image_url}
                  onChange={e => update('makers_image_url', e.target.value)}
                  placeholder="https://your-cdn.com/image.jpg"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 outline-none"
                />
              </div>
            </div>

            {/* Overlay Text */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <Type className="w-4 h-4 text-indigo-500" />
                <h2 className="font-semibold text-gray-900">Overlay Text</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Label</label>
                  <input
                    type="text"
                    value={settings.makers_label}
                    onChange={e => update('makers_label', e.target.value)}
                    placeholder="Provenance"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 outline-none"
                  />
                  <p className="text-xs text-gray-400 mt-1">Shown in small caps above the quote</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
                    <Quote className="w-3 h-3 inline mr-1" />Quote
                  </label>
                  <textarea
                    value={settings.makers_quote}
                    onChange={e => update('makers_quote', e.target.value)}
                    rows={3}
                    placeholder='"The beauty is in the imperfections."'
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 outline-none resize-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right: Preview */}
          <div className="xl:col-span-2">
            <div className="sticky top-6">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
                  <Eye className="w-4 h-4 text-gray-400" />
                  <h2 className="font-semibold text-gray-900 text-sm">Live Preview</h2>
                </div>

                <div className="p-4">
                  <div className="aspect-[4/5] rounded-2xl overflow-hidden bg-neutral-950 relative">
                    {/* Gradient mesh background (always visible as underlay) */}
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/40 via-neutral-900 to-purple-900/30" />
                    <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-indigo-600/25 rounded-full blur-[60px]" />
                    <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-purple-600/20 rounded-full blur-[40px]" />

                    {settings.makers_image_url ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={imgproxy(settings.makers_image_url, 400, 500)}
                        alt="Makers section preview"
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                        <ImageIcon className="w-10 h-10 text-white/20" />
                        <p className="text-white/30 text-xs font-medium">No image yet</p>
                      </div>
                    )}

                    {/* Quote overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <p className="text-[9px] font-black uppercase tracking-[0.3em] text-indigo-400 mb-2">
                        {settings.makers_label || 'Provenance'}
                      </p>
                      <p className="text-sm font-bold italic tracking-tight leading-tight text-white">
                        {settings.makers_quote || '"The beauty is in the imperfections."'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="px-5 pb-4">
                  <div className={`flex items-center gap-2 p-2.5 rounded-xl ${settings.makers_image_url ? 'bg-green-50 text-green-700' : 'bg-orange-50 text-orange-600'}`}>
                    {settings.makers_image_url
                      ? <><CheckCircle2 className="w-4 h-4 shrink-0" /><span className="text-xs font-semibold">Image active on homepage</span></>
                      : <><AlertCircle className="w-4 h-4 shrink-0" /><span className="text-xs font-semibold">No image set — homepage shows decorative placeholder</span></>
                    }
                  </div>
                </div>
              </div>

              <div className="mt-4 bg-purple-50 rounded-xl p-4 border border-purple-100">
                <p className="text-xs font-bold text-purple-700 mb-2">Best practices</p>
                <ul className="text-xs text-purple-600 space-y-1">
                  <li>• Use a 4:5 portrait ratio image</li>
                  <li>• Dark or moody tones work best with the overlay</li>
                  <li>• Keep subjects centred — edges may be clipped on mobile</li>
                  <li>• Recommended: 800×1000px or larger</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Unsaved banner */}
        {dirty && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-gray-900 text-white px-6 py-3 rounded-2xl shadow-2xl z-50">
            <span className="text-sm font-medium">Unsaved changes</span>
            <button onClick={save} disabled={saving} className="px-4 py-1.5 bg-indigo-500 hover:bg-indigo-400 rounded-xl text-sm font-bold">
              {saving ? 'Saving…' : 'Save Now'}
            </button>
            <button onClick={fetchSettings} className="text-gray-400 hover:text-white">
              <XCircle className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
