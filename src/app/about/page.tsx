import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface PageContent {
  id: string;
  title: string;
  slug: string;
  content: string;
  meta_title?: string;
  meta_description?: string;
}

async function getPageContent(slug: string): Promise<PageContent | null> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/pages?slug=${slug}`, {
      cache: 'no-store'
    });
    if (response.ok) {
      const data = await response.json();
      return data && data.id ? data : null; // Only return if we have actual data
    }
  } catch (error) {
    console.error('Error fetching page content:', error);
  }
  return null;
}

export async function generateMetadata() {
  const pageContent = await getPageContent('about');
  
  return {
    title: pageContent?.meta_title || 'About Us - Yuumpy',
    description: pageContent?.meta_description || 'Learn about Yuumpy, your trusted affiliate marketplace platform.' };
}

export default async function AboutPage() {
  let pageContent = null;
  
  try {
    pageContent = await getPageContent('about');
  } catch (error) {
    // If API fails, just use original content
    pageContent = null;
  }
  // If no database content, show original content
  if (!pageContent) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        
        <div className="container mx-auto px-4 py-16">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              About Yuumpy
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Your trusted affiliate marketplace connecting you with amazing products and earning opportunities
            </p>
          </div>

          {/* Mission Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
              <p className="text-lg text-gray-600 mb-6">
                At Yuumpy, we believe in creating a seamless bridge between consumers and quality products. 
                Our platform curates the best deals, offers, and products from trusted brands, making it 
                easy for you to discover and purchase exactly what you need.
              </p>
              <p className="text-lg text-gray-600">
                We're committed to providing a transparent, user-friendly experience that benefits both 
                consumers and our affiliate partners, creating a win-win ecosystem for everyone involved.
              </p>
            </div>
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
              <h3 className="text-2xl font-bold mb-4">Why Choose Yuumpy?</h3>
              <ul className="space-y-3">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-300 rounded-full mr-3"></span>
                  <span>Curated Quality Products</span>
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-300 rounded-full mr-3"></span>
                  <span>Best Price Guarantee</span>
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-300 rounded-full mr-3"></span>
                  <span>Secure Affiliate Links</span>
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-300 rounded-full mr-3"></span>
                  <span>Trusted Brand Partnerships</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Contact Section */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Get in Touch</h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Have questions about our platform or need help finding the perfect product? 
              We're here to help you make the best choices.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="mailto:contact@yuumpy.com"
                className="text-white px-8 py-3 rounded-lg font-semibold transition-colors hover:bg-purple-700"
                style={{ backgroundColor: '#8827ee' }}
              >
                Contact Us
              </a>
              <a 
                href="/products"
                className="border-2 px-8 py-3 rounded-lg font-semibold transition-colors hover:bg-purple-600 hover:text-white"
                style={{ borderColor: '#8827ee', color: '#8827ee' }}
              >
                Browse Products
              </a>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    );
  }

  // Show database content if available
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-16">
        <div 
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: pageContent.content }}
        />
      </div>

      <Footer />
    </div>
  );
}
