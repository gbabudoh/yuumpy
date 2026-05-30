import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import {
  Globe, AlertTriangle, CheckCircle2, Info,
  Package, FileText, ArrowRight, ShieldCheck, Banknote
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'International Shipping, Customs & Tax Advisory — Yuumpy',
  description:
    'Everything buyers and artisans need to know about customs duties, import taxes, and international shipping on Yuumpy.',
};

const buyerRegions = [
  {
    region: 'United Kingdom',
    flag: '🇬🇧',
    threshold: '£135',
    vatNote: 'VAT is collected at checkout on orders up to £135. Orders above £135 may incur import VAT and customs duty on arrival, charged by Royal Mail or your courier.',
    dutyNote: 'Customs duty applies above £135. Rate depends on the product type (typically 0–12% for handmade goods).',
    link: 'https://www.gov.uk/goods-sent-from-abroad',
    linkLabel: 'HMRC guidance',
  },
  {
    region: 'European Union',
    flag: '🇪🇺',
    threshold: '€150',
    vatNote: 'VAT is due on all imports into the EU regardless of value. Orders up to €150 may have VAT collected at point of sale. Above €150, customs clearance is required.',
    dutyNote: 'Customs duty applies on goods over €150. Expect 0–12% for artisan/craft goods depending on classification.',
    link: 'https://taxation-customs.ec.europa.eu',
    linkLabel: 'EU Customs guidance',
  },
  {
    region: 'United States',
    flag: '🇺🇸',
    threshold: '$800',
    vatNote: 'No federal VAT/GST. State sales tax may apply in some states for online purchases.',
    dutyNote: 'Goods under $800 enter duty-free (de minimis threshold). Above $800, US CBP will assess duties — typically 0–6.5% for handmade goods.',
    link: 'https://www.cbp.gov/travel/us-citizens/know-before-you-go/prohibited-and-restricted-items',
    linkLabel: 'US CBP guidance',
  },
  {
    region: 'Canada',
    flag: '🇨🇦',
    threshold: 'CAD $20',
    vatNote: 'GST/HST applies to most imported goods. The de minimis threshold is very low at CAD $20.',
    dutyNote: 'Duties vary by product. Expect CBSA to assess GST on most purchases. Couriers may charge a brokerage fee for clearance.',
    link: 'https://www.cbsa-asfc.gc.ca/import/consumers-consommateurs-eng.html',
    linkLabel: 'CBSA guidance',
  },
  {
    region: 'Australia',
    flag: '🇦🇺',
    threshold: 'AUD $1,000',
    vatNote: 'GST (10%) applies on goods over AUD $1,000 and on all goods from overseas sellers registered for GST (which includes major platforms). Check with your courier on arrival.',
    dutyNote: 'Customs duty applies above AUD $1,000. Generally 0–5% for handmade craft goods.',
    link: 'https://www.abf.gov.au/importing-exporting-and-manufacturing/importing/how-to-import/importing-for-personal-use',
    linkLabel: 'ABF guidance',
  },
  {
    region: 'Rest of World',
    flag: '🌍',
    threshold: 'Varies',
    vatNote: 'Import VAT/GST thresholds and rates vary significantly by country. Always check your country\'s customs authority website before purchasing.',
    dutyNote: 'Duties depend on the product HS code and bilateral trade agreements. Handmade artisan goods are typically in a low-duty category.',
    link: 'https://www.wcoomd.org',
    linkLabel: 'World Customs Organisation',
  },
];

const sellerTips = [
  {
    icon: FileText,
    title: 'Customs declaration forms',
    body: 'Always complete CN22 (under £270) or CN23 (over £270) forms accurately. Describe items clearly — e.g. "Handmade ceramic vase" not just "gift". Underdeclaring value is illegal and can lead to confiscation.',
  },
  {
    icon: Banknote,
    title: 'Declare the correct value',
    body: 'Declare the actual sale price paid via Yuumpy — not a gift value. Customs authorities check against the Yuumpy purchase receipt. Misdeclaration can create problems for your buyer and your seller account.',
  },
  {
    icon: Package,
    title: 'Mark as commercial goods',
    body: 'Tick "Sale of Goods" on the customs form. Never mark as "Gift" for a commercial sale — this is a customs offence in most countries and can result in delays and penalties for the buyer.',
  },
  {
    icon: Globe,
    title: 'Include a packing slip',
    body: 'Include a printed packing slip inside the parcel showing the Yuumpy order number, item description, and value. This helps customs authorities clear the parcel quickly and gives the buyer evidence if a dispute arises.',
  },
  {
    icon: ShieldCheck,
    title: 'Restricted & prohibited items',
    body: 'Some materials are restricted in certain countries — ivory, certain animal products, protected plant species, and some dyes. Check the destination country\'s prohibited items list before shipping.',
  },
];

export default function CustomsAdvisoryPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main>
        {/* Hero */}
        <section className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 py-20 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-white/20">
              <Globe className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
              International Shipping,<br />Customs & Tax
            </h1>
            <p className="text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Buying or selling across borders? Here is everything you need to know about customs duties, import taxes, and your responsibilities.
            </p>
          </div>
        </section>

        {/* Important notice */}
        <section className="bg-amber-50 border-y border-amber-200 py-5 px-6">
          <div className="max-w-4xl mx-auto flex items-start gap-4">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800 leading-relaxed">
              <strong>Buyer responsibility:</strong> Import duties, customs charges, and local taxes are the buyer&apos;s responsibility and are not included in the Yuumpy checkout price unless stated. Yuumpy does not collect or remit import duties on your behalf. Always check your country&apos;s rules before purchasing internationally.
            </p>
          </div>
        </section>

        <div className="max-w-5xl mx-auto px-6 py-16 space-y-20">

          {/* How it works */}
          <section>
            <div className="mb-10">
              <p className="text-xs font-black uppercase tracking-widest text-indigo-600 mb-2">How it works</p>
              <h2 className="text-3xl font-black text-gray-900">What happens when you order internationally</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[
                { step: '1', title: 'You place your order', body: 'Payment is processed securely through Yuumpy and held in escrow. The Yuumpy price covers the item and domestic shipping only.' },
                { step: '2', title: 'Artisan ships your item', body: 'The artisan packs your order, completes a customs declaration form with the correct value and description, and hands it to their carrier.' },
                { step: '3', title: 'Customs clearance', body: 'Your country\'s customs authority may assess import VAT and/or duty on arrival. The courier will contact you to pay any charges before releasing the parcel.' },
              ].map(({ step, title, body }) => (
                <div key={step} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                  <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white text-sm font-black flex items-center justify-center mb-4">{step}</div>
                  <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{body}</p>
                </div>
              ))}
            </div>
          </section>

          {/* By region */}
          <section>
            <div className="mb-10">
              <p className="text-xs font-black uppercase tracking-widest text-indigo-600 mb-2">For Buyers</p>
              <h2 className="text-3xl font-black text-gray-900">Import duties & thresholds by region</h2>
              <p className="text-gray-500 mt-2 max-w-xl text-sm">Thresholds and rates change — always verify with your country&apos;s official customs authority.</p>
            </div>
            <div className="space-y-4">
              {buyerRegions.map(r => (
                <div key={r.region} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="flex items-center gap-4 px-6 py-4 border-b border-gray-50">
                    <span className="text-2xl">{r.flag}</span>
                    <div className="flex-1">
                      <p className="font-black text-gray-900">{r.region}</p>
                      <p className="text-xs text-gray-400 font-medium">Duty-free threshold: <strong className="text-gray-700">{r.threshold}</strong></p>
                    </div>
                    <a href={r.link} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors">
                      {r.linkLabel} <ArrowRight className="w-3 h-3" />
                    </a>
                  </div>
                  <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex gap-3">
                      <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                      <p className="text-sm text-gray-600 leading-relaxed">{r.vatNote}</p>
                    </div>
                    <div className="flex gap-3">
                      <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <p className="text-sm text-gray-600 leading-relaxed">{r.dutyNote}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Artisan guidance */}
          <section>
            <div className="mb-10">
              <p className="text-xs font-black uppercase tracking-widest text-purple-600 mb-2">For Artisans</p>
              <h2 className="text-3xl font-black text-gray-900">Shipping internationally — your responsibilities</h2>
              <p className="text-gray-500 mt-2 max-w-xl text-sm">
                As the seller you are responsible for correctly completing customs paperwork. Errors can delay or lose your buyer&apos;s parcel and lead to disputes.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {sellerTips.map(({ icon: Icon, title, body }) => (
                <div key={title} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-purple-600" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{body}</p>
                </div>
              ))}
            </div>
          </section>

          {/* FAQs */}
          <section className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 md:p-12">
            <h2 className="text-2xl font-black text-gray-900 mb-8">Frequently asked questions</h2>
            <div className="space-y-6 divide-y divide-gray-100">
              {[
                {
                  q: 'Are customs charges included in the Yuumpy price?',
                  a: 'No. The price you pay on Yuumpy covers the item and the artisan\'s domestic shipping cost. Any import duties, customs VAT, or handling fees charged by your country\'s customs authority are separate and are the buyer\'s responsibility.',
                },
                {
                  q: 'What if my parcel is held by customs?',
                  a: 'Your courier or national postal service will contact you with instructions on how to pay any charges due. Once paid, the parcel will be released. If you believe a charge is incorrect, contact your customs authority directly with your Yuumpy order receipt.',
                },
                {
                  q: 'Can I claim import duties back if I return an item?',
                  a: 'In many countries, yes — you can apply to your customs authority for a refund of import duties paid on goods that are returned. You will need your customs payment receipt and the return proof. Yuumpy will provide a refund of the item cost; the duty refund is handled separately with your customs authority.',
                },
                {
                  q: 'As an artisan, do I need to charge VAT on international orders?',
                  a: 'If you are VAT-registered in the UK, you generally zero-rate sales to customers outside the UK. If you are not VAT-registered, no VAT applies. Always consult an accountant for advice specific to your business situation.',
                },
                {
                  q: 'What HS (Harmonised System) code should I use for handmade goods?',
                  a: 'Handmade ceramic items typically fall under HS 6913. Handmade textiles under HS 6307. Handmade jewellery under HS 7117. Handmade wooden items under HS 4420. If unsure, search the UK Trade Tariff at trade-tariff.service.gov.uk.',
                },
              ].map(({ q, a }) => (
                <div key={q} className="pt-6 first:pt-0">
                  <h3 className="font-bold text-gray-900 mb-2">{q}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{a}</p>
                </div>
              ))}
            </div>
          </section>

          {/* CTA */}
          <section className="text-center">
            <div className="inline-flex flex-col items-center gap-4 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-3xl p-10 text-white max-w-2xl w-full">
              <ShieldCheck className="w-10 h-10 text-white/80" />
              <h2 className="text-2xl font-black">Still have questions?</h2>
              <p className="text-indigo-100 leading-relaxed text-sm">
                Our support team is happy to help with customs and shipping queries. You can also reach us through the contact form.
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                <Link href="/contact" className="flex items-center gap-2 px-5 py-2.5 bg-white text-indigo-700 rounded-xl text-sm font-bold hover:bg-indigo-50 transition-colors">
                  Contact Support <ArrowRight className="w-4 h-4" />
                </Link>
                <Link href="/safe-trading" className="flex items-center gap-2 px-5 py-2.5 bg-white/15 hover:bg-white/25 rounded-xl text-sm font-bold border border-white/20 transition-colors">
                  Safe Trading Guide
                </Link>
              </div>
            </div>
          </section>

        </div>
      </main>

      <Footer />
    </div>
  );
}
