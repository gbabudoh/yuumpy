'use client';

import { useState, useEffect, useRef } from 'react';
import AdminLayout from '@/components/AdminLayout';
import {
  Video, Upload, Link2, Save, RefreshCw, CheckCircle2,
  Play, Image as ImageIcon, XCircle, AlertCircle, Eye,
  Film, Type, Quote
} from 'lucide-react';

interface HeroSettings {
  hero_video_url: string;
  hero_video_poster: string;
  hero_episode_number: string;
  hero_episode_title: string;
  hero_episode_quote: string;
}

export default function HeroVideoPage() {
  const [settings, setSettings] = useState<HeroSettings>({
    hero_video_url: '',
    hero_video_poster: '',
    hero_episode_number: 'Episode 01',
    hero_episode_title: "The Potter's Hands",
    hero_episode_quote: '"Every piece of clay holds a memory of the hands that shaped it."',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [dirty, setDirty] = useState(false);

  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadingPoster, setUploadingPoster] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [urlMode, setUrlMode] = useState(false);

  const videoInputRef = useRef<HTMLInputElement>(null);
  const posterInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { fetchSettings(); }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/hero-video');
      if (res.ok) setSettings(await res.json());
    } finally { setLoading(false); }
  };

  const update = (key: keyof HeroSettings, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setDirty(true);
    setSaved(false);
  };

  const uploadFile = async (file: File, type: 'video' | 'poster') => {
    const setUploading = type === 'video' ? setUploadingVideo : setUploadingPoster;
    setUploading(true);
    if (type === 'video') setVideoProgress(0);

    try {
      const form = new FormData();
      form.append('file', file);
      form.append('type', type);

      const res = await fetch('/api/admin/hero-video/upload', { method: 'POST', body: form });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Upload failed');

      if (type === 'video') {
        update('hero_video_url', data.url);
        setVideoProgress(100);
      } else {
        update('hero_video_poster', data.url);
      }
    } catch (e: any) {
      alert(`Upload failed: ${e.message}`);
    } finally {
      setUploading(false);
    }
  };

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/hero-video', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (res.ok) { setSaved(true); setDirty(false); setTimeout(() => setSaved(false), 3000); }
    } finally { setSaving(false); }
  };

  return (
    <AdminLayout>
      <div className="p-6 max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
              <Film className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Hero Video</h1>
              <p className="text-sm text-gray-400">Manage the homepage hero video and card overlay</p>
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
             : saving ? <><RefreshCw className="w-4 h-4 animate-spin" /> Saving…</>
             : <><Save className="w-4 h-4" /> Save Changes</>}
          </button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">

          {/* Left: Controls */}
          <div className="xl:col-span-3 space-y-5">

            {/* Video Upload */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <Video className="w-4 h-4 text-purple-500" />
                <h2 className="font-semibold text-gray-900">Hero Video</h2>
                <div className="flex gap-1 ml-auto">
                  <button
                    onClick={() => setUrlMode(false)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${!urlMode ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                  >
                    Upload File
                  </button>
                  <button
                    onClick={() => setUrlMode(true)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${urlMode ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                  >
                    Paste URL
                  </button>
                </div>
              </div>

              {urlMode ? (
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-2">Video URL</label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="url"
                        value={settings.hero_video_url}
                        onChange={e => update('hero_video_url', e.target.value)}
                        placeholder="https://your-cdn.com/hero.mp4"
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 outline-none"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">Supports .mp4, .webm. Can also be a direct CDN or MinIO URL.</p>
                </div>
              ) : (
                <div>
                  <input
                    ref={videoInputRef}
                    type="file"
                    accept="video/mp4,video/webm,video/ogg"
                    className="hidden"
                    onChange={e => e.target.files?.[0] && uploadFile(e.target.files[0], 'video')}
                  />
                  <button
                    onClick={() => videoInputRef.current?.click()}
                    disabled={uploadingVideo}
                    className="w-full border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center gap-3 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all group"
                  >
                    {uploadingVideo ? (
                      <>
                        <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin" />
                        <p className="text-sm font-semibold text-indigo-600">Uploading to MinIO…</p>
                        <div className="w-full bg-gray-100 rounded-full h-1.5 max-w-48">
                          <div className="bg-indigo-500 h-1.5 rounded-full transition-all" style={{ width: `${videoProgress}%` }} />
                        </div>
                      </>
                    ) : settings.hero_video_url ? (
                      <>
                        <CheckCircle2 className="w-8 h-8 text-green-500" />
                        <p className="text-sm font-semibold text-green-700">Video uploaded</p>
                        <p className="text-xs text-gray-400 text-center max-w-64 truncate">{settings.hero_video_url}</p>
                        <p className="text-xs text-indigo-500 font-medium group-hover:underline">Click to replace</p>
                      </>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-gray-300 group-hover:text-indigo-400 transition-colors" />
                        <p className="text-sm font-semibold text-gray-600 group-hover:text-indigo-600 transition-colors">Click to upload video</p>
                        <p className="text-xs text-gray-400">MP4, WebM — max 200MB</p>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Current URL preview */}
              {settings.hero_video_url && (
                <div className="mt-3 flex items-center gap-2 p-2 bg-green-50 rounded-lg border border-green-100">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />
                  <p className="text-xs text-green-700 truncate flex-1">{settings.hero_video_url}</p>
                  <button onClick={() => update('hero_video_url', '')} className="text-red-400 hover:text-red-600">
                    <XCircle className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Poster Image */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <ImageIcon className="w-4 h-4 text-blue-500" />
                <h2 className="font-semibold text-gray-900">Poster / Thumbnail</h2>
                <span className="text-xs text-gray-400 ml-1">— shown before video loads</span>
              </div>
              <input
                ref={posterInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                className="hidden"
                onChange={e => e.target.files?.[0] && uploadFile(e.target.files[0], 'poster')}
              />
              <div className="flex gap-3">
                <div
                  onClick={() => posterInputRef.current?.click()}
                  className="w-24 h-16 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center cursor-pointer hover:border-blue-300 hover:bg-blue-50/30 transition-all overflow-hidden shrink-0"
                >
                  {uploadingPoster ? (
                    <RefreshCw className="w-5 h-5 text-blue-400 animate-spin" />
                  ) : settings.hero_video_poster ? (
                    <img src={settings.hero_video_poster} className="w-full h-full object-cover" alt="poster" />
                  ) : (
                    <ImageIcon className="w-5 h-5 text-gray-300" />
                  )}
                </div>
                <div className="flex-1">
                  <input
                    type="url"
                    value={settings.hero_video_poster}
                    onChange={e => update('hero_video_poster', e.target.value)}
                    placeholder="Paste poster image URL or click thumbnail to upload"
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 outline-none"
                  />
                  <p className="text-xs text-gray-400 mt-1.5">Recommended: 16:9, 1920×1080px JPG/PNG</p>
                </div>
              </div>
            </div>

            {/* Card Overlay Text */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <Type className="w-4 h-4 text-indigo-500" />
                <h2 className="font-semibold text-gray-900">Card Overlay Text</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Episode Badge</label>
                  <input
                    type="text"
                    value={settings.hero_episode_number}
                    onChange={e => update('hero_episode_number', e.target.value)}
                    placeholder="Episode 01"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Title</label>
                  <input
                    type="text"
                    value={settings.hero_episode_title}
                    onChange={e => update('hero_episode_title', e.target.value)}
                    placeholder="The Potter's Hands"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
                    <Quote className="w-3 h-3 inline mr-1" />Quote
                  </label>
                  <textarea
                    value={settings.hero_episode_quote}
                    onChange={e => update('hero_episode_quote', e.target.value)}
                    rows={3}
                    placeholder='"Every piece of clay holds a memory…"'
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

                {/* Video preview */}
                <div className="p-4">
                  <div className="aspect-[4/5] rounded-2xl overflow-hidden bg-neutral-900 relative">
                    {settings.hero_video_url ? (
                      <video
                        key={settings.hero_video_url}
                        autoPlay
                        muted
                        loop
                        playsInline
                        poster={settings.hero_video_poster || undefined}
                        className="w-full h-full object-cover"
                      >
                        <source src={settings.hero_video_url} type="video/mp4" />
                      </video>
                    ) : settings.hero_video_poster ? (
                      <img src={settings.hero_video_poster} className="w-full h-full object-cover" alt="poster" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                        <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center">
                          <Play className="w-7 h-7 text-white/40 ml-1" />
                        </div>
                        <p className="text-white/30 text-xs font-medium">Upload a video to preview</p>
                      </div>
                    )}

                    {/* Card overlay preview */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="p-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl">
                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-indigo-400 mb-1.5">
                          {settings.hero_episode_number || 'Episode 01'}
                        </p>
                        <h3 className="text-sm font-bold text-white mb-1.5 leading-tight">
                          {settings.hero_episode_title || 'The Potter\'s Hands'}
                        </h3>
                        <p className="text-[10px] text-neutral-300 font-medium leading-relaxed italic line-clamp-2">
                          {settings.hero_episode_quote || '"Every piece of clay holds a memory…"'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status */}
                <div className="px-5 pb-4">
                  <div className={`flex items-center gap-2 p-2.5 rounded-xl ${settings.hero_video_url ? 'bg-green-50 text-green-700' : 'bg-orange-50 text-orange-600'}`}>
                    {settings.hero_video_url
                      ? <><CheckCircle2 className="w-4 h-4 shrink-0" /><span className="text-xs font-semibold">Video active on homepage</span></>
                      : <><AlertCircle className="w-4 h-4 shrink-0" /><span className="text-xs font-semibold">No video set — homepage shows placeholder</span></>
                    }
                  </div>
                </div>
              </div>

              {/* Tips */}
              <div className="mt-4 bg-purple-50 rounded-xl p-4 border border-purple-100">
                <p className="text-xs font-bold text-purple-700 mb-2">Best practices</p>
                <ul className="text-xs text-purple-600 space-y-1">
                  <li>• Keep video under 15 seconds for best UX</li>
                  <li>• Export as H.264 MP4 for broad compatibility</li>
                  <li>• 1080p is ideal; 720p is acceptable</li>
                  <li>• Always set a poster image as fallback</li>
                  <li>• No audio needed — video autoplays muted</li>
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
