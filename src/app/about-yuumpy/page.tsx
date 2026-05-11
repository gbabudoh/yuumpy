import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { Headphones, CheckCircle, Lock, PenTool, Sparkles, Heart } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Our Story - Yuumpy Artisan Marketplace',
  description: 'Discover Yuumpy, a curated digital craft fair connecting conscious consumers with master artisans. Experience the story, the process, and the provenance behind every handmade creation.',
};

export default function AboutPage() {
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
            <Sparkles className="w-3 h-3" /> The Digital Craft Fair
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white mb-8 leading-[1.1] tracking-tight">
            Where Every Item<br />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-500 to-indigo-300 bg-clip-text text-transparent italic inline-block pb-1 pr-4">
              Has a Story to Tell
            </span>
          </h1>
          <p className="text-xl text-neutral-300 max-w-3xl mx-auto mb-12 leading-relaxed font-medium">
            Yuumpy is a curated haven for independent artisans and conscious collectors. 
            We bridge the gap between master craftsmanship and the modern world, 
            ensuring every creation is celebrated for its journey, not just its price tag.
          </p>
          <div className="flex flex-col sm:flex-row gap-5 justify-center">
            <Link href="/products" className="px-10 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold transition-all shadow-xl shadow-indigo-600/20 active:scale-95 text-sm uppercase tracking-widest">
              Explore Collections
            </Link>
            <Link href="/account/register" className="px-10 py-4 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-2xl font-bold transition-all active:scale-95 text-sm uppercase tracking-widest">
              Become a Maker
            </Link>
          </div>
        </div>
      </section>

      {/* Our Mission */}
      <section className="container mx-auto px-4 -mt-16 relative z-10">
        <div className="bg-white rounded-[3rem] p-10 md:p-16 border border-neutral-100 shadow-2xl shadow-neutral-200/50">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 text-indigo-600 font-black text-[10px] uppercase tracking-[0.3em] mb-4">
                <Heart className="w-4 h-4 fill-indigo-600" /> Our Mission
              </div>
              <h2 className="text-4xl font-black text-neutral-900 mb-6 tracking-tight">Preserving Craft in a Digital World</h2>
              <p className="text-lg text-neutral-500 leading-relaxed font-medium mb-8">
                In an era of mass production and anonymous manufacturing, Yuumpy stands as a bastion for the human touch. 
                We believe that the products we surround ourselves with should possess soul, character, and a traceable history.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <h4 className="text-neutral-900 font-bold">Artisan Storytelling</h4>
                  <p className="text-sm text-neutral-400 leading-relaxed">Go beyond the product page. Meet the makers in their studios and see the process behind the craft.</p>
                </div>
                <div className="space-y-2">
                  <h4 className="text-neutral-900 font-bold">Provenance First</h4>
                  <p className="text-sm text-neutral-400 leading-relaxed">Every item on Yuumpy is verified for its origin, ensuring you support genuine independent artisans.</p>
                </div>
              </div>
            </div>
            <div className="relative aspect-square rounded-[2rem] overflow-hidden">
               <div className="absolute inset-0 bg-neutral-100 flex items-center justify-center text-neutral-300 italic font-medium p-12 text-center">
                 [Image: A high-fidelity shot of an artisan working in a sunlit studio, surrounded by raw materials]
               </div>
               <div className="absolute bottom-6 left-6 right-6 p-6 bg-white/80 backdrop-blur-md rounded-2xl border border-white/20">
                 <p className="text-xs font-black text-neutral-900 uppercase tracking-widest mb-1">Featured Maker</p>
                 <p className="text-sm text-neutral-600 font-medium italic">&quot;Yuumpy gives my work the space it needs to be understood, not just scrolled past.&quot;</p>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Pillars */}
      <section className="container mx-auto px-4 py-24 md:py-32">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-black text-neutral-900 mb-6 tracking-tight">The Yuumpy Ecosystem</h2>
          <p className="text-neutral-500 font-medium">Built on trust, transparency, and a shared love for the extraordinary.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: <PenTool className="w-6 h-6 text-indigo-600" />,
              title: 'Curated Artisan Hub',
              desc: 'We manually review every artisan to ensure the marketplace remains a sanctuary for genuine craftsmanship.',
            },
            {
              icon: <Lock className="w-6 h-6 text-indigo-600" />,
              title: 'Ethical Commerce',
              desc: 'Secure escrow protects both parties. Makers get paid fairly, and collectors shop with absolute peace of mind.',
            },
            {
              icon: <Headphones className="w-6 h-6 text-indigo-600" />,
              title: 'Personal Connection',
              desc: 'Our platform enables direct dialogue. Request custom modifications or simply share a word of appreciation.',
            },
          ].map((item, i) => (
            <div key={i} className="group p-10 bg-white rounded-[2.5rem] border border-neutral-100 hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-500/5 transition-all">
              <div className="w-14 h-14 rounded-2xl bg-neutral-50 flex items-center justify-center mb-6 group-hover:bg-indigo-50 group-hover:scale-110 transition-all">
                {item.icon}
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-4">{item.title}</h3>
              <p className="text-neutral-500 text-sm leading-relaxed font-medium">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="bg-neutral-900 text-white py-24 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-indigo-600/5 blur-3xl -skew-x-12" />
        <div className="container mx-auto px-4 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-10">
              <div>
                <h2 className="text-4xl font-black mb-6">Why Artisans Choose Yuumpy</h2>
                <p className="text-neutral-400 font-medium leading-relaxed">
                  We are not another mass-market giant. We are a boutique platform that understands the challenges of being an independent creator.
                </p>
              </div>
              <div className="space-y-6">
                {[
                  { title: 'Lower Fees, More Respect', desc: 'No hidden listing fees. We only take a competitive 12% commission when you succeed.' },
                  { title: 'Maker-First Branding', desc: 'Your profile is your story. Custom studio galleries and bio sections let you build your brand.' },
                  { title: 'Bespoke Orders', desc: 'Built-in tools to handle customization requests, turning one-off visitors into lifelong patrons.' },
                  { title: 'Global Reach', desc: 'We handle the complexities of international trust and payments so you can focus on your craft.' },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
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
              <Link href="/account/register" className="inline-block px-10 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold transition-all text-sm uppercase tracking-widest shadow-xl shadow-indigo-600/20">
                Register Your Studio
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-24 text-center">
        <h2 className="text-3xl md:text-5xl font-black text-neutral-900 mb-6">Experience the Craft</h2>
        <p className="text-neutral-500 max-w-2xl mx-auto mb-10 font-medium">
          Step inside our curated collections and discover items that will be cherished for generations.
        </p>
        <div className="flex flex-col sm:flex-row gap-5 justify-center">
          <Link href="/products" className="px-10 py-4 bg-neutral-900 hover:bg-black text-white rounded-2xl font-bold transition-all text-sm uppercase tracking-widest active:scale-95">
            Start Exploring
          </Link>
          <Link href="/contact" className="px-10 py-4 bg-white border border-neutral-200 text-neutral-600 rounded-2xl font-bold transition-all text-sm uppercase tracking-widest hover:bg-neutral-50 active:scale-95">
            Get in Touch
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
