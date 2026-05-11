'use client';

import { useSellerContext } from '../layout';
import { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Save, 
  Image as ImageIcon, 
  Plus, 
  Trash2, 
  Instagram, 
  Twitter, 
  Globe,
  Loader2,
  CheckCircle,
  Camera
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function MakerProfileManagement() {
  const { seller, loading: sellerLoading } = useSellerContext();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [artisanStory, setArtisanStory] = useState('');
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [newSpecialty, setNewSpecialty] = useState('');
  const [studioImages, setStudioImages] = useState<string[]>([]);
  const [socialLinks, setSocialLinks] = useState({
    instagram: '',
    twitter: '',
    facebook: '',
    pinterest: '',
  });

  useEffect(() => {
    if (seller) {
      setArtisanStory(seller.artisan_story || '');
      
      try {
        const specs = typeof seller.specialties === 'string' ? JSON.parse(seller.specialties) : seller.specialties;
        setSpecialties(Array.isArray(specs) ? specs : []);
      } catch { setSpecialties([]); }

      try {
        const imgs = typeof seller.studio_images === 'string' ? JSON.parse(seller.studio_images) : seller.studio_images;
        setStudioImages(Array.isArray(imgs) ? imgs : []);
      } catch { setStudioImages([]); }

      try {
        const links = typeof seller.social_links === 'string' ? JSON.parse(seller.social_links) : seller.social_links;
        setSocialLinks(links || { instagram: '', twitter: '', facebook: '', pinterest: '' });
      } catch { setSocialLinks({ instagram: '', twitter: '', facebook: '', pinterest: '' }); }
    }
  }, [seller]);

  const handleSave = async () => {
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const res = await fetch('/api/seller/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'profile',
          storeName: seller?.store_name,
          description: seller?.description,
          phone: seller?.phone,
          website: seller?.website,
          city: seller?.city,
          stateProvince: seller?.state_province,
          postalCode: seller?.postal_code,
          country: seller?.country,
          artisanStory,
          specialties,
          studioImages,
          socialLinks,
        }),
      });

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError('Failed to update profile');
      }
    } catch {
      setError('An error occurred while saving');
    } finally {
      setLoading(false);
    }
  };

  const addSpecialty = () => {
    if (newSpecialty && !specialties.includes(newSpecialty)) {
      setSpecialties([...specialties, newSpecialty]);
      setNewSpecialty('');
    }
  };

  const removeSpecialty = (spec: string) => {
    setSpecialties(specialties.filter(s => s !== spec));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'artisan_studio');

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.url) {
        setStudioImages([...studioImages, data.url]);
      } else {
        setError(data.error || 'Upload failed');
      }
    } catch {
      setError('Failed to upload image');
    } finally {
      setLoading(false);
    }
  };

  const removeImage = (img: string) => {
    setStudioImages(studioImages.filter(i => i !== img));
  };

  if (sellerLoading) return <div className="p-20 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-600" /></div>;

  return (
    <div className="max-w-4xl mx-auto pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <Link href="/seller/dashboard" className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-indigo-600 uppercase tracking-widest transition-colors mb-4">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Manage Maker Profile</h1>
          <p className="text-slate-500 font-medium">Create a compelling story to build trust with your customers.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link 
            href={`/maker/${seller?.store_slug}`}
            target="_blank"
            className="px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-2xl text-sm font-bold hover:bg-slate-50 transition-all"
          >
            View Public Page
          </Link>
          <button 
            onClick={handleSave}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-sm font-bold transition-all shadow-lg shadow-indigo-600/20 disabled:bg-slate-300"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {success ? 'Saved!' : 'Save Changes'}
          </button>
        </div>
      </div>

      {success && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3 text-emerald-700 animate-fadeIn">
          <CheckCircle className="w-5 h-5" />
          <span className="text-sm font-bold">Your maker profile has been updated successfully!</span>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-700 animate-fadeIn">
          <Trash2 className="w-5 h-5" />
          <span className="text-sm font-bold">{error}</span>
        </div>
      )}

      <div className="space-y-8">
        {/* Story Section */}
        <section className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-indigo-600" />
            Your Artisan Story
          </h2>
          <div className="space-y-4">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Biography & Process</label>
            <textarea 
              value={artisanStory}
              onChange={(e) => setArtisanStory(e.target.value)}
              placeholder="Tell your customers who you are, where you're from, and the passion behind your craft..."
              className="w-full h-48 p-5 bg-slate-50 border border-slate-200 rounded-3xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-slate-900 leading-relaxed font-medium"
            />
          </div>
        </section>

        {/* Studio Gallery */}
        <section className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Camera className="w-5 h-5 text-indigo-600" />
            Studio Gallery
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {studioImages.map((img, idx) => (
              <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden group">
                <Image src={img} alt="Studio" fill className="object-cover" />
                <button 
                  onClick={() => removeImage(img)}
                  className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                >
                  <Trash2 className="w-6 h-6 text-white" />
                </button>
              </div>
            ))}
            
            <label className="relative aspect-square border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-2 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 transition-all cursor-pointer group">
              <input 
                type="file" 
                className="hidden" 
                accept="image/*"
                onChange={handleImageUpload}
                disabled={loading}
              />
              {loading ? (
                <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
              ) : (
                <>
                  <Plus className="w-6 h-6 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                  <span className="text-[10px] font-bold text-slate-400 group-hover:text-indigo-500 uppercase">Add Photo</span>
                </>
              )}
            </label>
          </div>
          <p className="text-xs text-slate-400 font-medium">Tip: Share photos of your workspace, tools, or work-in-progress to show the authenticity of your craft.</p>
        </section>

        {/* Specialties & Social */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <section className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-6">Craft Specialties</h2>
            <div className="flex flex-wrap gap-2 mb-4">
              {specialties.map((spec, idx) => (
                <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-xl text-xs font-bold border border-indigo-100">
                  {spec}
                  <button onClick={() => removeSpecialty(spec)}><X className="w-3 h-3" /></button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={newSpecialty}
                onChange={(e) => setNewSpecialty(e.target.value)}
                placeholder="e.g. Ceramics"
                className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              />
              <button onClick={addSpecialty} className="p-3 bg-indigo-600 text-white rounded-xl"><Plus className="w-4 h-4" /></button>
            </div>
          </section>

          <section className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-6 text-center">Social Links</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-2xl">
                <Instagram className="w-4 h-4 text-pink-500" />
                <input 
                  type="text" 
                  value={socialLinks.instagram}
                  onChange={(e) => setSocialLinks({...socialLinks, instagram: e.target.value})}
                  placeholder="Instagram URL" 
                  className="bg-transparent border-none focus:ring-0 text-sm flex-1"
                />
              </div>
              <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-2xl">
                <Twitter className="w-4 h-4 text-blue-400" />
                <input 
                  type="text" 
                  value={socialLinks.twitter}
                  onChange={(e) => setSocialLinks({...socialLinks, twitter: e.target.value})}
                  placeholder="Twitter URL" 
                  className="bg-transparent border-none focus:ring-0 text-sm flex-1"
                />
              </div>
              <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-2xl">
                <Globe className="w-4 h-4 text-slate-500" />
                <input 
                  type="text" 
                  value={socialLinks.facebook}
                  onChange={(e) => setSocialLinks({...socialLinks, facebook: e.target.value})}
                  placeholder="Facebook URL" 
                  className="bg-transparent border-none focus:ring-0 text-sm flex-1"
                />
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function X({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}
