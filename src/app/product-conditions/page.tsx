import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Metadata } from 'next';
import { CheckCircle, RefreshCw, Package } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Product Conditions Explained - Yuumpy',
  description: 'Learn about the different product conditions available on Yuumpy: New, Refurbished, and Used products.',
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
            At Yuumpy, we offer products in three different conditions to give you more choices 
            and help you find the best value for your needs. Here&apos;s what each condition means:
          </p>

          {/* New Products */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8 mb-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Package className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">
                  New
                </h2>
                <div className="space-y-3 text-gray-600">
                  <p>
                    <strong>Brand new, unused products</strong> in their original manufacturer packaging. 
                    These items have never been opened, used, or handled beyond what&apos;s necessary for inspection.
                  </p>
                  <h3 className="font-semibold text-gray-900 mt-4">What to expect:</h3>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Original sealed packaging (where applicable)</li>
                    <li>All original accessories and documentation included</li>
                    <li>Full manufacturer warranty</li>
                    <li>No signs of previous use or handling</li>
                    <li>Latest product version/model</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Refurbished Products */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8 mb-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <RefreshCw className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">
                  Refurbished
                </h2>
                <div className="space-y-3 text-gray-600">
                  <p>
                    <strong>Professionally restored products</strong> that have been inspected, tested, 
                    and certified to work like new. These may be customer returns, display models, 
                    or products with minor cosmetic imperfections that have been fully restored.
                  </p>
                  <h3 className="font-semibold text-gray-900 mt-4">What to expect:</h3>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Thoroughly tested and certified to work properly</li>
                    <li>Any defective parts replaced with new components</li>
                    <li>Cleaned and sanitized</li>
                    <li>May have minor cosmetic imperfections (scratches, scuffs)</li>
                    <li>Includes warranty (duration varies by seller)</li>
                    <li>Significant savings compared to new products</li>
                    <li>May come in non-original packaging</li>
                  </ul>
                  <div className="bg-blue-50 p-4 rounded-lg mt-4">
                    <p className="text-sm text-blue-800">
                      <strong>Tip:</strong> Refurbished products are an excellent choice for getting 
                      premium products at a lower price while still having warranty protection.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Used Products */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8 mb-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-amber-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">
                  Used
                </h2>
                <div className="space-y-3 text-gray-600">
                  <p>
                    <strong>Previously owned products</strong> that are still in working condition. 
                    These items have been used by a previous owner and may show visible signs of wear.
                  </p>
                  <h3 className="font-semibold text-gray-900 mt-4">What to expect:</h3>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Fully functional and tested</li>
                    <li>Visible signs of previous use (scratches, wear marks, etc.)</li>
                    <li>May not include original packaging or all accessories</li>
                    <li>Usually no manufacturer warranty (seller warranty may apply)</li>
                    <li>Best value for budget-conscious buyers</li>
                    <li>Condition details provided in product description</li>
                  </ul>
                  <div className="bg-amber-50 p-4 rounded-lg mt-4">
                    <p className="text-sm text-amber-800">
                      <strong>Note:</strong> Always check the product description carefully for 
                      specific condition details and photos when buying used products.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Comparison Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8 mt-8">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-6">
              Quick Comparison
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="py-3 px-4 font-semibold text-gray-900">Feature</th>
                    <th className="py-3 px-4 font-semibold text-green-600">New</th>
                    <th className="py-3 px-4 font-semibold text-blue-600">Refurbished</th>
                    <th className="py-3 px-4 font-semibold text-amber-600">Used</th>
                  </tr>
                </thead>
                <tbody className="text-gray-600">
                  <tr className="border-b border-gray-100">
                    <td className="py-3 px-4 font-medium">Condition</td>
                    <td className="py-3 px-4">Perfect</td>
                    <td className="py-3 px-4">Like New</td>
                    <td className="py-3 px-4">Good/Fair</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-3 px-4 font-medium">Packaging</td>
                    <td className="py-3 px-4">Original</td>
                    <td className="py-3 px-4">May vary</td>
                    <td className="py-3 px-4">May vary</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-3 px-4 font-medium">Warranty</td>
                    <td className="py-3 px-4">Full manufacturer</td>
                    <td className="py-3 px-4">Seller warranty</td>
                    <td className="py-3 px-4">Limited/None</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-3 px-4 font-medium">Price</td>
                    <td className="py-3 px-4">Full price</td>
                    <td className="py-3 px-4">15-40% off</td>
                    <td className="py-3 px-4">40-70% off</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-medium">Best for</td>
                    <td className="py-3 px-4">Latest features, gifts</td>
                    <td className="py-3 px-4">Value seekers</td>
                    <td className="py-3 px-4">Budget buyers</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mt-8">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-6">
              Frequently Asked Questions
            </h2>
            
            <div className="space-y-4">
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Are refurbished products reliable?
                </h3>
                <p className="text-gray-600">
                  Yes! Refurbished products go through rigorous testing and quality checks. 
                  They often come with a warranty and can be just as reliable as new products.
                </p>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Can I return a used or refurbished product?
                </h3>
                <p className="text-gray-600">
                  Return policies vary by seller. Please check the specific product listing 
                  or contact the seller for their return policy before purchasing.
                </p>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
                <h3 className="font-semibold text-gray-900 mb-2">
                  How do I know the exact condition of a product?
                </h3>
                <p className="text-gray-600">
                  Each product listing includes detailed condition information in the description. 
                  Look for specific notes about any cosmetic imperfections or included accessories.
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
