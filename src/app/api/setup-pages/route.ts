import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    // Create pages table
    await query(`
      CREATE TABLE IF NOT EXISTS pages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        content TEXT NOT NULL,
        meta_title VARCHAR(255),
        meta_description TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_slug (slug),
        INDEX idx_active (is_active)
      )
    `);

    // Insert default pages with current content
    const defaultPages = [
      {
        title: 'About Yuumpy',
        slug: 'about',
        content: `
          <div class="text-center mb-16">
            <h1 class="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              About Yuumpy
            </h1>
            <p class="text-xl text-gray-600 max-w-3xl mx-auto">
              Your trusted affiliate marketplace connecting you with amazing products and earning opportunities
            </p>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <h2 class="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
              <p class="text-lg text-gray-600 mb-6">
                At Yuumpy, we believe in creating a seamless bridge between consumers and quality products. 
                Our platform curates the best deals, offers, and products from trusted brands, making it 
                easy for you to discover and purchase exactly what you need.
              </p>
              <p class="text-lg text-gray-600">
                We're committed to providing a transparent, user-friendly experience that benefits both 
                consumers and our affiliate partners, creating a win-win ecosystem for everyone involved.
              </p>
            </div>
            <div class="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
              <h3 class="text-2xl font-bold mb-4">Why Choose Yuumpy?</h3>
              <ul class="space-y-3">
                <li class="flex items-center">
                  <span class="w-2 h-2 bg-green-300 rounded-full mr-3"></span>
                  <span>Curated Quality Products</span>
                </li>
                <li class="flex items-center">
                  <span class="w-2 h-2 bg-green-300 rounded-full mr-3"></span>
                  <span>Best Price Guarantee</span>
                </li>
                <li class="flex items-center">
                  <span class="w-2 h-2 bg-green-300 rounded-full mr-3"></span>
                  <span>Secure Affiliate Links</span>
                </li>
                <li class="flex items-center">
                  <span class="w-2 h-2 bg-green-300 rounded-full mr-3"></span>
                  <span>Trusted Brand Partnerships</span>
                </li>
              </ul>
            </div>
          </div>

          <div class="text-center">
            <h2 class="text-3xl font-bold text-gray-900 mb-6">Get in Touch</h2>
            <p class="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Have questions about our platform or need help finding the perfect product? 
              We're here to help you make the best choices.
            </p>
            <div class="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="mailto:contact@yuumpy.com"
                class="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Contact Us
              </a>
              <a 
                href="/products"
                class="border-2 border-blue-600 text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-600 hover:text-white transition-colors"
              >
                Browse Products
              </a>
            </div>
          </div>
        `,
        meta_title: 'About Yuumpy - Your Premier Affiliate Marketplace',
        meta_description: 'Your trusted affiliate marketplace connecting you with amazing products and earning opportunities'
      },
      {
        title: 'Banner Advertising',
        slug: 'advert',
        content: `
          <section class="bg-gradient-to-r from-blue-600 to-purple-600 py-16 -mx-4 mb-16">
            <div class="container mx-auto px-4 text-center">
              <h1 class="text-4xl md:text-5xl font-bold text-white mb-4">
                Banner Advertising
              </h1>
              <p class="text-xl text-blue-100 max-w-2xl mx-auto">
                Promote your products with our premium banner advertising options. Reach thousands of potential customers daily.
              </p>
            </div>
          </section>

          <section class="py-16 bg-white -mx-4">
            <div class="container mx-auto px-4">
              <div class="text-center mb-12">
                <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  Banner Advertising Options
                </h2>
                <p class="text-gray-600 text-lg">
                  Promote your products with our premium banner advertising
                </p>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                <div class="border-2 border-gray-200 rounded-xl p-8 hover:border-red-500 transition-colors">
                  <div class="text-center">
                    <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span class="text-2xl">📅</span>
                    </div>
                    <h3 class="text-xl font-semibold text-gray-900 mb-2">Top Position</h3>
                    <div class="text-3xl font-bold text-gray-900 mb-4">£50/week</div>
                    <p class="text-gray-600 mb-6">Premium placement at the top of the page for maximum visibility</p>
                    <ul class="text-sm text-gray-600 space-y-2 mb-6">
                      <li>• Highest visibility</li>
                      <li>• First thing users see</li>
                      <li>• Premium placement</li>
                      <li>• Maximum click-through rate</li>
                    </ul>
                    <button class="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors">
                      Choose Top Position
                    </button>
                  </div>
                </div>

                <div class="border-2 border-gray-200 rounded-xl p-8 hover:border-yellow-500 transition-colors">
                  <div class="text-center">
                    <div class="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span class="text-2xl">📅</span>
                    </div>
                    <h3 class="text-xl font-semibold text-gray-900 mb-2">Middle Position</h3>
                    <div class="text-3xl font-bold text-gray-900 mb-4">£35/week</div>
                    <p class="text-gray-600 mb-6">Balanced placement in the middle section for good visibility</p>
                    <ul class="text-sm text-gray-600 space-y-2 mb-6">
                      <li>• Good visibility</li>
                      <li>• Balanced placement</li>
                      <li>• Cost-effective</li>
                      <li>• Good click-through rate</li>
                    </ul>
                    <button class="w-full bg-yellow-600 text-white py-3 rounded-lg font-semibold hover:bg-yellow-700 transition-colors">
                      Choose Middle Position
                    </button>
                  </div>
                </div>

                <div class="border-2 border-gray-200 rounded-xl p-8 hover:border-green-500 transition-colors">
                  <div class="text-center">
                    <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span class="text-2xl">📅</span>
                    </div>
                    <h3 class="text-xl font-semibold text-gray-900 mb-2">Bottom Position</h3>
                    <div class="text-3xl font-bold text-gray-900 mb-4">£25/week</div>
                    <p class="text-gray-600 mb-6">Budget-friendly placement at the bottom of the page</p>
                    <ul class="text-sm text-gray-600 space-y-2 mb-6">
                      <li>• Budget-friendly</li>
                      <li>• Still visible</li>
                      <li>• Great value</li>
                      <li>• Good for testing</li>
                    </ul>
                    <button class="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors">
                      Choose Bottom Position
                    </button>
                  </div>
                </div>
              </div>

              <div class="text-center mt-16">
                <h2 class="text-3xl font-bold text-gray-900 mb-6">Get Started Today</h2>
                <p class="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                  Ready to promote your products to our engaged audience? Contact us to discuss your advertising needs.
                </p>
                <button class="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors">
                  Contact Yuumpy
                </button>
              </div>
            </div>
          </section>
        `,
        meta_title: 'Advertise With Yuumpy - Premium Banner Advertising',
        meta_description: 'Promote your products with our premium banner advertising options. Reach thousands of potential customers daily.'
      }
    ];

    // Insert default pages if they don't exist
    for (const page of defaultPages) {
      const existing = await query(
        'SELECT id FROM pages WHERE slug = ?',
        [page.slug]
      );

      if ((existing as any[]).length === 0) {
        await query(
          'INSERT INTO pages (title, slug, content, meta_title, meta_description) VALUES (?, ?, ?, ?, ?)',
          [page.title, page.slug, page.content, page.meta_title, page.meta_description]
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Pages table created and default pages inserted successfully'
    });
  } catch (error) {
    console.error('Error setting up pages:', error);
    return NextResponse.json(
      { error: 'Failed to setup pages table' },
      { status: 500 }
    );
  }
}