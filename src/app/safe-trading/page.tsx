import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import {
  ShieldCheck,
  AlertTriangle,
  Lock,
  CreditCard,
  MessageSquare,
  XCircle,
  CheckCircle2,
  ArrowRight,
  Gavel,
  Eye,
  UserCheck,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Safe Trading on Yuumpy — Buyer & Artisan Advisory',
  description:
    'Understand how Yuumpy protects both buyers and artisans. Always keep transactions on the platform for full protection, transparency, and dispute coverage.',
};

const buyerProtections = [
  {
    icon: Lock,
    title: 'Escrow Vault',
    desc: 'Your payment is held securely until you confirm delivery. The artisan only receives funds once you are satisfied.',
  },
  {
    icon: Gavel,
    title: 'Dispute Resolution',
    desc: 'If something goes wrong, our team steps in to mediate fairly between you and the seller.',
  },
  {
    icon: UserCheck,
    title: 'Verified Artisans',
    desc: 'Every seller on Yuumpy is identity-verified and manually reviewed before listing products.',
  },
  {
    icon: Eye,
    title: 'Full Transparency',
    desc: 'Your order history, messages, and payment records are all logged and accessible — nothing happens off the record.',
  },
];

const sellerProtections = [
  {
    icon: CreditCard,
    title: 'Guaranteed Payment',
    desc: 'Funds are collected and held in escrow before you ship. You will never be left unpaid for a completed order.',
  },
  {
    icon: ShieldCheck,
    title: 'Chargeback Protection',
    desc: "Off-platform payments offer zero chargeback protection. On Yuumpy, disputes are handled fairly — you won't lose a case unfairly.",
  },
  {
    icon: MessageSquare,
    title: 'Recorded Communication',
    desc: 'All buyer–seller messages are logged on the platform. This record protects you if a dispute is ever raised.',
  },
  {
    icon: Gavel,
    title: 'Platform-Backed Mediation',
    desc: 'If a buyer makes a false claim, you have the platform record and our mediation team on your side.',
  },
];

const warningSignsBuyer = [
  'An artisan asks you to pay via bank transfer, PayPal, or cash outside of Yuumpy.',
  'You are offered a "discount" if you pay directly to them.',
  'You receive a message asking you to continue the conversation on WhatsApp or email.',
  'The seller asks for your personal bank details or card number.',
];

const warningSignsSeller = [
  'A buyer offers to pay you directly to "save on fees".',
  'You receive a message asking you to ship before payment is confirmed.',
  'A buyer wants to arrange delivery outside the platform.',
  'Someone asks you to refund part of a payment via a different method.',
];

export default function SafeTradingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main>
        {/* Hero */}
        <section className="bg-gradient-to-br from-indigo-950 via-indigo-900 to-purple-900 py-20 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-white/20">
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
              Your Safety Is Our Priority
            </h1>
            <p className="text-lg text-indigo-200 max-w-2xl mx-auto leading-relaxed">
              Yuumpy is built to protect every buyer and every artisan. Keeping all
              transactions on the platform is the single most important thing you can do
              to protect yourself.
            </p>
          </div>
        </section>

        {/* Advisory banner */}
        <section className="bg-amber-50 border-y border-amber-200 py-5 px-6">
          <div className="max-w-4xl mx-auto flex items-start gap-4">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800 font-medium leading-relaxed">
              <strong>Important:</strong> Yuumpy will <strong>never</strong> ask you to pay
              outside the platform. If anyone — buyer, seller, or someone claiming to
              represent Yuumpy — asks you to transact off-platform, do not proceed.
              Report it immediately using the flag button on any listing or message.
            </p>
          </div>
        </section>

        <div className="max-w-5xl mx-auto px-6 py-16 space-y-20">

          {/* Buyer protections */}
          <section>
            <div className="mb-10">
              <p className="text-xs font-black uppercase tracking-widest text-indigo-600 mb-2">For Buyers</p>
              <h2 className="text-3xl font-black text-gray-900">What Yuumpy protects you from</h2>
              <p className="text-gray-500 mt-2 max-w-xl">
                When you pay through Yuumpy, every penny is protected until your order arrives as described.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {buyerProtections.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-indigo-600" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-1">{title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Seller protections */}
          <section>
            <div className="mb-10">
              <p className="text-xs font-black uppercase tracking-widest text-purple-600 mb-2">For Artisans</p>
              <h2 className="text-3xl font-black text-gray-900">Why selling on-platform protects you</h2>
              <p className="text-gray-500 mt-2 max-w-xl">
                Off-platform deals leave you with no recourse. On Yuumpy, you are always covered.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {sellerProtections.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-purple-600" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-1">{title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Warning signs */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-red-50 rounded-2xl border border-red-100 p-7">
              <div className="flex items-center gap-3 mb-5">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <h3 className="font-black text-gray-900">Warning signs — Buyers</h3>
              </div>
              <ul className="space-y-3">
                {warningSignsBuyer.map((sign, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700">{sign}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-red-50 rounded-2xl border border-red-100 p-7">
              <div className="flex items-center gap-3 mb-5">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <h3 className="font-black text-gray-900">Warning signs — Artisans</h3>
              </div>
              <ul className="space-y-3">
                {warningSignsSeller.map((sign, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700">{sign}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* What to do */}
          <section className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 md:p-12">
            <h2 className="text-2xl font-black text-gray-900 mb-6">What to do if something feels wrong</h2>
            <div className="space-y-4">
              {[
                { step: '1', text: 'Do not make any payment or share personal details outside the platform.' },
                { step: '2', text: 'Use the flag/report button on the listing, message, or seller profile.' },
                { step: '3', text: 'Contact Yuumpy support directly at trust@yuumpy.com with details.' },
                { step: '4', text: 'If you have already been defrauded, contact your bank immediately and report to Action Fraud (UK) at actionfraud.police.uk.' },
              ].map(({ step, text }) => (
                <div key={step} className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-indigo-600 text-white text-sm font-black flex items-center justify-center shrink-0">
                    {step}
                  </div>
                  <p className="text-gray-700 pt-1">{text}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Pledge */}
          <section className="text-center">
            <div className="inline-flex flex-col items-center gap-4 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-3xl p-10 text-white max-w-2xl w-full">
              <CheckCircle2 className="w-10 h-10 text-white/80" />
              <h2 className="text-2xl font-black">The Yuumpy Pledge</h2>
              <p className="text-indigo-100 leading-relaxed text-sm">
                We are committed to making every transaction on Yuumpy safe, fair, and
                transparent. We will never ask you to pay outside the platform, and we
                will always act impartially in any dispute. Craft deserves protection.
              </p>
              <Link
                href="/terms"
                className="flex items-center gap-2 px-5 py-2.5 bg-white/15 hover:bg-white/25 rounded-xl text-sm font-bold transition-colors border border-white/20"
              >
                Read our Terms of Service <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </section>

        </div>
      </main>

      <Footer />
    </div>
  );
}
