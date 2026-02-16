'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/hooks/useCart';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { TrashIcon, PlusIcon, MinusIcon, ShoppingBagIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, cartTotal, cartCount } = useCart();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex items-center space-x-2 mb-8">
          <Link href="/products" className="text-purple-600 hover:text-purple-700 flex items-center cursor-pointer">
            <ArrowLeftIcon className="w-4 h-4 mr-1" />
            <span>Continue Shopping</span>
          </Link>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-8 flex items-center">
          <ShoppingBagIcon className="w-8 h-8 mr-3 text-purple-600" />
          Your Shopping Cart
        </h1>

        {cart.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBagIcon className="w-10 h-10 text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-500 mb-8">Looks like you haven&apos;t added anything to your cart yet.</p>
            <Link 
              href="/products"
              className="inline-block bg-purple-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-purple-700 transition-colors cursor-pointer"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="lg:grid lg:grid-cols-12 lg:gap-8">
            {/* Cart Items List */}
            <div className="lg:col-span-8">
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
                <ul className="divide-y divide-gray-100">
                  {cart.map((item) => (
                    <li key={item.id} className="p-6 flex items-center sm:items-start space-x-6">
                      <div className="relative w-24 h-24 flex-shrink-0 bg-gray-100 rounded-xl overflow-hidden">
                        <Image
                          src={item.image_url}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      
                      <div className="flex-grow min-w-0">
                        <div className="flex justify-between items-start">
                          <div>
                            <Link href={`/products/${item.slug}`} className="text-lg font-semibold text-gray-900 hover:text-purple-600 transition-colors line-clamp-1 cursor-pointer">
                              {item.name}
                            </Link>
                            <p className="text-purple-600 font-bold mt-1">£{item.price.toFixed(2)}</p>
                          </div>
                          <button 
                            onClick={() => removeFromCart(item.id)}
                            className="text-gray-400 hover:text-red-500 transition-colors p-2 cursor-pointer"
                            title="Remove item"
                          >
                            <TrashIcon className="w-5 h-5" />
                          </button>
                        </div>
                        
                        <div className="mt-4 flex items-center justify-between">
                          <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                            <button 
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="p-2 hover:bg-gray-50 text-gray-600 transition-colors cursor-pointer"
                            >
                              <MinusIcon className="w-4 h-4" />
                            </button>
                            <span className="px-4 py-2 text-gray-900 font-medium border-x border-gray-200 min-w-[3rem] text-center">
                              {item.quantity}
                            </span>
                            <button 
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="p-2 hover:bg-gray-50 text-gray-600 transition-colors cursor-pointer"
                            >
                              <PlusIcon className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-500">Subtotal</p>
                            <p className="text-lg font-bold text-gray-900">£{(item.price * item.quantity).toFixed(2)}</p>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-4 mt-8 lg:mt-0">
              <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 sticky top-24">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h3>
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal ({cartCount} items)</span>
                    <span>£{cartTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span className="text-green-600 font-medium">Free</span>
                  </div>
                  <div className="border-t border-gray-100 pt-4 flex justify-between">
                    <span className="text-lg font-bold text-gray-900">Total</span>
                    <span className="text-2xl font-black text-purple-600">£{cartTotal.toFixed(2)}</span>
                  </div>
                </div>

                <Link
                  href="/checkout"
                  className="w-full bg-purple-600 text-white py-4 rounded-xl font-bold text-center block hover:bg-purple-700 transition-all shadow-lg shadow-purple-200 transform hover:-translate-y-1 mb-4 cursor-pointer"
                >
                  Proceed to Checkout
                </Link>
                
                <p className="text-center text-xs text-gray-400 px-4">
                  By proceeding to checkout, you agree to our Terms of Service and Privacy Policy.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
