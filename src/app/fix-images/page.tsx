'use client';

import { useState } from 'react';

export default function FixImagesPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const fixImages = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/fix-images', {
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data);
      } else {
        setError(data.error || 'Failed to fix images');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fix images');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <h1 className="text-3xl font-bold text-center mb-8">Fix Images & Icons</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-center mb-6">
            <p className="text-gray-600 mb-4">
              This will update all product images and category icons in your database with working URLs.
            </p>
            
            <button
              onClick={fixImages}
              disabled={loading}
              className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Fixing Images...' : 'Fix All Images & Icons'}
            </button>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <strong>Error:</strong> {error}
            </div>
          )}

          {result && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
              <h3 className="font-bold mb-2">✅ Success!</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>Products updated: {result.results.productsUpdated}</li>
                <li>Categories updated: {result.results.categoriesUpdated}</li>
              </ul>
              
              {result.results.errors.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-semibold text-red-600">Errors:</h4>
                  <ul className="list-disc list-inside text-red-600">
                    {result.results.errors.map((error: string, index: number) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              <div className="mt-4 p-3 bg-blue-50 rounded">
                <p className="text-blue-800 font-semibold">Next Steps:</p>
                <ol className="list-decimal list-inside text-blue-700 mt-2 space-y-1">
                  <li>Go back to your homepage</li>
                  <li>Refresh the page to see the changes</li>
                  <li>All product images and category icons should now display correctly</li>
                </ol>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}