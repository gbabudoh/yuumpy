'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Settings, User, Lock, MapPin, Plus, Edit, Trash2,
  LogOut, Save, Eye, EyeOff, Store, Sparkles, ArrowLeft, Check
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface Customer { id: number; email: string; firstName: string; lastName: string; phone: string; createdAt: string; }
interface Address { id: number; address_type: string; first_name: string; last_name: string; address_line1: string; address_line2?: string; city: string; county?: string; postcode: string; country: string; phone?: string; is_default: number; }

export default function SettingsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'addresses' | 'selling'>('profile');

  // Profile
  const [profileForm, setProfileForm] = useState({ firstName: '', lastName: '', email: '', phone: '' });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: 'success'|'error'; text: string }|null>(null);

  // Password
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showPw, setShowPw] = useState({ current: false, new: false, confirm: false });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMsg, setPwMsg] = useState<{ type: 'success'|'error'; text: string }|null>(null);

  // Address
  const [addrForm, setAddrForm] = useState<Partial<Address>>({ address_type: 'shipping', first_name: '', last_name: '', address_line1: '', address_line2: '', city: '', county: '', postcode: '', country: 'United Kingdom', phone: '', is_default: 0 });
  const [editingAddr, setEditingAddr] = useState<number|null>(null);
  const [addrSaving, setAddrSaving] = useState(false);
  const [showAddrForm, setShowAddrForm] = useState(false);

  // Seller
  const [sellerStatus, setSellerStatus] = useState<{ hasSeller: boolean; seller?: { id: number; store_name: string; store_slug: string; status: string; is_verified: boolean } }|null>(null);
  const [sellerForm, setSellerForm] = useState({ storeName: '', businessName: '', description: '', city: '', country: 'United Kingdom' });
  const [sellerSaving, setSellerSaving] = useState(false);
  const [sellerMsg, setSellerMsg] = useState<{ type: 'success'|'error'; text: string }|null>(null);

  useEffect(() => { checkAuth(); }, []);
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'selling' || tab === 'profile' || tab === 'password' || tab === 'addresses') setActiveTab(tab);
  }, [searchParams]);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/customer/auth/me');
      if (!res.ok) { router.push('/account/login'); return; }
      const data = await res.json();
      setCustomer(data.customer);
      setProfileForm({ firstName: data.customer.firstName, lastName: data.customer.lastName, email: data.customer.email, phone: data.customer.phone || '' });
      await Promise.all([fetchProfile(), fetchAddresses(), fetchSellerStatus()]);
    } catch { router.push('/account/login'); }
  };

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/customer/profile');
      if (res.ok) {
        const d = await res.json();
        setCustomer(d.customer);
        setProfileForm({ firstName: d.customer.firstName, lastName: d.customer.lastName, email: d.customer.email, phone: d.customer.phone || '' });
      }
    } catch {} finally { setLoading(false); }
  };

  const fetchAddresses = async () => {
    try { const res = await fetch('/api/customer/addresses'); if (res.ok) { const d = await res.json(); setAddresses(d.addresses || []); } } catch {}
  };

  const fetchSellerStatus = async () => {
    try { const res = await fetch('/api/customer/become-seller'); if (res.ok) { const d = await res.json(); setSellerStatus(d); } } catch {}
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setProfileSaving(true); setProfileMsg(null);
    try {
      const res = await fetch('/api/customer/profile', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(profileForm) });
      const d = await res.json();
      if (res.ok) { setProfileMsg({ type: 'success', text: 'Profile updated successfully' }); setCustomer({ ...customer!, ...profileForm }); }
      else setProfileMsg({ type: 'error', text: d.error || 'Failed to update' });
    } catch { setProfileMsg({ type: 'error', text: 'Failed to update profile' }); }
    finally { setProfileSaving(false); }
  };

  const handlePwSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setPwSaving(true); setPwMsg(null);
    if (pwForm.newPassword !== pwForm.confirmPassword) { setPwMsg({ type: 'error', text: 'Passwords do not match' }); setPwSaving(false); return; }
    try {
      const res = await fetch('/api/customer/change-password', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword }) });
      const d = await res.json();
      if (res.ok) { setPwMsg({ type: 'success', text: 'Password changed successfully' }); setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' }); }
      else setPwMsg({ type: 'error', text: d.error || 'Failed to change password' });
    } catch { setPwMsg({ type: 'error', text: 'Failed to change password' }); }
    finally { setPwSaving(false); }
  };

  const handleAddrSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setAddrSaving(true);
    try {
      const method = editingAddr ? 'PUT' : 'POST';
      const body = editingAddr ? { ...addrForm, id: editingAddr } : addrForm;
      const res = await fetch('/api/customer/addresses', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (res.ok) { fetchAddresses(); resetAddrForm(); }
    } catch {} finally { setAddrSaving(false); }
  };

  const resetAddrForm = () => {
    setAddrForm({ address_type: 'shipping', first_name: '', last_name: '', address_line1: '', address_line2: '', city: '', county: '', postcode: '', country: 'United Kingdom', phone: '', is_default: 0 });
    setEditingAddr(null); setShowAddrForm(false);
  };

  const handleDeleteAddr = async (id: number) => {
    if (!confirm('Delete this address?')) return;
    try { const res = await fetch(`/api/customer/addresses?id=${id}`, { method: 'DELETE' }); if (res.ok) fetchAddresses(); } catch {}
  };

  const handleSellerSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSellerSaving(true); setSellerMsg(null);
    try {
      const res = await fetch('/api/customer/become-seller', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(sellerForm) });
      const d = await res.json();
      if (res.ok) { setSellerMsg({ type: 'success', text: d.message || 'Application submitted!' }); fetchSellerStatus(); }
      else setSellerMsg({ type: 'error', text: d.error || 'Failed to submit' });
    } catch { setSellerMsg({ type: 'error', text: 'Failed to submit application' }); }
    finally { setSellerSaving(false); }
  };

  const inputClass = "w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 focus:bg-white transition-all";

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f8fa] flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-14 h-14 mx-auto">
            <div className="w-14 h-14 border-[3px] border-gray-200 rounded-full animate-spin border-t-gray-900" />
            <Sparkles className="w-5 h-5 text-gray-900 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="mt-4 text-gray-400 text-sm">Loading settings...</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { key: 'profile' as const, icon: User, label: 'Profile' },
    { key: 'password' as const, icon: Lock, label: 'Password' },
    { key: 'addresses' as const, icon: MapPin, label: 'Addresses' },
    { key: 'selling' as const, icon: Store, label: 'Selling' },
  ];

  return (
    <div className="min-h-screen bg-[#f8f8fa]">
      <Header />

      <div className="bg-white border-b border-gray-100/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-5 sm:py-6">
          <div className="flex items-center gap-3 mb-5">
            <Link href="/account" className="p-2 -ml-2 rounded-xl hover:bg-gray-50 transition-colors" aria-label="Back to account">
              <ArrowLeft className="w-5 h-5 text-gray-400" />
            </Link>
            <div>
              <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 tracking-tight">Settings</h1>
              <p className="text-[13px] text-gray-400 mt-0.5">Manage your account preferences</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 overflow-x-auto scrollbar-hide -mb-px">
            {tabs.map((t) => (
              <button key={t.key} onClick={() => setActiveTab(t.key)}
                className={`flex items-center gap-2 px-4 py-2.5 text-[13px] font-medium rounded-t-xl border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === t.key
                    ? 'border-gray-900 text-gray-900 bg-gray-50/50'
                    : 'border-transparent text-gray-400 hover:text-gray-600'
                }`}>
                <t.icon className="w-4 h-4" /> {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8">
            <h2 className="text-[17px] font-semibold text-gray-900 mb-6">Profile Information</h2>
            <form onSubmit={handleProfileSubmit} className="space-y-5 max-w-lg">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-medium text-gray-700 mb-1.5">First name</label>
                  <input type="text" value={profileForm.firstName} onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })} required className={inputClass} />
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Last name</label>
                  <input type="text" value={profileForm.lastName} onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })} required className={inputClass} />
                </div>
              </div>
              <div>
                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Email address</label>
                <input type="email" value={profileForm.email} onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })} required className={inputClass} />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Phone number</label>
                <input type="tel" value={profileForm.phone} onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })} className={inputClass} />
              </div>
              {profileMsg && (
                <div className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm ${profileMsg.type === 'success' ? 'bg-emerald-50 border border-emerald-100 text-emerald-700' : 'bg-red-50 border border-red-100 text-red-700'}`}>
                  <div className={`w-2 h-2 rounded-full shrink-0 ${profileMsg.type === 'success' ? 'bg-emerald-400' : 'bg-red-400'}`} />
                  {profileMsg.text}
                </div>
              )}
              <button type="submit" disabled={profileSaving}
                className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                <Save className="w-4 h-4" /> {profileSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>
        )}

        {/* Password Tab */}
        {activeTab === 'password' && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8">
            <h2 className="text-[17px] font-semibold text-gray-900 mb-6">Change Password</h2>
            <form onSubmit={handlePwSubmit} className="space-y-5 max-w-md">
              {(['current', 'new', 'confirm'] as const).map((field) => {
                const label = field === 'current' ? 'Current password' : field === 'new' ? 'New password' : 'Confirm new password';
                const key = field === 'current' ? 'currentPassword' : field === 'new' ? 'newPassword' : 'confirmPassword';
                return (
                  <div key={field}>
                    <label className="block text-[13px] font-medium text-gray-700 mb-1.5">{label}</label>
                    <div className="relative">
                      <input type={showPw[field] ? 'text' : 'password'} value={pwForm[key]}
                        onChange={(e) => setPwForm({ ...pwForm, [key]: e.target.value })} required minLength={field !== 'current' ? 6 : undefined}
                        className={`${inputClass} pr-12`} />
                      <button type="button" onClick={() => setShowPw({ ...showPw, [field]: !showPw[field] })}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors" aria-label="Toggle password visibility">
                        {showPw[field] ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
                      </button>
                    </div>
                    {field === 'new' && <p className="text-[11px] text-gray-400 mt-1">Must be at least 6 characters</p>}
                  </div>
                );
              })}
              {pwMsg && (
                <div className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm ${pwMsg.type === 'success' ? 'bg-emerald-50 border border-emerald-100 text-emerald-700' : 'bg-red-50 border border-red-100 text-red-700'}`}>
                  <div className={`w-2 h-2 rounded-full shrink-0 ${pwMsg.type === 'success' ? 'bg-emerald-400' : 'bg-red-400'}`} />
                  {pwMsg.text}
                </div>
              )}
              <button type="submit" disabled={pwSaving}
                className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                <Save className="w-4 h-4" /> {pwSaving ? 'Changing...' : 'Change Password'}
              </button>
            </form>
          </div>
        )}

        {/* Addresses Tab */}
        {activeTab === 'addresses' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-[17px] font-semibold text-gray-900">Saved Addresses</h2>
              <button onClick={() => { resetAddrForm(); setShowAddrForm(true); }}
                className="flex items-center gap-1.5 px-4 py-2 bg-gray-900 text-white text-[13px] font-medium rounded-xl hover:bg-gray-800 transition-colors">
                <Plus className="w-4 h-4" /> Add Address
              </button>
            </div>

            {showAddrForm && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8">
                <h3 className="text-[15px] font-semibold text-gray-900 mb-5">{editingAddr ? 'Edit Address' : 'New Address'}</h3>
                <form onSubmit={handleAddrSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[13px] font-medium text-gray-700 mb-1.5">First name</label>
                      <input type="text" value={addrForm.first_name} onChange={(e) => setAddrForm({ ...addrForm, first_name: e.target.value })} required className={inputClass} />
                    </div>
                    <div>
                      <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Last name</label>
                      <input type="text" value={addrForm.last_name} onChange={(e) => setAddrForm({ ...addrForm, last_name: e.target.value })} required className={inputClass} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Address line 1</label>
                    <input type="text" value={addrForm.address_line1} onChange={(e) => setAddrForm({ ...addrForm, address_line1: e.target.value })} required className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Address line 2 <span className="text-gray-400 font-normal">(optional)</span></label>
                    <input type="text" value={addrForm.address_line2} onChange={(e) => setAddrForm({ ...addrForm, address_line2: e.target.value })} className={inputClass} />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[13px] font-medium text-gray-700 mb-1.5">City</label>
                      <input type="text" value={addrForm.city} onChange={(e) => setAddrForm({ ...addrForm, city: e.target.value })} required className={inputClass} />
                    </div>
                    <div>
                      <label className="block text-[13px] font-medium text-gray-700 mb-1.5">County</label>
                      <input type="text" value={addrForm.county} onChange={(e) => setAddrForm({ ...addrForm, county: e.target.value })} className={inputClass} />
                    </div>
                    <div>
                      <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Postcode</label>
                      <input type="text" value={addrForm.postcode} onChange={(e) => setAddrForm({ ...addrForm, postcode: e.target.value })} required className={inputClass} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Country</label>
                      <input type="text" value={addrForm.country} onChange={(e) => setAddrForm({ ...addrForm, country: e.target.value })} required className={inputClass} />
                    </div>
                    <div>
                      <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Phone</label>
                      <input type="tel" value={addrForm.phone} onChange={(e) => setAddrForm({ ...addrForm, phone: e.target.value })} className={inputClass} />
                    </div>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={addrForm.is_default === 1} onChange={(e) => setAddrForm({ ...addrForm, is_default: e.target.checked ? 1 : 0 })}
                      className="w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900/20" />
                    <span className="text-[13px] text-gray-700">Set as default address</span>
                  </label>
                  <div className="flex gap-3 pt-2">
                    <button type="submit" disabled={addrSaving}
                      className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-800 disabled:opacity-50 transition-all">
                      <Save className="w-4 h-4" /> {addrSaving ? 'Saving...' : 'Save Address'}
                    </button>
                    <button type="button" onClick={resetAddrForm}
                      className="px-5 py-2.5 border border-gray-200 text-sm font-medium text-gray-600 rounded-xl hover:bg-gray-50 transition-colors">Cancel</button>
                  </div>
                </form>
              </div>
            )}

            {addresses.length === 0 && !showAddrForm ? (
              <div className="bg-white rounded-2xl border border-gray-100 px-6 py-16 text-center">
                <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-7 h-7 text-gray-300" />
                </div>
                <p className="text-sm font-medium text-gray-900 mb-1">No addresses saved</p>
                <p className="text-[13px] text-gray-400">Add an address to speed up checkout</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {addresses.map((addr) => (
                  <div key={addr.id} className="bg-white rounded-2xl border border-gray-100 p-5 hover:border-gray-200 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900 capitalize">{addr.address_type}</span>
                        {addr.is_default === 1 && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-900 text-white text-[10px] font-semibold rounded-full">
                            <Check className="w-3 h-3" /> Default
                          </span>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => { setAddrForm(addr); setEditingAddr(addr.id); setShowAddrForm(true); }}
                          className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50 transition-colors" aria-label="Edit address">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDeleteAddr(addr.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors" aria-label="Delete address">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="text-[13px] text-gray-500 space-y-0.5 leading-relaxed">
                      <p className="font-medium text-gray-700">{addr.first_name} {addr.last_name}</p>
                      <p>{addr.address_line1}</p>
                      {addr.address_line2 && <p>{addr.address_line2}</p>}
                      <p>{addr.city}{addr.county && `, ${addr.county}`}</p>
                      <p>{addr.postcode}</p>
                      <p>{addr.country}</p>
                      {addr.phone && <p className="mt-1.5 text-gray-400">{addr.phone}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Selling Tab */}
        {activeTab === 'selling' && (
          <div>
            {sellerStatus?.hasSeller ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-md shadow-indigo-500/25">
                    <Store className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-[17px] font-semibold text-gray-900">Your Seller Account</h2>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl mb-4">
                  <div>
                    <p className="text-[12px] text-gray-400 mb-0.5">Store Name</p>
                    <p className="text-sm font-semibold text-gray-900">{sellerStatus.seller?.store_name}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide ${
                    sellerStatus.seller?.status === 'approved' ? 'bg-emerald-50 text-emerald-700' :
                    sellerStatus.seller?.status === 'pending' ? 'bg-amber-50 text-amber-700' :
                    sellerStatus.seller?.status === 'rejected' ? 'bg-red-50 text-red-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>{sellerStatus.seller?.status}</span>
                </div>

                {sellerStatus.seller?.status === 'approved' && (
                  <Link href="/seller/dashboard"
                    className="flex items-center justify-center gap-2 w-full py-3 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition-colors">
                    <Store className="w-4 h-4" /> Go to Seller Dashboard
                  </Link>
                )}
                {sellerStatus.seller?.status === 'pending' && (
                  <div className="flex items-center gap-2.5 px-4 py-3 bg-amber-50 border border-amber-100 rounded-xl">
                    <div className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                    <p className="text-[13px] text-amber-700">Your application is under review. You&apos;ll be notified once approved.</p>
                  </div>
                )}
                {sellerStatus.seller?.status === 'rejected' && (
                  <div className="flex items-center gap-2.5 px-4 py-3 bg-red-50 border border-red-100 rounded-xl">
                    <div className="w-2 h-2 rounded-full bg-red-400 shrink-0" />
                    <p className="text-[13px] text-red-700">Your application was not approved. Please contact support.</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-md shadow-indigo-500/25">
                    <Store className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-[17px] font-semibold text-gray-900">Start Selling on Yuumpy</h2>
                </div>
                <p className="text-[13px] text-gray-400 mb-7 ml-[52px]">Set up your store and reach customers worldwide</p>

                <form onSubmit={handleSellerSubmit} className="space-y-5 max-w-lg">
                  <div>
                    <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Store name</label>
                    <input type="text" value={sellerForm.storeName} onChange={(e) => setSellerForm({ ...sellerForm, storeName: e.target.value })} required placeholder="e.g. My Awesome Store" className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Business name <span className="text-gray-400 font-normal">(optional)</span></label>
                    <input type="text" value={sellerForm.businessName} onChange={(e) => setSellerForm({ ...sellerForm, businessName: e.target.value })} placeholder="Legal business name" className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Description <span className="text-gray-400 font-normal">(optional)</span></label>
                    <textarea value={sellerForm.description} onChange={(e) => setSellerForm({ ...sellerForm, description: e.target.value })} rows={3} placeholder="What makes your store special?"
                      className={`${inputClass} resize-none`} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[13px] font-medium text-gray-700 mb-1.5">City</label>
                      <input type="text" value={sellerForm.city} onChange={(e) => setSellerForm({ ...sellerForm, city: e.target.value })} required className={inputClass} />
                    </div>
                    <div>
                      <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Country</label>
                      <input type="text" value={sellerForm.country} onChange={(e) => setSellerForm({ ...sellerForm, country: e.target.value })} required className={inputClass} />
                    </div>
                  </div>
                  {sellerMsg && (
                    <div className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm ${sellerMsg.type === 'success' ? 'bg-emerald-50 border border-emerald-100 text-emerald-700' : 'bg-red-50 border border-red-100 text-red-700'}`}>
                      <div className={`w-2 h-2 rounded-full shrink-0 ${sellerMsg.type === 'success' ? 'bg-emerald-400' : 'bg-red-400'}`} />
                      {sellerMsg.text}
                    </div>
                  )}
                  <button type="submit" disabled={sellerSaving}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                    <Store className="w-4 h-4" /> {sellerSaving ? 'Submitting...' : 'Apply to Sell'}
                  </button>
                </form>
              </div>
            )}
          </div>
        )}

      </main>
      <Footer />
    </div>
  );
}
