'use client';

import { useState, useEffect } from 'react';

import { 
  Store, 
  Truck, 
  Bell, 
  ShieldCheck, 
  Phone, 
  Globe, 
  CheckCircle2, 
  ShoppingBag,
  Star,
  Save,
  Loader2,
  Info,
  MapPin,
  Zap,
  ChevronRight,
  Settings2,
  Lock,
  CreditCard
} from 'lucide-react';

export default function SellerSettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const [profile, setProfile] = useState({
    storeName: '', description: '', phone: '', website: '',
    city: '', stateProvince: '', postalCode: '', country: 'United States',
  });

  const [settings, setSettings] = useState({
    shippingPolicy: '', freeShippingThreshold: '', flatRateShipping: '5.99', processingTime: '1-3 business days',
    returnPolicy: '', returnWindowDays: '30', acceptsReturns: true,
    payoutSchedule: 'weekly', minimumPayout: '25.00',
    emailOnNewOrder: true, emailOnDispute: true, emailOnReview: true,
  });

  useEffect(() => {
    fetch('/api/seller/settings')
      .then(r => r.json())
      .then(data => {
        if (data.seller) {
          setProfile({
            storeName: data.seller.store_name || '', description: data.seller.description || '',
            phone: data.seller.phone || '', website: data.seller.website || '',
            city: data.seller.city || '', stateProvince: data.seller.state_province || '',
            postalCode: data.seller.postal_code || '', country: data.seller.country || 'United States',
          });
        }
        if (data.settings) {
          setSettings({
            shippingPolicy: data.settings.shipping_policy || '',
            freeShippingThreshold: data.settings.free_shipping_threshold?.toString() || '',
            flatRateShipping: data.settings.flat_rate_shipping?.toString() || '5.99',
            processingTime: data.settings.processing_time || '1-3 business days',
            returnPolicy: data.settings.return_policy || '',
            returnWindowDays: data.settings.return_window_days?.toString() || '30',
            acceptsReturns: Boolean(data.settings.accepts_returns),
            payoutSchedule: data.settings.payout_schedule || 'weekly',
            minimumPayout: data.settings.minimum_payout?.toString() || '25.00',
            emailOnNewOrder: Boolean(data.settings.email_on_new_order),
            emailOnDispute: Boolean(data.settings.email_on_dispute),
            emailOnReview: Boolean(data.settings.email_on_review),
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (type: string) => {
    setSaving(true);
    setMessage('');
    try {
      const res = await fetch('/api/seller/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, ...(type === 'profile' ? profile : settings) }),
      });
      if (res.ok) setMessage('Changes saved successfully!');
    } catch { setMessage('Failed to save changes.'); }
    finally { setSaving(false); setTimeout(() => setMessage(''), 3000); }
  };

  const tabs = [
    { id: 'profile', label: 'Store Profile', icon: Store },
    { id: 'shipping', label: 'Shipping & Returns', icon: Truck },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-full" />
          <div className="absolute inset-0 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-[10px] font-black text-indigo-600 uppercase tracking-widest">Configuration</span>
            <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Seller Settings</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Settings</h1>
          <p className="text-slate-500 font-medium">Manage your identities, preferences and store policies</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-10">
        {/* Sidebar Navigation */}
        <div className="lg:w-80 space-y-4">
          <div className="bg-white/40 backdrop-blur-xl border border-white/60 p-4 rounded-[2.5rem] shadow-xl shadow-slate-200/40 sticky top-8">
            <div className="px-4 py-2 mb-4">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Management</p>
            </div>
            <div className="space-y-2">
              {tabs.map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center justify-between group px-5 py-4 rounded-2xl transition-all duration-500 ${
                      isActive 
                        ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20' 
                        : 'text-slate-500 hover:bg-white hover:text-indigo-600 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors duration-500 ${
                        isActive ? 'bg-white/10' : 'bg-slate-50 group-hover:bg-indigo-50'
                      }`}>
                        <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-600'}`} />
                      </div>
                      <span className="text-xs font-black uppercase tracking-widest">{tab.label}</span>
                    </div>
                    <ChevronRight className={`w-4 h-4 transition-transform duration-500 ${isActive ? 'translate-x-0' : '-translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100'}`} />
                  </button>
                );
              })}
            </div>

            <div className="mt-8 pt-8 border-t border-slate-100/50 space-y-2">
              <div className="px-4 py-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">External</p>
              </div>
              <button className="w-full flex items-center gap-4 px-5 py-3 text-slate-400 hover:text-rose-600 transition-all text-xs font-bold">
                <Lock className="w-4 h-4" />
                Security & Privacy
              </button>
              <button className="w-full flex items-center gap-4 px-5 py-3 text-slate-400 hover:text-indigo-600 transition-all text-xs font-bold">
                <CreditCard className="w-4 h-4" />
                Payment Methods
              </button>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="flex-1">
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden p-8 md:p-12 relative group hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500">
            {activeTab === 'profile' && (
              <div className="space-y-10 animate-in slide-in-from-right-4 duration-500">
                <div className="flex items-center gap-4 mb-2">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center">
                    <Store className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900">Store Profile</h3>
                    <p className="text-slate-500 text-sm font-medium">This information will be displayed on your vendor shop</p>
                  </div>
                </div>

                {/* Sub-section: Basic Identity */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3 pb-2 border-b border-slate-50">
                    <Settings2 className="w-4 h-4 text-slate-300" />
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Basic Identity</h4>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between px-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Store Name</label>
                        <button className="text-slate-300 hover:text-indigo-500 transition-colors"><Info className="w-3 h-3" /></button>
                      </div>
                      <div className="relative group">
                        <Store className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                        <input 
                          className="w-full pl-12 pr-5 py-4 rounded-2xl bg-slate-50 border border-transparent text-slate-900 font-bold placeholder:text-slate-300 outline-none focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 transition-all"
                          placeholder="Your Brand Name"
                          value={profile.storeName} 
                          onChange={e => setProfile(p => ({ ...p, storeName: e.target.value }))} 
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Contact Phone</label>
                      <div className="relative group">
                        <Phone className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                        <input 
                          className="w-full pl-12 pr-5 py-4 rounded-2xl bg-slate-50 border border-transparent text-slate-900 font-bold outline-none focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 transition-all"
                          value={profile.phone} 
                          onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} 
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Store Website</label>
                      <div className="relative group">
                        <Globe className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                        <input 
                          className="w-full pl-12 pr-5 py-4 rounded-2xl bg-slate-50 border border-transparent text-slate-900 font-bold outline-none focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 transition-all"
                          value={profile.website} 
                          onChange={e => setProfile(p => ({ ...p, website: e.target.value }))} 
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sub-section: Business Location */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3 pb-2 border-b border-slate-50">
                    <MapPin className="w-4 h-4 text-slate-300" />
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Business Location</h4>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">City</label>
                      <input 
                        className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-transparent text-slate-900 font-bold outline-none focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 transition-all"
                        value={profile.city} onChange={e => setProfile(p => ({ ...p, city: e.target.value }))} 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">State / Province</label>
                      <input 
                        className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-transparent text-slate-900 font-bold outline-none focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 transition-all"
                        value={profile.stateProvince} onChange={e => setProfile(p => ({ ...p, stateProvince: e.target.value }))} 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Postal Code</label>
                      <input 
                        className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-transparent text-slate-900 font-bold outline-none focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 transition-all"
                        value={profile.postalCode} onChange={e => setProfile(p => ({ ...p, postalCode: e.target.value }))} 
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-2 px-1">
                    <Info className="w-4 h-4 text-slate-300" />
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Store Biography</label>
                  </div>
                  <textarea 
                    rows={4} 
                    className="w-full px-8 py-6 rounded-[2.5rem] bg-slate-50 border border-transparent text-slate-900 font-bold outline-none focus:bg-white focus:ring-8 focus:ring-indigo-500/5 focus:border-indigo-500/30 transition-all resize-none shadow-inner"
                    placeholder="Tell your customers about your brand legacy..."
                    value={profile.description} 
                    onChange={e => setProfile(p => ({ ...p, description: e.target.value }))} 
                  />
                </div>

                <div className="flex items-center justify-between gap-6 pt-10 border-t border-slate-50">
                  <div className="flex items-center gap-3">
                    {message && (
                      <div className="flex items-center gap-2 text-emerald-600 font-black text-[10px] uppercase tracking-widest bg-emerald-50 px-5 py-3 rounded-2xl border border-emerald-100 animate-in fade-in slide-in-from-left-4">
                        <CheckCircle2 className="w-4 h-4" /> {message}
                      </div>
                    )}
                  </div>
                  <button 
                    onClick={() => handleSave('profile')} 
                    disabled={saving} 
                    className="flex items-center gap-4 px-12 py-5 rounded-[2rem] bg-slate-900 text-white font-black text-xs uppercase tracking-[0.2em] hover:scale-[1.02] active:scale-95 transition-all shadow-2xl shadow-slate-900/30 disabled:opacity-50"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin text-white/50" /> : <Save className="w-4 h-4" />}
                    {saving ? 'Syncing...' : 'Confirm Profile'}
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'shipping' && (
              <div className="space-y-10 animate-in slide-in-from-right-4 duration-500">
                <div className="flex items-center gap-4 mb-2">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center">
                    <Truck className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900">Shipping & Returns</h3>
                    <p className="text-slate-500 text-sm font-medium">Define how you ship items and handle customer returns</p>
                  </div>
                </div>

                <div className="space-y-8">
                  {/* Logistics Partition */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 pb-2 border-b border-slate-50">
                      <Zap className="w-4 h-4 text-slate-300" />
                      <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Shipping Logistics</h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Flat Rate Shipping</label>
                        <div className="relative group">
                          <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-black text-xs">$</span>
                          <input 
                            type="number" 
                            step="0.01" 
                            className="w-full pl-10 pr-5 py-4 rounded-2xl bg-slate-50 border border-transparent text-slate-900 font-bold outline-none focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 transition-all"
                            value={settings.flatRateShipping} onChange={e => setSettings(s => ({ ...s, flatRateShipping: e.target.value }))} 
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Free Shipping Threshold</label>
                        <div className="relative group">
                          <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-black text-xs">$</span>
                          <input 
                            type="number" 
                            step="0.01" 
                            className="w-full pl-10 pr-5 py-4 rounded-2xl bg-slate-50 border border-transparent text-slate-900 font-bold outline-none focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 transition-all"
                            value={settings.freeShippingThreshold} onChange={e => setSettings(s => ({ ...s, freeShippingThreshold: e.target.value }))} 
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Handling Duration</label>
                        <div className="relative">
                          <select 
                            className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-transparent text-slate-900 font-bold outline-none focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 transition-all appearance-none cursor-pointer"
                            value={settings.processingTime} onChange={e => setSettings(s => ({ ...s, processingTime: e.target.value }))}
                          >
                            <option value="1-2 business days">⚡ 1-2 business days</option>
                            <option value="1-3 business days">📦 1-3 business days</option>
                            <option value="3-5 business days">🚛 3-5 business days</option>
                            <option value="5-7 business days">🐢 5-7 business days</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Returns Partition */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 pb-2 border-b border-slate-50">
                      <ShieldCheck className="w-4 h-4 text-slate-300" />
                      <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Customer Trust & Returns</h4>
                    </div>

                    <div className="flex flex-col md:flex-row gap-8 items-start">
                      <div className="bg-slate-50 p-8 rounded-[2rem] flex-1 w-full space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-slate-900 uppercase tracking-widest">Enable Returns Interface</span>
                          <button 
                            onClick={() => setSettings(s => ({ ...s, acceptsReturns: !s.acceptsReturns }))}
                            className={`w-14 h-8 rounded-full relative transition-all duration-500 ${settings.acceptsReturns ? 'bg-indigo-600 shadow-lg shadow-indigo-600/30' : 'bg-slate-200'}`}
                          >
                            <div className={`absolute top-1.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all duration-500 ${settings.acceptsReturns ? 'translate-x-[1.85rem]' : 'translate-x-1.5'}`} />
                          </button>
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 leading-relaxed">This will allow customers to request returns through the global Yuumpy interface according to your policy window.</p>
                      </div>

                      {settings.acceptsReturns && (
                        <div className="flex-1 w-full space-y-2 animate-in slide-in-from-left-4">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Return Eligibility Window (Days)</label>
                          <input 
                            type="number" 
                            className="w-full px-6 py-4 rounded-2xl bg-white border border-indigo-100/50 text-indigo-600 font-black text-lg outline-none focus:ring-8 focus:ring-indigo-500/5 transition-all shadow-xl shadow-slate-100"
                            value={settings.returnWindowDays} onChange={e => setSettings(s => ({ ...s, returnWindowDays: e.target.value }))} 
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Public Shipping Policy</label>
                    <textarea rows={3} className="w-full px-6 py-5 rounded-[2rem] bg-slate-50 border border-slate-50 text-slate-900 font-bold outline-none focus:bg-white transition-all resize-none" value={settings.shippingPolicy} onChange={e => setSettings(s => ({ ...s, shippingPolicy: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Public Return Policy</label>
                    <textarea rows={3} className="w-full px-6 py-5 rounded-[2rem] bg-slate-50 border border-slate-50 text-slate-900 font-bold outline-none focus:bg-white transition-all resize-none" value={settings.returnPolicy} onChange={e => setSettings(s => ({ ...s, returnPolicy: e.target.value }))} />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-4 pt-6">
                  {message && (
                    <div className="flex items-center gap-2 text-emerald-600 font-black text-[10px] uppercase tracking-widest bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100">
                      <CheckCircle2 className="w-4 h-4" /> {message}
                    </div>
                  )}
                  <button onClick={() => handleSave('settings')} disabled={saving} className="flex items-center gap-3 px-10 py-5 rounded-2xl bg-slate-900 text-white font-black text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-slate-900/20 disabled:opacity-50">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Config
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-10 animate-in slide-in-from-right-4 duration-500">
                <div className="flex items-center gap-4 mb-2">
                  <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center">
                    <Bell className="w-6 h-6 text-rose-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900">Communication</h3>
                    <p className="text-slate-500 text-sm font-medium">Control how and when we send you important updates</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {[
                    { key: 'emailOnNewOrder', label: 'Order Notifications', desc: 'Get an instant email for every customer purchase', icon: ShoppingBag, tint: 'bg-emerald-50 text-emerald-600' },
                    { key: 'emailOnDispute', label: 'Safety Alerts', desc: 'Critical alerts if a buyer opens a protection dispute', icon: ShieldCheck, tint: 'bg-rose-50 text-rose-600' },
                    { key: 'emailOnReview', label: 'Community Feedback', desc: 'Real-time alerts when customers leave store reviews', icon: Star, tint: 'bg-amber-50 text-amber-600' },
                  ].map(item => {
                    const ItemIcon = item.icon;
                    const isOn = settings[item.key as keyof typeof settings];
                    return (
                      <div 
                        key={item.key} 
                        className={`flex items-center justify-between p-8 rounded-[2rem] border transition-all duration-300 ${
                          isOn ? 'bg-white border-slate-100 shadow-md translate-x-2' : 'bg-slate-50 border-transparent opacity-60'
                        }`}
                      >
                        <div className="flex items-center gap-6">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${item.tint} border border-white`}>
                            <ItemIcon className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="text-sm font-black text-slate-900 uppercase tracking-widest mb-1">{item.label}</p>
                            <p className="text-slate-500 text-xs font-medium">{item.desc}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => setSettings(s => ({ ...s, [item.key]: !s[item.key as keyof typeof s] }))}
                          className={`w-16 h-8 rounded-full relative transition-all duration-300 ${isOn ? 'bg-slate-900' : 'bg-slate-300'}`}
                        >
                          <div className={`absolute top-1.5 w-5 h-5 rounded-full bg-white transition-all duration-300 ${isOn ? 'translate-x-9' : 'translate-x-1.5'}`} />
                        </button>
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center justify-end gap-4 pt-6">
                  {message && (
                    <div className="flex items-center gap-2 text-emerald-600 font-black text-[10px] uppercase tracking-widest bg-emerald-50 px-4 py-2 rounded-xl">
                      <CheckCircle2 className="w-4 h-4" /> {message}
                    </div>
                  )}
                  <button onClick={() => handleSave('settings')} disabled={saving} className="flex items-center gap-3 px-10 py-5 rounded-2xl bg-slate-900 text-white font-black text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-slate-900/20 disabled:opacity-50">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Alerts
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
