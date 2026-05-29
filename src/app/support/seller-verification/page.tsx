import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ShieldCheck, CheckCircle, Clock, FileText, Star, AlertCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Seller Verification - Yuumpy',
  description: 'Learn how Yuumpy verifies sellers to ensure a safe and trusted marketplace for all buyers.',
};

export default function SellerVerification() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">

          {/* Hero */}
          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-10 mb-8 text-white text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                <ShieldCheck className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-black mb-3">Seller Verification</h1>
            <p className="text-indigo-200 text-lg max-w-xl mx-auto">
              Every seller on Yuumpy goes through a rigorous verification process so you can buy with complete confidence.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 space-y-10">

            {/* Why We Verify */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Why Seller Verification Matters</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Yuumpy is built on trust. Before any seller can list products or accept orders, they must pass our verification process. This protects buyers from fraud, ensures accurate product representations, and holds sellers accountable to the standards our community deserves.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Verified sellers display the <strong>Yuumpy Verified</strong> badge on their store and product listings — a signal to buyers that this seller has been reviewed and approved by our team.
              </p>
            </section>

            {/* Verification Steps */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">The Verification Process</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  {
                    icon: FileText,
                    title: 'Identity Verification',
                    desc: 'Sellers submit a government-issued ID and proof of address. Our team manually reviews every submission.',
                  },
                  {
                    icon: ShieldCheck,
                    title: 'Business Check',
                    desc: 'For registered businesses, we verify company registration documents and VAT/tax identification where applicable.',
                  },
                  {
                    icon: Star,
                    title: 'Product Quality Review',
                    desc: 'New sellers provide sample product photos and descriptions. Our team checks for accuracy and quality standards.',
                  },
                  {
                    icon: Clock,
                    title: 'Review Period',
                    desc: 'Verification typically takes 2–5 business days. Sellers are notified by email once a decision has been made.',
                  },
                ].map(({ icon: Icon, title, desc }) => (
                  <div key={title} className="flex gap-4 p-5 bg-gray-50 rounded-xl">
                    <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-1">{title}</h3>
                      <p className="text-gray-600 text-sm leading-relaxed">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* What Verified Sellers Get */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Benefits of Being Verified</h2>
              <ul className="space-y-3">
                {[
                  'Verified badge displayed on your store and all product listings',
                  'Access to promoted placement and featured seller opportunities',
                  'Faster dispute resolution and dedicated seller support',
                  'Higher buyer trust leading to increased conversion rates',
                  'Eligibility for Yuumpy\'s Seller Reward Programme',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Ongoing Compliance */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Ongoing Compliance</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Verification is not a one-time event. Yuumpy continuously monitors seller activity, response times, and buyer feedback. Sellers who fall below our standards may have their Verified status suspended pending review.
              </p>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 flex gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-amber-800 text-sm leading-relaxed">
                  If you suspect a seller is misrepresenting themselves or their products, please report it using the &quot;Report Seller&quot; button on their store page or contact our support team directly.
                </p>
              </div>
            </section>

            {/* Apply */}
            <section className="bg-indigo-50 rounded-xl p-6 text-center">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Ready to Become a Verified Seller?</h2>
              <p className="text-gray-600 mb-5 text-sm">
                Start your application from your seller dashboard. The process takes just a few minutes.
              </p>
              <a
                href="/seller/settings"
                className="inline-block bg-indigo-600 text-white font-bold px-8 py-3 rounded-xl hover:bg-indigo-700 transition-colors"
              >
                Go to Seller Settings
              </a>
            </section>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
