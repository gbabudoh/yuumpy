'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import ContactForm from '@/components/ContactForm';

export default function AdvertPage() {
  const [isContactFormOpen, setIsContactFormOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Page Header */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Banner Advertising
          </h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Promote your products with our premium banner advertising options. Reach thousands of potential customers daily.
          </p>
        </div>
      </section>

        {/* Pricing Information Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Banner Advertising Options
              </h2>
              <p className="text-gray-600 text-lg">
                Promote your products with our premium banner advertising
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {/* Top Position */}
              <div className="border-2 border-gray-200 rounded-xl p-8 hover:border-red-500 transition-colors">
                <div className="text-center">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">📅</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Homepage Banner</h3>
                  <div className="text-3xl font-bold text-gray-900 mb-4">£50/week</div>
                  <p className="text-gray-600 mb-6">Premium placement at the top of the page for maximum visibility</p>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li>• Highest visibility</li>
                    <li>• First thing users see</li>
                    <li>• Premium placement</li>
                    <li>• Maximum click-through rate</li>
                  </ul>
                </div>
              </div>

              {/* Middle Position */}
              <div className="border-2 border-gray-200 rounded-xl p-8 hover:border-yellow-500 transition-colors">
                <div className="text-center">
                  <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">📅</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Product Page</h3>
                  <div className="text-3xl font-bold text-gray-900 mb-4">£35/week</div>
                  <p className="text-gray-600 mb-6">Balanced placement in the middle section for good visibility</p>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li>• Good visibility</li>
                    <li>• Balanced placement</li>
                    <li>• Cost-effective</li>
                    <li>• Good click-through rate</li>
                  </ul>
                </div>
              </div>

              {/* Bottom Position */}
              <div className="border-2 border-gray-200 rounded-xl p-8 hover:border-green-500 transition-colors">
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">📅</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Custom Advertising</h3>
                  <div className="text-3xl font-bold text-gray-900 mb-4">Custom Pricing</div>
                  <p className="text-gray-600 mb-6">Tailored advertising solutions designed for your specific needs</p>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li>• Custom placement options</li>
                    <li>• Tailored to your brand</li>
                    <li>• Flexible duration</li>
                    <li>• Personalized strategy</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Contact Section */}
            <div className="text-center mt-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Get Started Today</h2>
              <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                Ready to promote your products to our engaged audience? Contact us to discuss your advertising needs.
              </p>
              <button 
                onClick={() => setIsContactFormOpen(true)}
                className="text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors hover:bg-purple-700 cursor-pointer"
                style={{ backgroundColor: '#8827ee' }}
              >
                Contact Yuumpy
              </button>
            </div>
          </div>
        </section>

        {/* Contact Form Modal */}
        <ContactForm 
          isOpen={isContactFormOpen} 
          onClose={() => setIsContactFormOpen(false)} 
        />
      </div>
    );
}
