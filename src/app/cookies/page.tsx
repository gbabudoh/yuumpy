import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Cookie Policy - Yuumpy',
  description: 'Learn how Yuumpy uses cookies and similar technologies on our site.',
};

export default function CookiePolicy() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-8">Cookie Policy</h1>

            <div className="prose prose-lg max-w-none">
              <p className="text-gray-600 mb-8">
                Last updated: {new Date().toLocaleDateString()}
              </p>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. What Are Cookies</h2>
                <p className="text-gray-700 leading-relaxed">
                  Cookies are small text files stored on your device when you visit a website. They
                  help the site remember information about your visit, such as your preferred language
                  and other settings, which can make your next visit easier and the site more useful
                  to you.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. How We Use Cookies</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Yuumpy uses cookies and similar technologies for the following purposes:
                </p>
                <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                  <li><strong>Essential cookies</strong> — required for core functionality such as keeping you signed in, remembering your cart, and processing checkout securely. The site cannot function properly without these.</li>
                  <li><strong>Analytics cookies</strong> — help us understand how visitors use the site (Google Analytics) so we can improve performance and content.</li>
                  <li><strong>Preference cookies</strong> — remember your settings and choices, such as recently viewed items.</li>
                  <li><strong>Payment cookies</strong> — set by our payment processor, Stripe, to securely process transactions and prevent fraud.</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Types of Cookies We Use</h2>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Session Cookies</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Temporary cookies that are erased when you close your browser. These keep you logged
                  in and your cart intact as you browse the site.
                </p>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Persistent Cookies</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Remain on your device for a set period or until you delete them. These remember your
                  preferences across visits.
                </p>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Third-Party Cookies</h3>
                <p className="text-gray-700 leading-relaxed">
                  Set by services we use, such as Google Analytics and Stripe. We do not control these
                  cookies directly — please refer to the relevant provider&apos;s own cookie policy for
                  details.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Managing Cookies</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Most web browsers allow you to control cookies through their settings. You can usually
                  find these settings in the &quot;options&quot; or &quot;preferences&quot; menu of your browser. You can
                  choose to block or delete cookies, but please note that disabling essential cookies
                  may prevent parts of the site — such as checkout — from working correctly.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  To find out more about cookies, including how to see what cookies have been set,
                  visit{' '}
                  <a href="https://www.aboutcookies.org" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">
                    aboutcookies.org
                  </a>.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Changes to This Policy</h2>
                <p className="text-gray-700 leading-relaxed">
                  We may update this Cookie Policy from time to time to reflect changes in technology,
                  law, or our business practices. Any changes will be posted on this page with an
                  updated revision date.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Contact Us</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  If you have any questions about our use of cookies, please contact us:
                </p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700">
                    <strong>Email:</strong> privacy@yuumpy.com
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
