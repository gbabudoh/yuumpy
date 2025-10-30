'use client';

import { useState, useEffect } from 'react';
import { 
  Mail, 
  Search, 
  Filter, 
  Eye, 
  Reply, 
  Trash2, 
  Clock,
  CheckCircle,
  AlertCircle,
  User,
  Building,
  Phone,
  Calendar,
  RefreshCw
} from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';

interface EmailInquiry {
  id: number;
  name: string;
  email: string;
  company?: string;
  phone?: string;
  ad_type: string;
  message: string;
  created_at: string;
  status: string;
}

export default function AdminEmails() {
  const [emails, setEmails] = useState<EmailInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmail, setSelectedEmail] = useState<EmailInquiry | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Fetch emails function
  const fetchEmails = async () => {
    setRefreshing(true);
    try {
      const response = await fetch('/api/emails');
      if (response.ok) {
        const result = await response.json();
        setEmails(result.data || []);
      } else {
        console.error('Failed to fetch emails:', response.status);
        // Fallback to mock data if API fails
        const mockEmails = [
          {
            id: 1,
            name: 'Godwin Babudoh',
            email: 'godwin@egobas.com',
            company: 'Egobas',
            phone: 'Not provided',
            ad_type: 'top-position',
            message: 'Test email from contact form - interested in advertising opportunities.',
            created_at: new Date().toISOString(),
            status: 'new'
          }
        ];
        setEmails(mockEmails);
      }
    } catch (error) {
      console.error('Error fetching emails:', error);
      // Fallback to mock data if API fails
      const mockEmails = [
        {
          id: 1,
          name: 'Godwin Babudoh',
          email: 'godwin@egobas.com',
          company: 'Egobas',
          phone: 'Not provided',
          ad_type: 'top-position',
          message: 'Test email from contact form - interested in advertising opportunities.',
          created_at: new Date().toISOString(),
          status: 'new'
        }
      ];
      setEmails(mockEmails);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchEmails();
  }, []);

  // Action functions
  const handleReplyToEmail = async (email: EmailInquiry) => {
    setActionLoading('reply');
    try {
      // Create mailto link
      const subject = `Re: Advertising Inquiry - ${getAdTypeLabel(email.ad_type)}`;
      const body = `Hi ${email.name},\n\nThank you for your interest in advertising with Yuumpy.\n\nRegarding your inquiry about ${getAdTypeLabel(email.ad_type)} advertising:\n\n[Your response here]\n\nBest regards,\nYuumpy Team`;
      
      const mailtoLink = `mailto:${email.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.open(mailtoLink);
      
      // Mark as replied after opening email client
      setTimeout(() => {
        handleMarkAsReplied(email);
      }, 1000);
    } catch (error) {
      console.error('Error opening email client:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleMarkAsReplied = async (email: EmailInquiry) => {
    setActionLoading('replied');
    try {
      // Update email status locally
      const updatedEmails = emails.map(e => 
        e.id === email.id ? { ...e, status: 'replied' as const } : e
      );
      setEmails(updatedEmails);
      
      // Update selected email if it's the same
      if (selectedEmail?.id === email.id) {
        setSelectedEmail({ ...email, status: 'replied' });
      }
      
      // In a real app, you would also update the backend
      // await fetch(`/api/emails/${email.id}`, { method: 'PUT', body: JSON.stringify({ status: 'replied' }) });
      
      console.log(`Email ${email.id} marked as replied`);
    } catch (error) {
      console.error('Error marking email as replied:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteInquiry = async (email: EmailInquiry) => {
    if (!confirm(`Are you sure you want to delete the inquiry from ${email.name}? This action cannot be undone.`)) {
      return;
    }
    
    setActionLoading('delete');
    try {
      // Remove email from local list
      const updatedEmails = emails.filter(e => e.id !== email.id);
      setEmails(updatedEmails);
      
      // Clear selected email if it's the one being deleted
      if (selectedEmail?.id === email.id) {
        setSelectedEmail(null);
      }
      
      // In a real app, you would also delete from the backend
      // await fetch(`/api/emails/${email.id}`, { method: 'DELETE' });
      
      console.log(`Email ${email.id} deleted`);
    } catch (error) {
      console.error('Error deleting email:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const filteredEmails = emails.filter(email => {
    const matchesSearch = email.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         email.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         email.company?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || email.status === statusFilter;
    const matchesType = typeFilter === 'all' || email.ad_type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'new':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'read':
        return <Eye className="w-4 h-4 text-blue-500" />;
      case 'replied':
        return <Reply className="w-4 h-4 text-green-500" />;
      case 'closed':
        return <CheckCircle className="w-4 h-4 text-gray-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-red-100 text-red-800';
      case 'read':
        return 'bg-blue-100 text-blue-800';
      case 'replied':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getAdTypeLabel = (adType: string) => {
    switch (adType) {
      case 'top-position':
        return 'Top Position';
      case 'product-page':
        return 'Product Page';
      case 'custom':
        return 'Custom';
      default:
        return adType;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading email inquiries...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div>
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Email Inquiries</h1>
              <p className="text-gray-600">Manage advertising inquiries and contact form submissions</p>
            </div>
            <button
              onClick={fetchEmails}
              disabled={refreshing}
              className="flex items-center space-x-2 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer hover:bg-purple-700"
              style={{ backgroundColor: '#8827ee' }}
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Email List */}
          <div className="lg:col-span-2">
            {/* Filters */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search by name, email, or company..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="flex gap-4">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Status</option>
                    <option value="new">New</option>
                    <option value="read">Read</option>
                    <option value="replied">Replied</option>
                    <option value="closed">Closed</option>
                  </select>
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Types</option>
                    <option value="top-position">Top Position</option>
                    <option value="product-page">Product Page</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Email List */}
            <div className="bg-white rounded-xl shadow-lg">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  Inquiries ({filteredEmails.length})
                </h2>
              </div>
              <div className="divide-y divide-gray-200">
                {filteredEmails.map((email) => (
                  <div
                    key={email.id}
                    onClick={() => setSelectedEmail(email)}
                    className={`p-6 hover:bg-gray-50 cursor-pointer transition-colors ${
                      selectedEmail?.id === email.id ? 'bg-blue-50 border-r-4 border-blue-500' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{email.name}</h3>
                            <p className="text-sm text-gray-600">{email.email}</p>
                          </div>
                        </div>
                        {email.company && (
                          <div className="flex items-center space-x-2 mb-2">
                            <Building className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">{email.company}</span>
                          </div>
                        )}
                        <p className="text-sm text-gray-700 line-clamp-2 mb-3">{email.message}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3" />
                            <span>{formatDate(email.created_at)}</span>
                          </div>
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                            {getAdTypeLabel(email.ad_type)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(email.status)}`}>
                          {email.status}
                        </span>
                        {getStatusIcon(email.status)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Email Detail */}
          <div className="lg:col-span-1">
            {selectedEmail ? (
              <div className="bg-white rounded-xl shadow-lg p-6 sticky top-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => setSelectedEmail(null)}
                      className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      <span className="text-sm font-medium">Back to Mail List</span>
                    </button>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedEmail.status)}`}>
                      {selectedEmail.status}
                    </span>
                    {getStatusIcon(selectedEmail.status)}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Name</label>
                    <p className="text-gray-900">{selectedEmail.name}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-600">Email</label>
                    <p className="text-gray-900">{selectedEmail.email}</p>
                  </div>

                  {selectedEmail.company && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Company</label>
                      <p className="text-gray-900">{selectedEmail.company}</p>
                    </div>
                  )}

                  {selectedEmail.phone && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Phone</label>
                      <p className="text-gray-900">{selectedEmail.phone}</p>
                    </div>
                  )}

                  <div>
                    <label className="text-sm font-medium text-gray-600">Advertising Type</label>
                    <p className="text-gray-900">{getAdTypeLabel(selectedEmail.ad_type)}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-600">Submitted</label>
                    <p className="text-gray-900">{formatDate(selectedEmail.created_at)}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-600">Message</label>
                    <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                      <p className="text-gray-900 whitespace-pre-wrap">{selectedEmail.message}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  <button 
                    onClick={() => handleReplyToEmail(selectedEmail)}
                    disabled={actionLoading === 'reply'}
                    className="w-full text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer hover:bg-purple-700"
                    style={{ backgroundColor: '#8827ee' }}
                  >
                    {actionLoading === 'reply' ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Opening Email...</span>
                      </>
                    ) : (
                      <>
                        <Reply className="w-4 h-4" />
                        <span>Reply to Email</span>
                      </>
                    )}
                  </button>
                  
                  <button 
                    onClick={() => handleMarkAsReplied(selectedEmail)}
                    disabled={actionLoading === 'replied' || selectedEmail?.status === 'replied'}
                    className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {actionLoading === 'replied' ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Updating...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        <span>{selectedEmail?.status === 'replied' ? 'Already Replied' : 'Mark as Replied'}</span>
                      </>
                    )}
                  </button>
                  
                  <button 
                    onClick={() => handleDeleteInquiry(selectedEmail)}
                    disabled={actionLoading === 'delete'}
                    className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {actionLoading === 'delete' ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Deleting...</span>
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4" />
                        <span>Delete Inquiry</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select an Email</h3>
                <p className="text-gray-600">Choose an email from the list to view details and take action.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
