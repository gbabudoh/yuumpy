import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Lock, CheckCircle, Clock, AlertCircle, RefreshCw, ShieldCheck } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Escrow Policy - Yuumpy',
  description: 'Understand how Yuumpy\'s escrow system protects buyers and sellers during every transaction.',
};

export default function EscrowPolicy() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">

          {/* Hero */}
          <div className="bg-gradient-to-br from-green-600 to-teal-700 rounded-2xl p-10 mb-8 text-white text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                <Lock className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-black mb-3">Escrow Policy</h1>
            <p className="text-green-100 text-lg max-w-xl mx-auto">
              Your money is held safely until you confirm receipt of your order — protecting both buyers and sellers on every transaction.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 space-y-10">

            {/* How it works */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">How Escrow Works</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                When you place an order on Yuumpy, your payment is held securely in escrow — it is not released to the seller until you have received your item and confirmed satisfaction. This eliminates the risk of paying for goods that never arrive or don&apos;t match their description.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                {[
                  { icon: Lock, step: '1', title: 'Buyer Pays', desc: 'Payment is captured and held securely in the Yuumpy escrow account.' },
                  { icon: Clock, step: '2', title: 'Seller Ships', desc: 'The seller is notified and dispatches the order. Tracking information is shared.' },
                  { icon: CheckCircle, step: '3', title: 'Funds Released', desc: 'Once you confirm receipt, funds are released to the seller within 24 hours.' },
                ].map(({ icon: Icon, step, title, desc }) => (
                  <div key={step} className="text-center p-5 bg-gray-50 rounded-xl">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 text-green-700 font-black">
                      {step}
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Auto-release */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Automatic Release</h2>
              <p className="text-gray-700 leading-relaxed">
                If you do not confirm receipt or raise a dispute within <strong>14 days</strong> of the estimated delivery date, funds are automatically released to the seller. This prevents indefinite holds and ensures sellers are paid promptly for legitimate orders.
              </p>
            </section>

            {/* Disputes */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Raising a Dispute</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                If your order has not arrived or does not match its description, you can raise a dispute before funds are released. Escrow is paused while our team investigates.
              </p>
              <ul className="space-y-3">
                {[
                  'Open a dispute from your Orders page within the 14-day window',
                  'Provide supporting evidence such as photos or correspondence',
                  'Our team aims to resolve disputes within 3–5 business days',
                  'Refunds are issued back to your original payment method if the dispute is upheld',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Refunds */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Refunds &amp; Cancellations</h2>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 flex gap-3">
                <RefreshCw className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-blue-800 text-sm leading-relaxed">
                  If an order is cancelled before dispatch, escrow funds are returned to the buyer within 3–5 business days depending on your payment provider. Yuumpy does not charge cancellation fees.
                </p>
              </div>
            </section>

            {/* Security note */}
            <section className="bg-gray-50 rounded-xl p-6 flex gap-4">
              <ShieldCheck className="w-6 h-6 text-indigo-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Your Funds Are Secure</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Escrow funds are held in a segregated account and are never commingled with Yuumpy&apos;s operating funds. They are protected regardless of any changes to Yuumpy&apos;s business status.
                </p>
              </div>
            </section>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
