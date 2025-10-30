'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    checkAuthAndRedirect();
  }, []);

  const checkAuthAndRedirect = () => {
    // Simple client-side redirect - middleware will handle server-side protection
    const token = localStorage.getItem('adminToken');
    
    if (token) {
      router.push('/admin/dashboard');
    } else {
      router.push('/admin/login');
    }
    
    setChecking(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">
          {checking ? 'Checking authentication...' : 'Redirecting...'}
        </p>
      </div>
    </div>
  );
}