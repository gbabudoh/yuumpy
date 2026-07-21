'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Mail, CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

function VerifyEmailStatus() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) { setError('Invalid verification link.'); setStatus('error'); return; }
    (async () => {
      try {
        const res = await fetch('/api/customer/auth/verify-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Verification failed');
        setStatus('success');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Verification failed');
        setStatus('error');
      }
    })();
  }, [token]);

  if (status === 'loading') {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-7 sm:p-8 text-center">
        <div className="w-5 h-5 border-[3px] border-gray-200 border-t-gray-900 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-[13px] text-gray-400">Verifying your email...</p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-7 sm:p-8 text-center">
        <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-5">
          <XCircle className="w-7 h-7 text-red-500" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Verification failed</h2>
        <p className="text-[13px] text-gray-400 mb-6">{error}</p>
        <Link href="/account/login" className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-800 transition-colors">
          Back to Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-7 sm:p-8 text-center">
      <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-5">
        <CheckCircle className="w-7 h-7 text-emerald-500" />
      </div>
      <h2 className="text-lg font-semibold text-gray-900 mb-2">Email verified</h2>
      <p className="text-[13px] text-gray-400 mb-6">Your account is confirmed — you can now sign in</p>
      <Link href="/account/login" className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-800 transition-colors">
        Sign In <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-[#f8f8fa]">
      <Header />
      <div className="flex items-center justify-center px-4 py-12 sm:py-20">
        <div className="w-full max-w-[420px]">
          <div className="text-center mb-8">
            <Link href="/" className="inline-block mb-4">
              <Image src="/logo.png" alt="Yuumpy" width={120} height={48} className="h-10 w-auto mx-auto" priority />
            </Link>
            <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center mx-auto mb-3">
              <Mail className="w-6 h-6 text-purple-600" />
            </div>
            <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Email verification</h1>
          </div>
          <Suspense fallback={
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-7 sm:p-8 text-center">
              <div className="w-5 h-5 border-[3px] border-gray-200 border-t-gray-900 rounded-full animate-spin mx-auto" />
            </div>
          }>
            <VerifyEmailStatus />
          </Suspense>
        </div>
      </div>
      <Footer />
    </div>
  );
}
