'use client';

import { useState } from 'react';

interface ProductTabsProps {
  longDescription?: string;
  productReview?: string;
}

export default function ProductTabs({ longDescription, productReview }: ProductTabsProps) {
  const [activeTab, setActiveTab] = useState<'description' | 'review'>(
    longDescription ? 'description' : 'review'
  );

  // If neither content exists, don't render anything
  if (!longDescription && !productReview) {
    return null;
  }

  return (
    <div className="mt-16">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            {longDescription && (
              <button
                onClick={() => setActiveTab('description')}
                className={`flex items-center px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'description'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-blue-700 hover:border-blue-300'
                }`}
              >
                <span className="mr-2">📝</span>
                Product Description
              </button>
            )}
            {productReview && (
              <button
                onClick={() => setActiveTab('review')}
                className={`flex items-center px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'review'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-blue-700 hover:border-blue-300'
                }`}
              >
                <span className="mr-2">⭐</span>
                Expert Review & Insights
              </button>
            )}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-8">
          {/* Description Content */}
          {activeTab === 'description' && longDescription && (
            <div className="prose max-w-none animate-fadeIn">
              <p className="text-gray-700 leading-relaxed whitespace-pre-line text-base">
                {longDescription}
              </p>
            </div>
          )}

          {/* Review Content */}
          {activeTab === 'review' && productReview && (
            <div className="prose max-w-none animate-fadeIn">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-100">
                <p className="text-gray-700 leading-relaxed whitespace-pre-line text-base">
                  {productReview}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
