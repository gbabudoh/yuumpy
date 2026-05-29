import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Star, CheckCircle, ShieldCheck, RefreshCw, HeartHandshake } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Buyer Guarantee - Yuumpy',
  description: 'Shop with confidence. The Yuumpy Buyer Guarantee covers every purchase on our platform.',
};

export default function BuyerGuarantee() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">

          {/* Hero */}
          <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-2xl p-10 mb-8 text-white text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                <HeartHandshake className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-black mb-3">Buyer Guarantee</h1>
            <p className="text-purple-200 text-lg max-w-xl mx-auto">
              Every purchase on Yuumpy is protected. If something goes wrong, we make it right.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 space-y-10">

            {/* Overview */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">What Is the Yuumpy Buyer Guarantee?</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                The Yuumpy Buyer Guarantee means that when you shop on our platform, you are covered if your order doesn&apos;t arrive, arrives damaged, or is significantly different from what was described. We stand behind every transaction made on Yuumpy.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Combined with our escrow payment system, the Buyer Guarantee gives you the strongest possible protection when shopping with verified sellers.
              </p>
            </section>

            {/* What is covered */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">What Is Covered</h2>
              <div className="space-y-4">
                {[
                  {
                    title: 'Item Not Received',
                    desc: 'If your order hasn\'t arrived by the estimated delivery date and the seller cannot provide proof of delivery, you are entitled to a full refund.',
                  },
                  {
                    title: 'Item Not as Described',
                    desc: 'If the item you receive is materially different from its listing — wrong size, colour, model, or condition — you can request a return and full refund.',
                  },
                  {
                    title: 'Damaged on Arrival',
                    desc: 'Items damaged during shipping are covered. Provide photographic evidence when raising a dispute and we will arrange a refund or replacement.',
                  },
                  {
                    title: 'Counterfeit or Inauthentic',
                    desc: 'Yuumpy has a zero-tolerance policy on counterfeit goods. Buyers who receive inauthentic items receive a full refund and the seller faces immediate suspension.',
                  },
                ].map(({ title, desc }) => (
                  <div key={title} className="flex gap-4 p-5 border border-gray-100 rounded-xl">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-bold text-gray-900 mb-1">{title}</h3>
                      <p className="text-gray-600 text-sm leading-relaxed">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* What is NOT covered */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">What Is Not Covered</h2>
              <ul className="space-y-3">
                {[
                  'Buyer\'s remorse (changed your mind after receiving the item)',
                  'Damage caused by the buyer after delivery',
                  'Disputes raised after the 14-day window has closed and funds auto-released',
                  'Items purchased outside of the Yuumpy platform',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-red-100 text-red-500 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">✕</span>
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* How to claim */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">How to Claim</h2>
              <ol className="space-y-4">
                {[
                  'Go to your Orders page and locate the order in question.',
                  'Click "Raise a Dispute" and select the reason for your claim.',
                  'Upload supporting evidence — photos, screenshots, tracking info.',
                  'Our team reviews your claim within 3–5 business days.',
                  'If upheld, your refund is processed to your original payment method.',
                ].map((step, i) => (
                  <li key={i} className="flex gap-4">
                    <span className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 font-black text-sm flex items-center justify-center flex-shrink-0">{i + 1}</span>
                    <span className="text-gray-700 pt-0.5">{step}</span>
                  </li>
                ))}
              </ol>
            </section>

            {/* Bottom CTA */}
            <section className="bg-indigo-50 rounded-xl p-6 flex gap-4 items-start">
              <ShieldCheck className="w-6 h-6 text-indigo-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Still Have Questions?</h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-3">
                  Our support team is here to help. Contact us and we will respond within one business day.
                </p>
                <a href="/contact" className="inline-block bg-indigo-600 text-white font-bold px-6 py-2.5 rounded-xl text-sm hover:bg-indigo-700 transition-colors">
                  Contact Support
                </a>
              </div>
            </section>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
