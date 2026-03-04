'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Lock, Eye, EyeOff, CheckCircle, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);

  useEffect(() => {
    if (!token) { setError('Invalid reset link.'); setTokenValid(false); return; }
    (async () => {
      try {
        const res = await fetch('/api/customer/auth/verify-reset-token', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token }) });
        setTokenValid(res.ok);
        if (!res.ok) setError('This reset link has expired or is invalid.');
      } catch { setError('Unable to verify reset link.'); setTokenValid(false); }
    })();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError('');
    if (password !== confirmPassword) { setError('Passwords do not match'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/customer/auth/reset-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, password }) });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || 'Failed to reset password');
      setSuccess(true);
    } catch (err) { setError(err instanceof Error ? err.message : 'Failed to reset password'); }
    finally { setLoading(false); }
  };

  const inputClass = "w-full pl-11 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 focus:bg-white transition-all";

  if (success) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-7 sm:p-8 text-center">
        <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-5">
          <CheckCircle className="w-7 h-7 text-emerald-500" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Password reset successful</h2>
        <p className="text-[13px] text-gray-400 mb-6">You can now sign in with your new password</p>
        <Link href="/account/login" className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-800 transition-colors">
          Sign In <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  if (tokenValid === false) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-7 sm:p-8 text-center">
        <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-5">
          <Lock className="w-7 h-7 text-red-500" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Invalid reset link</h2>
        <p className="text-[13px] text-gray-400 mb-6">{error}</p>
        <Link href="/account/forgot-password" className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-800 transition-colors">
          Request New Link
        </Link>
      </div>
    );
  }

  if (tokenValid === null) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-7 sm:p-8 text-center">
        <div className="w-5 h-5 border-[3px] border-gray-200 border-t-gray-900 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-[13px] text-gray-400">Verifying reset link...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-7 sm:p-8">
      {error && (
        <div className="flex items-center gap-2.5 px-4 py-3 bg-red-50 border border-red-100 rounded-xl mb-6">
          <div className="w-2 h-2 rounded-full bg-red-400 shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-[13px] font-medium text-gray-700 mb-1.5">New password</label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400" />
            <input type={showPw ? 'text' : 'password'} required value={password} onChange={(e) => setPassword(e.target.value)} minLength={8} className={inputClass} placeholder="Min 8 characters" />
            <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors" aria-label="Toggle password visibility">
              {showPw ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
            </button>
          </div>
        </div>
        <div>
          <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Confirm password</label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400" />
            <input type={showPw ? 'text' : 'password'} required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 focus:bg-white transition-all" placeholder="Confirm password" />
          </div>
        </div>
        <button type="submit" disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-3 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-800 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm shadow-gray-900/10">
          {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Reset Password <ArrowRight className="w-4 h-4" /></>}
        </button>
      </form>
      <p className="text-center text-[13px] text-gray-500 mt-5">
        <Link href="/account/login" className="hover:text-gray-900 font-medium transition-colors">Back to Sign In</Link>
      </p>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-[#f8f8fa]">
      <Header />
      <div className="flex items-center justify-center px-4 py-12 sm:py-20">
        <div className="w-full max-w-[420px]">
          <div className="text-center mb-8">
            <Link href="/" className="inline-block mb-4">
              <Image src="/logo.png" alt="Yuumpy" width={120} height={48} className="h-10 w-auto mx-auto" priority />
            </Link>
            <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Set new password</h1>
            <p className="text-[14px] text-gray-400 mt-1">Choose a strong password for your account</p>
          </div>
          <Suspense fallback={
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-7 sm:p-8 text-center">
              <div className="w-5 h-5 border-[3px] border-gray-200 border-t-gray-900 rounded-full animate-spin mx-auto" />
            </div>
          }>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
      <Footer />
    </div>
  );
}
