'use client';

import { useState } from 'react';

export default function UploadTest() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [configStatus, setConfigStatus] = useState<any>(null);

  const checkConfig = async () => {
    try {
      const response = await fetch('/api/upload/test');
      const data = await response.json();
      setConfigStatus(data);
    } catch (err) {
      setError('Failed to check configuration');
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'test');

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data);
      } else {
        setError(data.error || 'Upload failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Upload Test</h2>
      
      <div className="space-y-4">
        <button
          onClick={checkConfig}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Check Cloudinary Configuration
        </button>

        {configStatus && (
          <div className="bg-gray-100 p-4 rounded">
            <h3 className="font-bold mb-2">Configuration Status:</h3>
            <pre className="text-sm overflow-auto">
              {JSON.stringify(configStatus, null, 2)}
            </pre>
          </div>
        )}

        <div>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:bg-gray-400"
        >
          {uploading ? 'Uploading...' : 'Upload Image'}
        </button>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <strong>Error:</strong> {error}
          </div>
        )}

        {result && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            <h3 className="font-bold mb-2">Upload Successful!</h3>
            <p><strong>URL:</strong> <a href={result.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">{result.url}</a></p>
            <img src={result.url} alt="Uploaded" className="mt-2 max-w-xs rounded" />
          </div>
        )}
      </div>
    </div>
  );
}