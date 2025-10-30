'use client';

import { useState } from 'react';
import { Database, CheckCircle, AlertCircle } from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';

export default function MigratePage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const runMigration = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/migrate-products', {
        method: 'POST'
      });
      
      const data = await response.json();
      setResult(data);
      
      if (response.ok) {
        alert('Migration completed successfully!');
      } else {
        alert(data.error || 'Migration failed');
      }
    } catch (error) {
      console.error('Migration error:', error);
      alert('An error occurred during migration');
      setResult({ error: 'Network error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Database Migration</h1>
          <p className="text-gray-600 mt-2">Fix missing brand_id column in products table</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="text-center mb-8">
            <Database className="w-16 h-16 text-blue-600 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Add Brand Support</h2>
            <p className="text-gray-600">
              This will add the missing brand_id column to the products table so you can associate products with brands.
            </p>
          </div>

          {result && (
            <div className={`mb-6 p-4 rounded-lg ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <div className="flex items-center mb-2">
                {result.success ? (
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                )}
                <span className={`font-semibold ${result.success ? 'text-green-800' : 'text-red-800'}`}>
                  {result.success ? 'Success!' : 'Error!'}
                </span>
              </div>
              <p className={result.success ? 'text-green-700' : 'text-red-700'}>
                {result.message || result.error}
              </p>
            </div>
          )}

          <div className="text-center">
            <button
              onClick={runMigration}
              disabled={loading}
              className="text-white px-8 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 mx-auto hover:bg-purple-700 cursor-pointer"
              style={{ backgroundColor: '#8827ee' }}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Running Migration...</span>
                </>
              ) : (
                <>
                  <Database className="w-5 h-5" />
                  <span>Run Migration</span>
                </>
              )}
            </button>
          </div>

          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">What this does:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Checks if brand_id column exists in products table</li>
              <li>• Adds brand_id column if missing</li>
              <li>• Creates foreign key relationship to brands table</li>
              <li>• Allows products to be associated with brands</li>
            </ul>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}