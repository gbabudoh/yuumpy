'use client';

import { useState } from 'react';
import { Mail, CheckCircle, XCircle, Loader, Settings } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function TestEmailPage() {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [toEmail, setToEmail] = useState('orders@yuumpy.com');

  const testConnection = async () => {
    setTesting(true);
    setResults(null);
    
    try {
      const response = await fetch('/api/test-email?test_connection=true');
      const data = await response.json();
      setResults(data);
    } catch (error: any) {
      setResults({
        success: false,
        error: error.message
      });
    } finally {
      setTesting(false);
    }
  };

  const sendTestEmail = async () => {
    setTesting(true);
    setResults(null);
    
    try {
      const response = await fetch(`/api/test-email?send_test=true&to=${encodeURIComponent(toEmail)}`);
      const data = await response.json();
      setResults(data);
    } catch (error: any) {
      setResults({
        success: false,
        error: error.message
      });
    } finally {
      setTesting(false);
    }
  };

  const testBoth = async () => {
    setTesting(true);
    setResults(null);
    
    try {
      const response = await fetch(`/api/test-email?test_connection=true&send_test=true&to=${encodeURIComponent(toEmail)}`);
      const data = await response.json();
      setResults(data);
    } catch (error: any) {
      setResults({
        success: false,
        error: error.message
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Mail className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Email System Test</h1>
            <p className="text-xl text-gray-600">
              Test the email functionality for orders@yuumpy.com
            </p>
          </div>

          {/* Configuration Display */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Settings className="w-6 h-6" />
              Current Configuration
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">SMTP Host</p>
                <p className="font-mono text-sm bg-gray-50 p-2 rounded">
                  {results?.configuration?.smtpHost || 'Check test results'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">SMTP Port</p>
                <p className="font-mono text-sm bg-gray-50 p-2 rounded">
                  {results?.configuration?.smtpPort || '587'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">From Email</p>
                <p className="font-mono text-sm bg-gray-50 p-2 rounded">
                  {results?.configuration?.smtpFrom || 'orders@yuumpy.com'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Admin Order Emails</p>
                <p className="font-mono text-sm bg-gray-50 p-2 rounded">
                  {results?.configuration?.adminOrderEmails || 'orders@yuumpy.com,payments@egobas.com'}
                </p>
              </div>
            </div>
            <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-800">
                <strong>Note:</strong> SMTP credentials are stored server-side for security. 
                Check your .env.local file for SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASS.
              </p>
            </div>
          </div>

          {/* Test Controls */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Run Tests</h2>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Test Email Address
              </label>
              <input
                type="email"
                value={toEmail}
                onChange={(e) => setToEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="orders@yuumpy.com"
              />
            </div>

            <div className="flex flex-wrap gap-4">
              <button
                onClick={testConnection}
                disabled={testing}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {testing ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <Settings className="w-5 h-5" />
                    Test Connection
                  </>
                )}
              </button>

              <button
                onClick={sendTestEmail}
                disabled={testing}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {testing ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="w-5 h-5" />
                    Send Test Email
                  </>
                )}
              </button>

              <button
                onClick={testBoth}
                disabled={testing}
                className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {testing ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Test Both
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Results */}
          {results && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Test Results</h2>
              
              {results.configuration && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Configuration</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <pre className="text-sm overflow-x-auto">
                      {JSON.stringify(results.configuration, null, 2)}
                    </pre>
                  </div>
                </div>
              )}

              {results.tests && (
                <div className="space-y-4">
                  {results.tests.connection && (
                    <div className={`p-4 rounded-lg border ${
                      results.tests.connection.success
                        ? 'bg-green-50 border-green-200'
                        : 'bg-red-50 border-red-200'
                    }`}>
                      <div className="flex items-start gap-3">
                        {results.tests.connection.success ? (
                          <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                        ) : (
                          <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-1">SMTP Connection Test</h4>
                          <p className={`text-sm ${results.tests.connection.success ? 'text-green-800' : 'text-red-800'}`}>
                            {results.tests.connection.message}
                          </p>
                          {results.tests.connection.error && (
                            <p className="text-xs text-red-600 mt-2 font-mono bg-red-100 p-2 rounded">
                              {results.tests.connection.error}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {results.tests.sendEmail && (
                    <div className={`p-4 rounded-lg border ${
                      results.tests.sendEmail.success
                        ? 'bg-green-50 border-green-200'
                        : 'bg-red-50 border-red-200'
                    }`}>
                      <div className="flex items-start gap-3">
                        {results.tests.sendEmail.success ? (
                          <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                        ) : (
                          <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-1">Send Test Email</h4>
                          <p className={`text-sm ${results.tests.sendEmail.success ? 'text-green-800' : 'text-red-800'}`}>
                            {results.tests.sendEmail.message}
                          </p>
                          {results.tests.sendEmail.messageId && (
                            <p className="text-xs text-gray-600 mt-2">
                              Message ID: <span className="font-mono">{results.tests.sendEmail.messageId}</span>
                            </p>
                          )}
                          {results.tests.sendEmail.error && (
                            <p className="text-xs text-red-600 mt-2 font-mono bg-red-100 p-2 rounded">
                              {results.tests.sendEmail.error}
                              {results.tests.sendEmail.code && (
                                <span className="block mt-1">Error Code: {results.tests.sendEmail.code}</span>
                              )}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {results.troubleshooting && (
                <div className="p-6 rounded-lg bg-amber-50 border border-amber-200 mt-6">
                  <h3 className="font-semibold text-amber-900 mb-3 flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Troubleshooting Guide
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-amber-900 mb-2">Issue Detected:</p>
                      <p className="text-sm text-amber-800">{results.troubleshooting.issue}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-amber-900 mb-2">Possible Causes:</p>
                      <ul className="list-disc list-inside text-sm text-amber-800 space-y-1">
                        {results.troubleshooting.possibleCauses.map((cause: string, idx: number) => (
                          <li key={idx}>{cause}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-amber-900 mb-2">Solutions:</p>
                      <ol className="list-decimal list-inside text-sm text-amber-800 space-y-2">
                        {results.troubleshooting.solutions.map((solution: string, idx: number) => (
                          <li key={idx}>{solution}</li>
                        ))}
                      </ol>
                    </div>
                    <div className="mt-4 p-3 bg-amber-100 rounded-lg">
                      <p className="text-xs text-amber-900">
                        <strong>Quick Test from VPS:</strong> If you have SSH access to your VPS, 
                        run this command on the server: <code className="bg-amber-200 px-2 py-1 rounded">curl http://localhost:3000/api/test-email?send_test=true&to=orders@yuumpy.com</code>
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {results.error && (
                <div className="p-4 rounded-lg bg-red-50 border border-red-200">
                  <div className="flex items-start gap-3">
                    <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-red-900 mb-1">Error</h4>
                      <p className="text-sm text-red-800">{results.error}</p>
                      {results.details && (
                        <p className="text-xs text-red-600 mt-2 font-mono bg-red-100 p-2 rounded">
                          {results.details}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {results.success === false && !results.tests && (
                <div className="p-4 rounded-lg bg-red-50 border border-red-200">
                  <p className="text-red-800">{results.message || 'Test failed'}</p>
                </div>
              )}
            </div>
          )}

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mt-8">
            <h3 className="font-semibold text-blue-900 mb-3">How to Test:</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
              <li>Make sure your SMTP credentials are configured in <code className="bg-blue-100 px-1 rounded">.env.local</code></li>
              <li>Click "Test Connection" to verify SMTP server connectivity</li>
              <li>Click "Send Test Email" to send a test email to orders@yuumpy.com</li>
              <li>Check the inbox for orders@yuumpy.com to confirm receipt</li>
              <li>Review the test results below for any errors</li>
            </ol>
            <div className="mt-4 p-3 bg-blue-100 rounded-lg">
              <p className="text-xs text-blue-900">
                <strong>Required Environment Variables:</strong><br />
                SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM (optional, defaults to orders@yuumpy.com)
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

