import { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Terms of Service - Yuumpy',
  description: 'Read the terms and conditions for using Yuumpy affiliate marketplace platform.' };

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-8">Terms of Service</h1>
            
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-600 mb-8">
                Last updated: {new Date().toLocaleDateString()}
              </p>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  By accessing and using Yuumpy ("the Service"), you accept and agree to be bound by the 
                  terms and provision of this agreement. If you do not agree to abide by the above, 
                  please do not use this service.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  These Terms of Service ("Terms") govern your use of our website located at yuumpy.com 
                  (the "Service") operated by Yuumpy ("us", "we", or "our").
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Description of Service</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Yuumpy is an affiliate marketplace platform that connects users with products and services 
                  from various merchants. We provide:
                </p>
                <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                  <li>Product discovery and comparison tools</li>
                  <li>Affiliate links to third-party merchants</li>
                  <li>Product reviews and recommendations</li>
                  <li>Category-based product browsing</li>
                  <li>Featured product showcases</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. User Accounts</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  When you create an account with us, you must provide information that is accurate, 
                  complete, and current at all times. You are responsible for:
                </p>
                <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                  <li>Safeguarding the password and all activities under your account</li>
                  <li>Notifying us immediately of any unauthorized use of your account</li>
                  <li>Ensuring your account information remains accurate and up-to-date</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Affiliate Relationships</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Yuumpy participates in various affiliate marketing programs. This means that when you 
                  click on certain links on our website and make a purchase, we may receive a commission 
                  from the merchant at no additional cost to you.
                </p>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We are committed to transparency and will always disclose our affiliate relationships. 
                  Our recommendations are based on our genuine assessment of products and services, 
                  regardless of affiliate relationships.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Prohibited Uses</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  You may not use our Service:
                </p>
                <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                  <li>For any unlawful purpose or to solicit others to perform unlawful acts</li>
                  <li>To violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances</li>
                  <li>To infringe upon or violate our intellectual property rights or the intellectual property rights of others</li>
                  <li>To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate</li>
                  <li>To submit false or misleading information</li>
                  <li>To upload or transmit viruses or any other type of malicious code</li>
                  <li>To spam, phish, pharm, pretext, spider, crawl, or scrape</li>
                  <li>For any obscene or immoral purpose</li>
                  <li>To interfere with or circumvent the security features of the Service</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Intellectual Property Rights</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  The Service and its original content, features, and functionality are and will remain 
                  the exclusive property of Yuumpy and its licensors. The Service is protected by 
                  copyright, trademark, and other laws.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  Our trademarks and trade dress may not be used in connection with any product or 
                  service without our prior written consent.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Third-Party Links</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Our Service may contain links to third-party websites or services that are not owned 
                  or controlled by Yuumpy. We have no control over, and assume no responsibility for, 
                  the content, privacy policies, or practices of any third-party websites or services.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  You acknowledge and agree that Yuumpy shall not be responsible or liable, directly or 
                  indirectly, for any damage or loss caused or alleged to be caused by or in connection 
                  with the use of or reliance on any such content, goods, or services available on or 
                  through any such websites or services.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Disclaimer of Warranties</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  The information on this Service is provided on an "as is" basis. To the fullest extent 
                  permitted by law, Yuumpy excludes:
                </p>
                <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                  <li>All representations and warranties relating to this website and its contents</li>
                  <li>All liability for damages arising out of or in connection with your use of this website</li>
                  <li>All warranties regarding the accuracy, completeness, or suitability of the information</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Limitation of Liability</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  In no event shall Yuumpy, nor its directors, employees, partners, agents, suppliers, 
                  or affiliates, be liable for any indirect, incidental, special, consequential, or 
                  punitive damages, including without limitation, loss of profits, data, use, goodwill, 
                  or other intangible losses, resulting from your use of the Service.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Indemnification</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  You agree to defend, indemnify, and hold harmless Yuumpy and its licensee and licensors, 
                  and their employees, contractors, agents, officers and directors, from and against any 
                  and all claims, damages, obligations, losses, liabilities, costs or debt, and expenses 
                  (including but not limited to attorney's fees).
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Termination</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We may terminate or suspend your account and bar access to the Service immediately, 
                  without prior notice or liability, under our sole discretion, for any reason whatsoever 
                  and without limitation, including but not limited to a breach of the Terms.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  If you wish to terminate your account, you may simply discontinue using the Service.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Governing Law</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  These Terms shall be interpreted and governed by the laws of the United Kingdom, 
                  without regard to its conflict of law provisions. Our failure to enforce any right 
                  or provision of these Terms will not be considered a waiver of those rights.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Changes to Terms</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We reserve the right, at our sole discretion, to modify or replace these Terms at any 
                  time. If a revision is material, we will provide at least 30 days notice prior to any 
                  new terms taking effect.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  By continuing to access or use our Service after those revisions become effective, 
                  you agree to be bound by the revised terms.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">14. Contact Information</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  If you have any questions about these Terms of Service, please contact us:
                </p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700">
                    <strong>Email:</strong> legal@yuumpy.com<br />
                    <strong>Address:</strong> Yuumpy Legal Team<br />
                    <strong>Phone:</strong> +44 20 1234 5678
                  </p>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
