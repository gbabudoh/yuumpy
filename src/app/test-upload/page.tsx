import UploadTest from '@/components/UploadTest';

export default function TestUploadPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">Upload Test Page</h1>
        <UploadTest />
      </div>
    </div>
  );
}