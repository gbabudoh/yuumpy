import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { CheckCircle, Lock, PenTool, Sparkles, Store, Globe, MessageCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Sell on Yuumpy - Join Our Artisan Marketplace',
  description: 'Turn your craft into a business. Join Yuumpy and reach conscious collectors who value handmade, story-rich creations.',
};

export default function SellOnYuumpyPage() {
  return (
    <div className="min-h-screen bg-[#fafafa]">
      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden pt-20 pb-32">
        <div className="absolute inset-0 bg-neutral-900" />
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: 'radial-gradient(circle at 20% 30%, rgba(99,102,241,0.4) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(168,85,247,0.4) 0%, transparent 50%)',
        }} />
        <div className="relative container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-indigo-300 text-[10px] font-black uppercase tracking-[0.2em] mb-8">
            <Store className="w-3 h-3" /> For Makers & Artisans
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white mb-8 leading-[1.1] tracking-tight">
            Turn Your Craft<br />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-500 to-indigo-300 bg-clip-text text-transparent italic inline-block pb-1 pr-4">
              Into a Business
            </span>
          </h1>
          <p className="text-xl text-neutral-300 max-w-3xl mx-auto mb-12 leading-relaxed font-medium">
            Yuumpy connects independent makers with collectors who value the story behind every
            piece. No mass-market noise — just a curated home for genuine craftsmanship.
          </p>
          <div className="flex flex-col sm:flex-row gap-5 justify-center">
            <Link href="/account/settings?tab=selling" className="px-10 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold transition-all shadow-xl shadow-indigo-600/20 active:scale-95 text-sm uppercase tracking-widest">
              Start Selling Today
            </Link>
            <Link href="/about-yuumpy" className="px-10 py-4 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-2xl font-bold transition-all active:scale-95 text-sm uppercase tracking-widest">
              Learn Our Story
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 -mt-16 relative z-10">
        <div className="bg-white rounded-[3rem] p-10 md:p-16 border border-neutral-100 shadow-2xl shadow-neutral-200/50">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 text-indigo-600 font-black text-[10px] uppercase tracking-[0.3em] mb-4">
              <Sparkles className="w-4 h-4" /> Getting Started
            </div>
            <h2 className="text-4xl font-black text-neutral-900 mb-6 tracking-tight">Three Steps to Your Studio</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Create an Account', desc: 'Sign up as a Yuumpy customer in seconds — it\'s free and takes less than a minute.' },
              { step: '02', title: 'Apply to Sell', desc: 'Fill out your studio details from your account settings. We review every application personally.' },
              { step: '03', title: 'List & Get Paid', desc: 'Upload your first pieces, set your prices, and get paid securely via escrow once orders are fulfilled.' },
            ].map((item) => (
              <div key={item.step} className="space-y-3">
                <div className="text-5xl font-black text-indigo-100">{item.step}</div>
                <h3 className="text-xl font-bold text-neutral-900">{item.title}</h3>
                <p className="text-neutral-500 text-sm leading-relaxed font-medium">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Sell Here */}
      <section className="bg-neutral-900 text-white py-24 overflow-hidden relative mt-24">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-indigo-600/5 blur-3xl -skew-x-12" />
        <div className="container mx-auto px-4 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-10">
              <div>
                <h2 className="text-4xl font-black mb-6">Why Artisans Choose Yuumpy</h2>
                <p className="text-neutral-400 font-medium leading-relaxed">
                  We are not another mass-market giant. We are a boutique platform that understands
                  the challenges of being an independent creator.
                </p>
              </div>
              <div className="space-y-6">
                {[
                  { title: 'Lower Fees, More Respect', desc: 'No hidden listing fees. We only take a competitive commission when you succeed.' },
                  { title: 'Maker-First Branding', desc: 'Your profile is your story. Custom studio galleries and bio sections let you build your brand.' },
                  { title: 'Bespoke Orders', desc: 'Built-in tools to handle customization requests, turning one-off visitors into lifelong patrons.' },
                  { title: 'Secure Payments', desc: 'Escrow-protected transactions mean you get paid fairly, and buyers shop with confidence.' },
                ].map((item) => (
                  <div key={item.title} className="flex gap-4">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-600/20 text-indigo-400 flex items-center justify-center mt-1">
                      <CheckCircle className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-neutral-200">{item.title}</h4>
                      <p className="text-sm text-neutral-500">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm p-10 rounded-[3rem] border border-white/10">
              <h3 className="text-2xl font-bold mb-4">Join the Movement</h3>
              <p className="text-neutral-400 mb-8 font-medium">
                Whether you are a master potter, a custom furniture designer, or a textile artist —
                Yuumpy is the home your creations deserve.
              </p>
              <Link href="/account/settings?tab=selling" className="inline-block px-10 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold transition-all text-sm uppercase tracking-widest shadow-xl shadow-indigo-600/20">
                Register Your Studio
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Pillars */}
      <section className="container mx-auto px-4 py-24 md:py-32">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-black text-neutral-900 mb-6 tracking-tight">Built for Independent Makers</h2>
          <p className="text-neutral-500 font-medium">Tools and trust designed around your craft, not against it.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: <PenTool className="w-6 h-6 text-indigo-600" />,
              title: 'Curated, Not Crowded',
              desc: 'Every artisan is manually reviewed, keeping the marketplace a sanctuary for genuine craftsmanship.',
            },
            {
              icon: <Lock className="w-6 h-6 text-indigo-600" />,
              title: 'Escrow Protection',
              desc: 'Funds are held securely until orders are confirmed — fair for makers, safe for buyers.',
            },
            {
              icon: <Globe className="w-6 h-6 text-indigo-600" />,
              title: 'Global Reach',
              desc: 'We handle the complexities of international trust and payments so you can focus on your craft.',
            },
          ].map((item) => (
            <div key={item.title} className="group p-10 bg-white rounded-[2.5rem] border border-neutral-100 hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-500/5 transition-all">
              <div className="w-14 h-14 rounded-2xl bg-neutral-50 flex items-center justify-center mb-6 group-hover:bg-indigo-50 group-hover:scale-110 transition-all">
                {item.icon}
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-4">{item.title}</h3>
              <p className="text-neutral-500 text-sm leading-relaxed font-medium">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-24 text-center">
        <h2 className="text-3xl md:text-5xl font-black text-neutral-900 mb-6">Ready to Open Your Studio?</h2>
        <p className="text-neutral-500 max-w-2xl mx-auto mb-10 font-medium">
          Join a community of makers who believe their craft deserves more than a marketplace listing.
        </p>
        <div className="flex flex-col sm:flex-row gap-5 justify-center">
          <Link href="/account/settings?tab=selling" className="px-10 py-4 bg-neutral-900 hover:bg-black text-white rounded-2xl font-bold transition-all text-sm uppercase tracking-widest active:scale-95">
            Start Selling
          </Link>
          <Link href="/contact" className="px-10 py-4 bg-white border border-neutral-200 text-neutral-600 rounded-2xl font-bold transition-all text-sm uppercase tracking-widest hover:bg-neutral-50 active:scale-95 flex items-center justify-center gap-2">
            <MessageCircle className="w-4 h-4" /> Have Questions?
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
