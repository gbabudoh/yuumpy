'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck, Upload, CheckCircle2, Clock, XCircle,
  AlertCircle, FileText, CreditCard, Car, RefreshCw
} from 'lucide-react';

interface VerificationStatus {
  id: number;
  document_type: string;
  status: 'pending' | 'approved' | 'rejected';
  admin_notes: string | null;
  submitted_at: string;
}

const DOC_TYPES = [
  {
    value: 'passport',
    label: 'Passport',
    icon: FileText,
    desc: 'Accepted in every country — most reliable',
  },
  {
    value: 'national_id',
    label: 'National ID Card',
    icon: CreditCard,
    desc: 'EU, Africa, Middle East, Asia',
  },
  {
    value: 'drivers_licence',
    label: "Driver's Licence",
    icon: Car,
    desc: 'US, UK, Canada, Australia and more',
  },
];

export default function VerifyIdentityPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [status, setStatus] = useState<VerificationStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [docType, setDocType] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetch('/api/seller/identity-verification')
      .then(r => r.ok ? r.json() : null)
      .then(data => { setStatus(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setError('');
    const reader = new FileReader();
    reader.onload = ev => setPreview(ev.target?.result as string);
    reader.readAsDataURL(f);
  };

  const handleSubmit = async () => {
    if (!docType) { setError('Please select a document type.'); return; }
    if (!file) { setError('Please upload an image of your document.'); return; }

    setUploading(true);
    setError('');

    try {
      const form = new FormData();
      form.append('file', file);
      form.append('document_type', docType);

      const res = await fetch('/api/seller/identity-verification', { method: 'POST', body: form });
      const data = await res.json();

      if (!res.ok) { setError(data.error || 'Upload failed.'); return; }

      setSuccess(true);
      setTimeout(() => router.push('/seller/dashboard'), 2500);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <RefreshCw className="w-6 h-6 animate-spin text-purple-400" />
      </div>
    );
  }

  // Already verified
  if (status?.status === 'approved') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-10 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Identity Verified</h2>
          <p className="text-gray-500">Your identity has been confirmed. Your store is fully verified.</p>
        </div>
      </div>
    );
  }

  // Under review
  if (status?.status === 'pending') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-10 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-amber-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Under Review</h2>
          <p className="text-gray-500 mb-4">
            Your {DOC_TYPES.find(d => d.value === status.document_type)?.label || 'document'} has been
            submitted and is being reviewed by our team. This usually takes 1–2 business days.
          </p>
          <p className="text-xs text-gray-400">
            Submitted {new Date(status.submitted_at).toLocaleDateString()}
          </p>
        </div>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-10 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Document Submitted</h2>
          <p className="text-gray-500">We&apos;ll review your document and get back to you within 1–2 business days.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-xl mx-auto">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-7 h-7 text-purple-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Verify Your Identity</h1>
          <p className="text-gray-500 max-w-sm mx-auto">
            To start selling on Yuumpy we need to confirm who you are. Upload one of the documents below.
          </p>
        </div>

        {/* Rejected notice */}
        {status?.status === 'rejected' && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-100 flex gap-3">
            <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-700">Previous submission was rejected</p>
              {status.admin_notes && <p className="text-xs text-red-600 mt-1">{status.admin_notes}</p>}
              <p className="text-xs text-red-500 mt-1">Please submit a new, clearer document.</p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 space-y-8">

          {/* Step 1: Choose document type */}
          <div>
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">
              Step 1 — Choose document type
            </h2>
            <div className="space-y-3">
              {DOC_TYPES.map(({ value, label, icon: Icon, desc }) => (
                <button
                  key={value}
                  onClick={() => setDocType(value)}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all ${
                    docType === value
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-100 hover:border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    docType === value ? 'bg-purple-500' : 'bg-white border border-gray-200'
                  }`}>
                    <Icon className={`w-5 h-5 ${docType === value ? 'text-white' : 'text-gray-400'}`} />
                  </div>
                  <div className="flex-1">
                    <p className={`font-semibold text-sm ${docType === value ? 'text-purple-700' : 'text-gray-800'}`}>
                      {label}
                    </p>
                    <p className="text-xs text-gray-400">{desc}</p>
                  </div>
                  {docType === value && <CheckCircle2 className="w-5 h-5 text-purple-500 shrink-0" />}
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Upload */}
          <div>
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">
              Step 2 — Upload photo of document
            </h2>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              className="hidden"
              onChange={handleFileChange}
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full border-2 border-dashed border-gray-200 rounded-2xl p-6 flex flex-col items-center gap-3 hover:border-purple-300 hover:bg-purple-50/30 transition-all group"
            >
              {preview ? (
                <div className="w-full">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={preview} alt="Document preview" className="w-full max-h-48 object-contain rounded-xl" />
                  <p className="text-xs text-purple-500 mt-2 text-center font-medium group-hover:underline">
                    Click to replace
                  </p>
                </div>
              ) : (
                <>
                  <Upload className="w-8 h-8 text-gray-300 group-hover:text-purple-400 transition-colors" />
                  <p className="text-sm font-semibold text-gray-600 group-hover:text-purple-600 transition-colors">
                    Click to upload image
                  </p>
                  <p className="text-xs text-gray-400">JPG, PNG or WebP — max 10MB</p>
                </>
              )}
            </button>

            <div className="mt-3 p-3 bg-amber-50 rounded-xl border border-amber-100 flex gap-2">
              <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700">
                Your document will be watermarked and encrypted. It is only accessible to authorised Yuumpy staff and cannot be downloaded.
              </p>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 rounded-xl border border-red-100">
              <XCircle className="w-4 h-4 text-red-500 shrink-0" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={uploading || !docType || !file}
            className={`w-full py-4 rounded-2xl font-bold text-sm transition-all ${
              uploading || !docType || !file
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-purple-600 text-white hover:bg-purple-700 shadow-lg shadow-purple-200'
            }`}
          >
            {uploading ? (
              <span className="flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin" /> Uploading securely&hellip;
              </span>
            ) : (
              'Submit for Verification'
            )}
          </button>

          <p className="text-xs text-gray-400 text-center">
            By submitting you agree to our identity verification policy. Documents are reviewed within 1–2 business days.
          </p>
        </div>
      </div>
    </div>
  );
}
