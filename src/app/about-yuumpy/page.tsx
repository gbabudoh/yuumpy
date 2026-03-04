import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { Shield, Users, Store, CreditCard, Headphones, Globe, CheckCircle, TrendingUp, Lock, Eye } from 'lucide-react';

export const metadata: Metadata = {
  title: 'About Us - Yuumpy Marketplace',
  description: 'Yuumpy is a trusted multi-vendor marketplace connecting buyers with verified sellers worldwide. Secure escrow payments, real-time communication, and buyer protection on every order.',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900" />
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: 'radial-gradient(circle at 25% 25%, rgba(139,92,246,0.3) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(99,102,241,0.3) 0%, transparent 50%)',
        }} />
        <div className="relative container mx-auto px-4 py-20 md:py-28 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/10 text-purple-300 text-sm font-medium mb-6">
            <Globe className="w-4 h-4" /> A marketplace built on trust
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">
            Where Buyers and Sellers<br />
            <span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
              Connect with Confidence
            </span>
          </h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto mb-10 leading-relaxed">
            Yuumpy is a multi-vendor marketplace that brings together verified sellers and discerning buyers
            under one roof — with secure escrow payments, real-time communication, and protection on every transaction.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/products" className="px-8 py-3.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold transition-colors cursor-pointer text-sm">
              Explore the Marketplace
            </Link>
            <Link href="/account/register" className="px-8 py-3.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl font-semibold transition-colors cursor-pointer text-sm">
              Start Selling
            </Link>
          </div>
        </div>
      </section>

      {/* What is Yuumpy */}
      <section className="container mx-auto px-4 py-16 md:py-20">
        <div className="max-w-4xl mx-auto text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">What is Yuumpy?</h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            Yuumpy is more than an online store. It&apos;s a curated marketplace where independent sellers
            list their products, and buyers shop with the confidence that every transaction is protected.
            We handle the trust layer — escrow payments, seller verification, dispute resolution, and
            real-time communication — so both sides can focus on what matters.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {[
            {
              icon: <Store className="w-6 h-6 text-purple-600" />,
              title: 'Multi-Vendor Marketplace',
              desc: 'Hundreds of independent sellers, each with their own verified storefront, offering unique products across dozens of categories.',
            },
            {
              icon: <Lock className="w-6 h-6 text-purple-600" />,
              title: 'Escrow-Protected Payments',
              desc: 'Every payment is held in escrow until the buyer confirms delivery. Sellers get paid, buyers stay protected.',
            },
            {
              icon: <Headphones className="w-6 h-6 text-purple-600" />,
              title: 'Real-Time Communication',
              desc: 'Chat, voice call, or video call sellers directly from any product page — powered by LiveKit for crystal-clear quality.',
            },
          ].map((item, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center mb-4">
                {item.icon}
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-white border-y border-gray-100">
        <div className="container mx-auto px-4 py-16 md:py-20">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">How Yuumpy Works</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">A simple, transparent process that protects everyone.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            {/* For Buyers */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider mb-6">
                <Users className="w-3.5 h-3.5" /> For Buyers
              </div>
              <div className="space-y-6">
                {[
                  { step: '01', title: 'Browse & Discover', desc: 'Search products, filter by category, brand, condition, or price. Every listing shows the seller\'s rating, location, and verification status.' },
                  { step: '02', title: 'Contact the Seller', desc: 'Have a question? Chat, call, or video call the seller directly from the product page — no need to leave Yuumpy.' },
                  { step: '03', title: 'Pay Securely', desc: 'Checkout with Stripe. Your payment is held in escrow — the seller doesn\'t receive funds until you confirm delivery.' },
                  { step: '04', title: 'Receive & Confirm', desc: 'Once your order arrives, confirm delivery. If something\'s wrong, open a dispute and our team will step in.' },
                ].map((item) => (
                  <div key={item.step} className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-bold">
                      {item.step}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">{item.title}</h4>
                      <p className="text-sm text-gray-600 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* For Sellers */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-bold uppercase tracking-wider mb-6">
                <Store className="w-3.5 h-3.5" /> For Sellers
              </div>
              <div className="space-y-6">
                {[
                  { step: '01', title: 'Register & Get Verified', desc: 'Create your seller account, set up your storefront, and get verified by our team. Approved sellers get a trust badge.' },
                  { step: '02', title: 'List Your Products', desc: 'Add products with images, descriptions, variations, and pricing. Set your own shipping rates and processing times.' },
                  { step: '03', title: 'Receive Orders', desc: 'When a buyer purchases, you\'re notified instantly. Pack and ship the order, then add tracking information.' },
                  { step: '04', title: 'Get Paid', desc: 'Funds are released from escrow 7 days after delivery confirmation, minus a small platform commission. Payouts go directly to your account.' },
                ].map((item) => (
                  <div key={item.step} className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-sm font-bold">
                      {item.step}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">{item.title}</h4>
                      <p className="text-sm text-gray-600 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Safety */}
      <section className="container mx-auto px-4 py-16 md:py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Trust &amp; Safety</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Every layer of Yuumpy is designed to keep your money and your experience safe.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-5xl mx-auto">
          {[
            { icon: <Shield className="w-5 h-5 text-green-600" />, bg: 'bg-green-50', title: 'Escrow Protection', desc: 'Payments held securely until delivery is confirmed by the buyer.' },
            { icon: <CheckCircle className="w-5 h-5 text-blue-600" />, bg: 'bg-blue-50', title: 'Verified Sellers', desc: 'Every seller is reviewed and approved before they can list products.' },
            { icon: <Eye className="w-5 h-5 text-purple-600" />, bg: 'bg-purple-50', title: 'Dispute Resolution', desc: 'Dedicated arbitration team available 24/7 for any order issues.' },
            { icon: <CreditCard className="w-5 h-5 text-indigo-600" />, bg: 'bg-indigo-50', title: 'Stripe Payments', desc: 'Industry-leading payment security. We never store your card details.' },
          ].map((item, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm text-center">
              <div className={`w-11 h-11 rounded-xl ${item.bg} flex items-center justify-center mx-auto mb-3`}>
                {item.icon}
              </div>
              <h3 className="text-sm font-bold text-gray-900 mb-1.5">{item.title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="bg-gradient-to-r from-gray-900 to-purple-900">
        <div className="container mx-auto px-4 py-14">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto text-center">
            {[
              { value: '850+', label: 'Verified Sellers' },
              { value: '12K+', label: 'Active Products' },
              { value: '24/7', label: 'Dispute Support' },
              { value: '100%', label: 'Escrow Protected' },
            ].map((stat, i) => (
              <div key={i}>
                <p className="text-3xl md:text-4xl font-black text-white mb-1">{stat.value}</p>
                <p className="text-sm text-gray-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Sellers Choose Yuumpy */}
      <section className="container mx-auto px-4 py-16 md:py-20">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Why Sellers Choose Yuumpy</h2>
              <p className="text-gray-600 mb-8 leading-relaxed">
                We built Yuumpy to give independent sellers the tools and visibility they need to grow —
                without the complexity of running their own e-commerce site.
              </p>
              <div className="space-y-4">
                {[
                  { icon: <TrendingUp className="w-4 h-4 text-purple-600" />, text: 'Built-in audience of active buyers ready to purchase' },
                  { icon: <Store className="w-4 h-4 text-purple-600" />, text: 'Your own branded storefront with custom logo and description' },
                  { icon: <Headphones className="w-4 h-4 text-purple-600" />, text: 'Direct communication with buyers via chat, voice, and video' },
                  { icon: <Shield className="w-4 h-4 text-purple-600" />, text: 'Escrow system protects you from chargebacks and fraud' },
                  { icon: <CreditCard className="w-4 h-4 text-purple-600" />, text: 'Automatic payouts on a schedule that works for you' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
                      {item.icon}
                    </div>
                    <span className="text-sm text-gray-700">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-2xl p-8 text-white">
              <h3 className="text-2xl font-bold mb-2">Ready to sell?</h3>
              <p className="text-purple-200 mb-6 text-sm leading-relaxed">
                Join hundreds of sellers already growing their business on Yuumpy.
                Registration is free — you only pay a small commission when you make a sale.
              </p>
              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-2 text-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                  <span>No monthly fees or listing charges</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                  <span>Competitive 12% commission on sales</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                  <span>Full seller dashboard with analytics</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                  <span>Stripe Connect for secure payouts</span>
                </div>
              </div>
              <Link href="/account/register"
                className="inline-block px-6 py-3 bg-white text-purple-700 rounded-xl font-semibold text-sm hover:bg-gray-100 transition-colors cursor-pointer">
                Create Your Store
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gray-900">
        <div className="container mx-auto px-4 py-16 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Start Shopping or Start Selling
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto mb-8">
            Whether you&apos;re looking for unique products or ready to grow your business,
            Yuumpy is the marketplace built for you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/products"
              className="px-8 py-3.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold transition-colors cursor-pointer text-sm">
              Browse Products
            </Link>
            <Link href="/contact"
              className="px-8 py-3.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl font-semibold transition-colors cursor-pointer text-sm">
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
