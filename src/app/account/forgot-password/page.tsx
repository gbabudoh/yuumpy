'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, CheckCircle, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const res = await fetch('/api/customer/auth/forgot-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send reset email');
      setSuccess(true);
    } catch (err) { setError(err instanceof Error ? err.message : 'Failed to send reset email'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#f8f8fa]">
      <Header />
      <div className="flex items-center justify-center px-4 py-12 sm:py-20">
        <div className="w-full max-w-[420px]">
          <div className="text-center mb-8">
            <Link href="/" className="inline-block mb-4">
              <Image src="/logo.png" alt="Yuumpy" width={120} height={48} className="h-10 w-auto mx-auto" priority />
            </Link>
            <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">
              {success ? 'Check your email' : 'Reset your password'}
            </h1>
            <p className="text-[14px] text-gray-400 mt-1">
              {success ? `We sent a reset link to ${email}` : 'Enter your email to receive a reset link'}
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-7 sm:p-8">
            {success ? (
              <div className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-5">
                  <CheckCircle className="w-7 h-7 text-emerald-500" />
                </div>
                <p className="text-[13px] text-gray-500 mb-6 leading-relaxed">
                  Didn&apos;t receive it? Check your spam folder or try again.
                </p>
                <button onClick={() => { setSuccess(false); setEmail(''); }}
                  className="w-full py-3 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-800 transition-colors mb-3">
                  Send Another Email
                </button>
                <Link href="/account/login" className="block text-[13px] text-gray-500 hover:text-gray-900 font-medium py-2 transition-colors">
                  Back to Sign In
                </Link>
              </div>
            ) : (
              <>
                {error && (
                  <div className="flex items-center gap-2.5 px-4 py-3 bg-red-50 border border-red-100 rounded-xl mb-6">
                    <div className="w-2 h-2 rounded-full bg-red-400 shrink-0" />
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label htmlFor="email" className="block text-[13px] font-medium text-gray-700 mb-2">Email address</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400" />
                      <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 focus:bg-white transition-all"
                        placeholder="you@example.com" />
                    </div>
                  </div>
                  <button type="submit" disabled={loading}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-800 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm shadow-gray-900/10">
                    {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Send Reset Link <ArrowRight className="w-4 h-4" /></>}
                  </button>
                </form>
              </>
            )}
          </div>

          {!success && (
            <p className="text-center mt-6">
              <Link href="/account/login" className="text-[13px] text-gray-500 hover:text-gray-900 font-medium flex items-center justify-center gap-1 transition-colors">
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
              </Link>
            </p>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
