import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Scale, CheckCircle, Clock, MessageSquare, AlertCircle, ShieldCheck } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Dispute Resolution - Yuumpy',
  description: 'Learn how Yuumpy resolves disputes between buyers and sellers fairly and quickly.',
};

export default function DisputeResolution() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">

          {/* Hero */}
          <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-10 mb-8 text-white text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                <Scale className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-black mb-3">Dispute Resolution</h1>
            <p className="text-orange-100 text-lg max-w-xl mx-auto">
              We mediate fairly between buyers and sellers to reach the right outcome — quickly and transparently.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 space-y-10">

            {/* Overview */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Approach</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Disputes are an unfortunate but sometimes necessary part of any marketplace. Yuumpy&apos;s Dispute Resolution team acts as a neutral mediator, reviewing evidence from both parties and making a fair determination based on our policies and the facts presented.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Escrow funds are paused during an open dispute, meaning neither party loses access to their money before a fair resolution is reached.
              </p>
            </section>

            {/* Process */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">The Resolution Process</h2>
              <div className="space-y-4">
                {[
                  {
                    icon: MessageSquare,
                    step: '1',
                    title: 'Direct Resolution (Recommended)',
                    desc: 'We encourage buyers and sellers to resolve issues directly through our messaging system first. Many disputes are resolved quickly at this stage.',
                  },
                  {
                    icon: AlertCircle,
                    step: '2',
                    title: 'Formal Dispute Opened',
                    desc: 'If direct resolution fails, either party can open a formal dispute from the Orders page. Escrow funds are immediately paused.',
                  },
                  {
                    icon: Clock,
                    step: '3',
                    title: 'Evidence Submitted',
                    desc: 'Both parties have 48 hours to submit their evidence — photos, messages, tracking information, or any other relevant documentation.',
                  },
                  {
                    icon: Scale,
                    step: '4',
                    title: 'Yuumpy Review',
                    desc: 'Our team reviews all evidence and applies our policies. We aim to reach a decision within 3–5 business days.',
                  },
                  {
                    icon: CheckCircle,
                    step: '5',
                    title: 'Outcome & Settlement',
                    desc: 'Both parties are notified of the outcome. Escrow funds are released accordingly — to the buyer as a refund, or to the seller.',
                  },
                ].map(({ icon: Icon, step, title, desc }) => (
                  <div key={step} className="flex gap-4 p-5 border border-gray-100 rounded-xl">
                    <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-black text-orange-500 uppercase tracking-widest">Step {step}</span>
                        <h3 className="font-bold text-gray-900">{title}</h3>
                      </div>
                      <p className="text-gray-600 text-sm leading-relaxed">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Possible Outcomes */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Possible Outcomes</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { title: 'Full Refund to Buyer', desc: 'Item not received, significantly not as described, or inauthentic. Escrow returned in full.' },
                  { title: 'Partial Refund', desc: 'Minor discrepancies or partial fault. Funds are split proportionately as determined by our team.' },
                  { title: 'Release to Seller', desc: 'Dispute found to be unfounded or outside our policy. Full escrow amount released to seller.' },
                ].map(({ title, desc }) => (
                  <div key={title} className="bg-gray-50 rounded-xl p-5 text-center">
                    <h3 className="font-bold text-gray-900 mb-2 text-sm">{title}</h3>
                    <p className="text-gray-600 text-xs leading-relaxed">{desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Timelines */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Important Timelines</h2>
              <ul className="space-y-3">
                {[
                  'Disputes must be opened within 14 days of the estimated delivery date',
                  'Both parties have 48 hours to submit evidence after a dispute is opened',
                  'Yuumpy aims to resolve disputes within 3–5 business days of receiving all evidence',
                  'Appeals must be submitted within 7 days of the resolution decision',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Appeals */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Appeals</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                If you believe a dispute was resolved incorrectly, you may submit an appeal within 7 days of the decision. Appeals are reviewed by a senior member of our team who was not involved in the original resolution.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 flex gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-blue-800 text-sm leading-relaxed">
                  To appeal a decision, contact our support team with your order number, the original dispute reference, and a clear explanation of why you believe the decision was incorrect.
                </p>
              </div>
            </section>

            {/* Contact */}
            <section className="bg-gray-50 rounded-xl p-6 flex gap-4 items-start">
              <ShieldCheck className="w-6 h-6 text-indigo-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Need Help Opening a Dispute?</h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-3">
                  Our support team can guide you through the process. Reach out and we will respond within one business day.
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
