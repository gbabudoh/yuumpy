import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Privacy Policy - Yuumpy',
  description: 'Learn how Yuumpy collects, uses, and protects your personal information.',
};

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-8">Privacy Policy</h1>

            <div className="prose prose-lg max-w-none">
              <p className="text-gray-600 mb-8">
                Last updated: {new Date().toLocaleDateString()}
              </p>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Yuumpy (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) is committed to protecting your personal information.
                  This Privacy Policy explains how we collect, use, disclose, and safeguard your
                  information when you visit yuumpy.com or use our services.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  Please read this policy carefully. If you disagree with its terms, please discontinue
                  use of the site.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Information We Collect</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We may collect the following types of information:
                </p>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Personal Information</h3>
                <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                  <li>Name and email address (when you register or contact us)</li>
                  <li>Billing and shipping address (when you make a purchase)</li>
                  <li>Payment information (processed securely via Stripe — we do not store card details)</li>
                  <li>Phone number (if provided)</li>
                </ul>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Usage Information</h3>
                <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                  <li>IP address and browser type</li>
                  <li>Pages visited and time spent on the site</li>
                  <li>Referring URLs and search terms</li>
                  <li>Device and operating system information</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. How We Use Your Information</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We use the information we collect to:
                </p>
                <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                  <li>Process and fulfil your orders</li>
                  <li>Send order confirmations and updates</li>
                  <li>Respond to your enquiries and provide customer support</li>
                  <li>Improve our website, products, and services</li>
                  <li>Send promotional communications (where you have opted in)</li>
                  <li>Comply with legal obligations</li>
                  <li>Detect and prevent fraudulent transactions</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Cookies</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We use cookies and similar tracking technologies to enhance your experience on our site.
                  These include:
                </p>
                <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                  <li><strong>Essential cookies</strong> — required for the site to function correctly</li>
                  <li><strong>Analytics cookies</strong> — help us understand how visitors use the site (Google Analytics)</li>
                  <li><strong>Preference cookies</strong> — remember your settings and choices</li>
                </ul>
                <p className="text-gray-700 leading-relaxed">
                  You can control cookies through your browser settings. Disabling certain cookies may
                  affect site functionality.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Sharing Your Information</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We do not sell your personal information. We may share it with:
                </p>
                <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                  <li><strong>Payment processors</strong> — Stripe, to handle transactions securely</li>
                  <li><strong>Artisan sellers</strong> — only the information needed to fulfil your order</li>
                  <li><strong>Analytics providers</strong> — Google Analytics, in anonymised form</li>
                  <li><strong>Legal authorities</strong> — where required by law or to protect our rights</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Data Retention</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We retain your personal information for as long as necessary to fulfil the purposes
                  outlined in this policy, unless a longer retention period is required or permitted
                  by law.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  Order records are kept for a minimum of 7 years for legal and tax compliance purposes.
                  You may request deletion of your account data at any time (see Section 8).
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Data Security</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We implement appropriate technical and organisational measures to protect your personal
                  information against unauthorised access, alteration, disclosure, or destruction.
                  These include encrypted connections (HTTPS), secure password hashing, and restricted
                  access to personal data.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  However, no method of transmission over the internet is 100% secure. We cannot
                  guarantee absolute security.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Your Rights</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Under UK GDPR and the Data Protection Act 2018, you have the right to:
                </p>
                <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                  <li><strong>Access</strong> — request a copy of the personal data we hold about you</li>
                  <li><strong>Rectification</strong> — request correction of inaccurate data</li>
                  <li><strong>Erasure</strong> — request deletion of your personal data (&quot;right to be forgotten&quot;)</li>
                  <li><strong>Restriction</strong> — request that we limit how we use your data</li>
                  <li><strong>Portability</strong> — receive your data in a structured, machine-readable format</li>
                  <li><strong>Objection</strong> — object to processing based on legitimate interests or direct marketing</li>
                </ul>
                <p className="text-gray-700 leading-relaxed">
                  To exercise any of these rights, contact us at privacy@yuumpy.com. We will respond
                  within 30 days.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Third-Party Links</h2>
                <p className="text-gray-700 leading-relaxed">
                  Our site may contain links to third-party websites. We are not responsible for the
                  privacy practices of those sites and encourage you to review their privacy policies
                  before providing any personal information.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Children&apos;s Privacy</h2>
                <p className="text-gray-700 leading-relaxed">
                  Our services are not directed to individuals under the age of 18. We do not knowingly
                  collect personal information from children. If you believe we have inadvertently
                  collected such information, please contact us immediately.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Changes to This Policy</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We may update this Privacy Policy from time to time. We will notify you of significant
                  changes by posting the new policy on this page and updating the &quot;Last updated&quot; date.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  Your continued use of the site after changes are posted constitutes your acceptance
                  of the updated policy.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Contact Us</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  If you have any questions about this Privacy Policy or how we handle your data,
                  please contact us:
                </p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700">
                    <strong>Email:</strong> privacy@yuumpy.com<br />
                    <strong>Address:</strong> Yuumpy Data Protection Team<br />
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
