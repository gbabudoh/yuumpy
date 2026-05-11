import Header from '@/components/Header';
import Footer from '@/components/Footer';
import type { Metadata } from 'next';
import { CheckCircle, RefreshCw, Package } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Product Conditions Explained - Yuumpy',
  description: 'Learn about the artisan product conditions on Yuumpy: Handcrafted, Upcycled, Bespoke, and more.',
};

export default function ProductConditionsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Product Conditions Explained
          </h1>
          
          <p className="text-lg text-gray-600 mb-8">
            At Yuumpy, we prioritize the artisan&apos;s touch. Our product conditions reflect the 
            care and craftsmanship behind every item, helping you understand how your 
            next favorite piece was brought to life:
          </p>

          {/* Condition Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {[
              {
                title: 'Handcrafted',
                desc: 'Made entirely from raw materials by the artisan.',
                expect: ['Created from scratch', 'High level of manual skill', 'Each piece is unique'],
                icon: <Package className="w-6 h-6 text-indigo-600" />,
                bg: 'bg-indigo-50'
              },
              {
                title: 'Hand-altered',
                desc: 'Modified or decorated from a pre-made base item.',
                expect: ['Unique customizations', 'Artistic modification', 'Enhanced functionality or style'],
                icon: <CheckCircle className="w-6 h-6 text-green-600" />,
                bg: 'bg-green-50'
              },
              {
                title: 'Hand-assembled',
                desc: 'Various components combined by hand to create the final piece.',
                expect: ['Meticulous assembly', 'Curated components', 'Hand-finished details'],
                icon: <RefreshCw className="w-6 h-6 text-blue-600" />,
                bg: 'bg-blue-50'
              },
              {
                title: 'Hand-designed',
                desc: 'Original digital or physical art designed by the maker.',
                expect: ['Original artwork', 'Digital or physical designs', 'Authentic creative expression'],
                icon: <CheckCircle className="w-6 h-6 text-purple-600" />,
                bg: 'bg-purple-50'
              },
              {
                title: 'Upcycled',
                desc: 'Items given new life through creative refurbishment.',
                expect: ['Sustainable materials', 'Creative restoration', 'Eco-friendly choice'],
                icon: <RefreshCw className="w-6 h-6 text-emerald-600" />,
                bg: 'bg-emerald-50'
              },
              {
                title: 'Repurposed',
                desc: 'Items transformed for a completely new use case.',
                expect: ['Innovative utility', 'Transformed purpose', 'Creative problem solving'],
                icon: <Package className="w-6 h-6 text-orange-600" />,
                bg: 'bg-orange-50'
              },
              {
                title: 'Bespoke',
                desc: 'Products made to a customer\'s specific order or measurements.',
                expect: ['Made-to-order', 'Custom specifications', 'Personalized experience'],
                icon: <CheckCircle className="w-6 h-6 text-rose-600" />,
                bg: 'bg-rose-50'
              },
              {
                title: 'Sourced/Handpicked',
                desc: 'Curated vintage items or natural objects selected by the maker.',
                expect: ['Expert curation', 'Unique vintage finds', 'Selected for quality and character'],
                icon: <Package className="w-6 h-6 text-amber-600" />,
                bg: 'bg-amber-50'
              },
              {
                title: 'Imperfectly Perfect',
                desc: 'Brand new item with minor artisan flaws that add character.',
                expect: ['Visible handwork', 'Unique personality', 'Fully functional with minor quirks'],
                icon: <CheckCircle className="w-6 h-6 text-slate-600" />,
                bg: 'bg-slate-50'
              }
            ].map((cond) => (
              <div key={cond.title} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-start gap-4">
                  <div className={`flex-shrink-0 w-12 h-12 ${cond.bg} rounded-full flex items-center justify-center`}>
                    {cond.icon}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-gray-900 mb-2">{cond.title}</h2>
                    <p className="text-gray-600 text-sm mb-4">{cond.desc}</p>
                    <div className="space-y-2">
                      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">What to expect:</h3>
                      <ul className="space-y-1">
                        {cond.expect.map((ex, i) => (
                          <li key={i} className="flex items-center gap-2 text-xs text-gray-500">
                            <div className="w-1 h-1 rounded-full bg-gray-300" />
                            {ex}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* FAQ Section */}
          <div className="mt-8">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-6">
              Common Questions
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-semibold text-gray-900 mb-2">
                  What makes Handcrafted different from Hand-assembled?
                </h3>
                <p className="text-gray-600 text-sm">
                  Handcrafted items are made entirely from raw materials (like turning wood into a bowl). 
                  Hand-assembled items involve combining existing components by hand to create something new 
                  (like assembling jewelry components or electronic kits).
                </p>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Is Upcycled the same as Repurposed?
                </h3>
                <p className="text-gray-600 text-sm">
                  Upcycled items are restored or enhanced versions of their original selves (like a restored chair). 
                  Repurposed items are transformed for a completely different use (like a suitcase turned into a side table).
                </p>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-semibold text-gray-900 mb-2">
                  How does Bespoke work?
                </h3>
                <p className="text-gray-600 text-sm">
                  Bespoke items are made specifically for you. Once you place an order, the artisan will typically 
                  contact you for measurements, preferences, or custom details before starting production.
                </p>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-semibold text-gray-900 mb-2">
                  What is &quot;Imperfectly Perfect&quot;?
                </h3>
                <p className="text-gray-600 text-sm">
                  These are new items that may have minor cosmetic quirks or slight variations due to the 
                  handmade process. We believe these imperfections are what make artisan goods truly special and authentic.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
