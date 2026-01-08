'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Lock, Eye, EyeOff, CheckCircle } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);

  useEffect(() => {
    if (!token) {
      setError('Invalid reset link.');
      setTokenValid(false);
      return;
    }
    const verifyToken = async () => {
      try {
        const response = await fetch('/api/customer/auth/verify-reset-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token })
        });
        setTokenValid(response.ok);
        if (!response.ok) setError('This reset link has expired or is invalid.');
      } catch {
        setError('Unable to verify reset link.');
        setTokenValid(false);
      }
    };
    verifyToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) { setError('Passwords do not match'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters'); return; }
    setLoading(true);
    try {
      const response = await fetch('/api/customer/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to reset password');
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8 text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Password Reset Successful</h1>
        <p className="text-gray-600 mb-6">Your password has been reset. You can now sign in.</p>
        <Link href="/account/login" className="inline-block bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700">
          Sign In
        </Link>
      </div>
    );
  }

  if (tokenValid === false) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8 text-center">
        <Lock className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Invalid Reset Link</h1>
        <p className="text-gray-600 mb-6">{error}</p>
        <Link href="/account/forgot-password" className="inline-block bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700">
          Request New Link
        </Link>
      </div>
    );
  }

  if (tokenValid === null) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Verifying reset link...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <h1 className="text-2xl font-bold text-gray-900 text-center mb-6">Set New Password</h1>
      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Enter new password"
              minLength={8}
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">Must be at least 8 characters</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Confirm new password"
            />
            <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
              {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>
        <button type="submit" disabled={loading} className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400">
          {loading ? 'Resetting...' : 'Reset Password'}
        </button>
      </form>
      <div className="mt-6 text-center">
        <Link href="/account/login" className="text-green-600 hover:text-green-700 font-medium">Back to Sign In</Link>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          <Suspense fallback={<div className="bg-white rounded-lg shadow-lg p-8 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div></div>}>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
      <Footer />
    </div>
  );
}
