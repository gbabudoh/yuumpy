'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Shield, CreditCard, Lock, User, ShoppingBag, Trash2 } from 'lucide-react';

import { useCart } from '@/hooks/useCart'; 
import Footer from '@/components/Footer';

interface CheckoutForm {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  county: string;
  postcode: string;
  country: string;
  customerNotes: string;
  createAccount: boolean;
  password: string;
  loginPassword: string;
}

interface Address {
  id: number;
  customer_id: number;
  address_type: 'billing' | 'shipping';
  first_name: string;
  last_name: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  county?: string;
  postcode: string;
  country: string;
  phone?: string;
  is_default: boolean;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, cartTotal, removeFromCart, clearCart } = useCart();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<CheckoutForm>({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    county: '',
    postcode: '',
    country: 'United Kingdom',
    customerNotes: '',
    createAccount: false,
    password: '',
    loginPassword: ''
  });

  // Existing account states
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loggingIn, setLoggingIn] = useState(false);

  useEffect(() => {
    // Check if cart is empty, redirect back to products if so
    if (cart.length === 0) {
      router.push('/products');
      return;
    }
    checkIfLoggedIn();
  }, [cart, router]);

  const checkIfLoggedIn = async () => {
    try {
      const response = await fetch('/api/customer/auth/me');
      if (response.ok) {
        const data = await response.json();
        const customer = data.customer;
        
        setIsLoggedIn(true);
        setFormData(prev => ({
          ...prev,
          email: customer.email || prev.email,
          firstName: customer.firstName || prev.firstName,
          lastName: customer.lastName || prev.lastName,
          phone: customer.phone || prev.phone
        }));

        // Fetch saved address
        const addressResponse = await fetch('/api/customer/addresses');
        if (addressResponse.ok) {
          const addressData = await addressResponse.json();
          if (addressData.addresses && addressData.addresses.length > 0) {
            const defaultAddress = addressData.addresses.find((a: Address) => a.is_default) || addressData.addresses[0];
            setFormData(prev => ({
              ...prev,
              addressLine1: defaultAddress.address_line1 || prev.addressLine1,
              addressLine2: defaultAddress.address_line2 || prev.addressLine2,
              city: defaultAddress.city || prev.city,
              county: defaultAddress.county || prev.county,
              postcode: defaultAddress.postcode || prev.postcode,
              country: defaultAddress.country || prev.country
            }));
          }
        }
      }
    } catch {
      // Continue as guest
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleEmailBlur = async () => {
    if (formData.email && !isLoggedIn && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setCheckingEmail(true);
      try {
        const response = await fetch(`/api/customer/check-email?email=${encodeURIComponent(formData.email)}`);
        const data = await response.json();
        if (data.exists) {
          setShowLoginForm(true);
        } else {
          setShowLoginForm(false);
        }
      } catch (err) {
        console.error('Error checking email:', err);
      } finally {
        setCheckingEmail(false);
      }
    }
  };

  const handleLogin = async () => {
    if (!formData.loginPassword) {
      setLoginError('Please enter your password');
      return;
    }

    setLoggingIn(true);
    setLoginError(null);

    try {
      const response = await fetch('/api/customer/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, password: formData.loginPassword })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Login failed');

      setIsLoggedIn(true);
      setShowLoginForm(false);
      checkIfLoggedIn(); // Refresh user data
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoggingIn(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (cart.length === 0) return;

    if (!formData.email || !formData.firstName || !formData.lastName || 
        !formData.addressLine1 || !formData.city || !formData.postcode) {
      setError('Please fill in all required fields');
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.map(item => ({ id: item.id, quantity: item.quantity })),
          ...formData
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to create order');

      if (data.checkoutUrl) {
        // Clear cart before redirecting to Stripe if it's a multi-item purchase
        // In a real app, you might only clear it after payment confirmation (webhook),
        // but for UX, clearing it here prevents items from staying in the cart if the user navigates back.
        clearCart();
        window.location.href = data.checkoutUrl;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setProcessing(false);
    }
  };

  if (cart.length === 0) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/cart" className="flex items-center text-gray-600 hover:text-gray-900 font-medium cursor-pointer">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Return to Cart
            </Link>
            <div className="hidden sm:flex items-center space-x-2 text-green-600">
              <Lock className="w-4 h-4" />
              <span className="text-sm font-semibold uppercase tracking-wider">Secure Checkout</span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Form Section */}
            <div className="lg:col-span-7">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Auth Check */}
                {!isLoggedIn && (
                  <div className="bg-purple-50 border border-purple-100 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center space-x-4">
                      <div className="bg-purple-100 p-3 rounded-full">
                        <User className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <h4 className="font-bold text-purple-900">Have an account?</h4>
                        <p className="text-sm text-purple-700">Log in for a faster checkout experience.</p>
                      </div>
                    </div>
                    <Link 
                      href="/account/login?redirect=/checkout"
                      className="bg-white text-purple-600 px-6 py-2 rounded-xl font-bold shadow-sm hover:shadow-md transition-all border border-purple-100 cursor-pointer"
                    >
                      Log In
                    </Link>
                  </div>
                )}

                {/* Contact & Shipping */}
                  <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 sm:p-8 space-y-8">
                    {/* Email */}
                    <section>
                      <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                        <span className="bg-purple-600 text-white w-7 h-7 rounded-full flex items-center justify-center text-sm mr-3">1</span>
                        Contact Information
                      </h2>
                      <div className="space-y-4">
                        <div className="relative">
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address *</label>
                          <input
                            type="email"
                            name="email"
                            required
                            value={formData.email}
                            onChange={handleInputChange}
                            onBlur={handleEmailBlur}
                            disabled={isLoggedIn}
                            className={`w-full px-4 py-3 rounded-xl border border-gray-400 focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none transition-all ${isLoggedIn ? 'bg-gray-50' : ''}`}
                            placeholder="you@example.com"
                          />
                          {checkingEmail && <div className="absolute right-4 top-11 animate-spin rounded-full h-4 w-4 border-2 border-purple-600 border-t-transparent"></div>}
                        </div>

                        {showLoginForm && !isLoggedIn && (
                          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 space-y-4">
                            <p className="text-sm text-blue-900 font-medium">We found your account! Please enter your password to continue.</p>
                            <input
                              type="password"
                              name="loginPassword"
                              value={formData.loginPassword}
                              onChange={handleInputChange}
                              className="w-full px-4 py-2 rounded-lg border border-blue-400 focus:ring-2 focus:ring-blue-500 outline-none"
                              placeholder="Your password"
                            />
                            {loginError && <p className="text-xs text-red-600 font-medium">{loginError}</p>}
                            <div className="flex gap-4">
                              <button type="button" onClick={handleLogin} disabled={loggingIn} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 disabled:opacity-50 cursor-pointer">
                                {loggingIn ? 'Logging in...' : 'Log In'}
                              </button>
                              <button type="button" onClick={() => setShowLoginForm(false)} className="text-sm text-blue-600 font-medium hover:underline cursor-pointer">Continue as guest</button>
                            </div>
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">First Name *</label>
                            <input type="text" name="firstName" required value={formData.firstName} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-gray-400 focus:ring-2 focus:ring-purple-600 outline-none" />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Last Name *</label>
                            <input type="text" name="lastName" required value={formData.lastName} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-gray-400 focus:ring-2 focus:ring-purple-600 outline-none" />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                          <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-gray-400 focus:ring-2 focus:ring-purple-600 outline-none" placeholder="+44 7XXX XXXXXX" />
                        </div>
                      </div>
                    </section>

                    <hr className="border-gray-100" />

                    {/* Shipping */}
                    <section>
                      <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                        <span className="bg-purple-600 text-white w-7 h-7 rounded-full flex items-center justify-center text-sm mr-3">2</span>
                        Shipping Address
                      </h2>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Address Line 1 *</label>
                          <input type="text" name="addressLine1" required value={formData.addressLine1} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-gray-400 focus:ring-2 focus:ring-purple-600 outline-none" placeholder="House number and street" />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Address Line 2</label>
                          <input type="text" name="addressLine2" value={formData.addressLine2} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-gray-400 focus:ring-2 focus:ring-purple-600 outline-none" placeholder="Apartment, suite, etc. (optional)" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">City *</label>
                            <input type="text" name="city" required value={formData.city} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-gray-400 focus:ring-2 focus:ring-purple-600 outline-none" />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Postcode *</label>
                            <input type="text" name="postcode" required value={formData.postcode} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-gray-400 focus:ring-2 focus:ring-purple-600 outline-none" placeholder="SW1A 1AA" />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Country</label>
                          <select name="country" value={formData.country} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-gray-400 focus:ring-2 focus:ring-purple-600 outline-none bg-white">
                            <option value="United Kingdom">United Kingdom</option>
                            <option value="Republic of Ireland">Republic of Ireland</option>
                            <option value="United States">United States</option>
                            <option value="Canada">Canada</option>
                            <optgroup label="European Union">
                              <option value="Austria">Austria</option>
                              <option value="Belgium">Belgium</option>
                              <option value="Bulgaria">Bulgaria</option>
                              <option value="Croatia">Croatia</option>
                              <option value="Cyprus">Cyprus</option>
                              <option value="Czech Republic">Czech Republic</option>
                              <option value="Denmark">Denmark</option>
                              <option value="Estonia">Estonia</option>
                              <option value="Finland">Finland</option>
                              <option value="France">France</option>
                              <option value="Germany">Germany</option>
                              <option value="Greece">Greece</option>
                              <option value="Hungary">Hungary</option>
                              <option value="Italy">Italy</option>
                              <option value="Latvia">Latvia</option>
                              <option value="Lithuania">Lithuania</option>
                              <option value="Luxembourg">Luxembourg</option>
                              <option value="Malta">Malta</option>
                              <option value="Netherlands">Netherlands</option>
                              <option value="Poland">Poland</option>
                              <option value="Portugal">Portugal</option>
                              <option value="Romania">Romania</option>
                              <option value="Slovakia">Slovakia</option>
                              <option value="Slovenia">Slovenia</option>
                              <option value="Spain">Spain</option>
                              <option value="Sweden">Sweden</option>
                            </optgroup>
                          </select>
                        </div>
                      </div>
                    </section>

                    <hr className="border-gray-100" />

                    {/* Additional Options */}
                    <section>
                      <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                        <span className="bg-purple-600 text-white w-7 h-7 rounded-full flex items-center justify-center text-sm mr-3">3</span>
                        Additional Details
                      </h2>
                      <div className="space-y-4">
                        <textarea
                          name="customerNotes"
                          rows={3}
                          value={formData.customerNotes}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 rounded-xl border border-gray-400 focus:ring-2 focus:ring-purple-600 outline-none"
                          placeholder="Special instructions for delivery (optional)"
                        />
                        
                        {!isLoggedIn && (
                          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                            <label className="flex items-start space-x-3 cursor-pointer">
                              <input
                                type="checkbox"
                                name="createAccount"
                                checked={formData.createAccount}
                                onChange={handleInputChange}
                                className="mt-1 w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                              />
                              <div>
                                <span className="font-bold text-gray-900">Create an account?</span>
                                <p className="text-xs text-gray-500">Fast-track your future orders and track deliveries.</p>
                              </div>
                            </label>

                            {formData.createAccount && (
                              <div className="mt-4">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Password *</label>
                                <input
                                  type="password"
                                  name="password"
                                  required
                                  value={formData.password}
                                  onChange={handleInputChange}
                                  className="w-full px-4 py-3 rounded-xl border border-gray-400 focus:ring-2 focus:ring-purple-600 outline-none"
                                  placeholder="Min 8 characters"
                                />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </section>
                  </div>

                  {/* Submit Button (Mobile) */}
                  <div className="p-6 bg-gray-50 border-t border-gray-100 block lg:hidden">
                    <button
                      type="submit"
                      disabled={processing}
                      className="w-full bg-purple-600 text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-purple-100 hover:bg-purple-700 disabled:bg-gray-400 disabled:shadow-none transition-all transform active:scale-95 cursor-pointer"
                    >
                      {processing ? 'Processing...' : `Pay £${cartTotal.toFixed(2)}`}
                    </button>
                    {error && <p className="mt-3 text-red-600 text-sm font-bold text-center">{error}</p>}
                  </div>
                </div>
              </form>
            </div>

            {/* Sidebar Summary Section */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 sm:p-8 sticky top-28">
                <h3 className="text-2xl font-black text-gray-900 mb-8 flex items-center">
                  <ShoppingBag className="w-6 h-6 mr-3 text-purple-600" />
                  Order Summary
                </h3>

                <ul className="space-y-6 mb-8 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                  {cart.map((item) => (
                    <li key={item.id} className="flex items-center gap-4">
                      <div className="relative w-20 h-20 bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 flex-shrink-0">
                        <Image src={item.image_url} alt={item.name} fill className="object-cover" />
                        <span className="absolute top-1 right-1 bg-purple-600 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="flex-grow min-w-0">
                        <div className="flex justify-between items-start gap-2">
                          <h4 className="font-bold text-gray-900 line-clamp-2 leading-tight text-sm">{item.name}</h4>
                          <button 
                            type="button"
                            onClick={() => removeFromCart(item.id)}
                            className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0 cursor-pointer"
                            title="Remove item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-purple-600 font-black mt-1">£{(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    </li>
                  ))}
                </ul>
                

                <div className="space-y-4 pt-6 border-t border-gray-100">
                  <div className="flex justify-between text-gray-500 font-medium">
                    <span>Subtotal</span>
                    <span>£{cartTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-500 font-medium">
                    <span>Shipping</span>
                    <span className="text-green-600">Free</span>
                  </div>
                  <div className="flex justify-between items-center bg-purple-50 p-4 rounded-2xl">
                    <span className="font-black text-purple-900 text-lg">Total</span>
                    <span className="font-black text-purple-600 text-3xl">£{cartTotal.toFixed(2)}</span>
                  </div>
                </div>

                <div className="mt-8 hidden lg:block">
                  <button
                    onClick={(e) => { e.preventDefault(); (document.querySelector('form') as HTMLFormElement).requestSubmit(); }}
                    disabled={processing}
                    className="w-full bg-purple-600 text-white py-5 rounded-2xl font-black text-xl shadow-2xl shadow-purple-200 hover:bg-purple-700 disabled:bg-gray-400 disabled:shadow-none transition-all transform active:scale-95 flex items-center justify-center space-x-3 cursor-pointer"
                  >
                    {processing ? (
                      <div className="animate-spin rounded-full h-6 w-6 border-4 border-white border-t-transparent"></div>
                    ) : (
                      <>
                        <CreditCard className="w-6 h-6" />
                        <span>Pay Securely</span>
                      </>
                    )}
                  </button>
                  {error && <p className="mt-4 text-red-600 text-sm font-bold text-center bg-red-50 p-3 rounded-xl border border-red-100">{error}</p>}
                </div>

                <div className="mt-8">
                  <div className="flex items-center text-[10px] text-gray-400 font-bold uppercase tracking-widest bg-gray-50 p-3 rounded-xl justify-center">
                    <Shield className="w-3.5 h-3.5 mr-2 text-green-500" />
                    256-bit SSL Secure Payment
                  </div>
                  
                  <div className="flex items-center justify-center space-x-3">
                    <div className="bg-white px-3 py-2 rounded-xl border border-gray-200 shadow-sm flex items-center justify-center h-12 w-20 transition-all hover:border-purple-200 hover:shadow-md hover:scale-105 cursor-pointer relative">
                      <Image src="/icons/visa.png" alt="Visa" width={60} height={30} className="object-contain h-8 w-auto" />
                    </div>
                    <div className="bg-white px-3 py-2 rounded-xl border border-gray-200 shadow-sm flex items-center justify-center h-12 w-20 transition-all hover:border-purple-200 hover:shadow-md hover:scale-105 cursor-pointer relative">
                      <Image src="/icons/mastercard.png" alt="Mastercard" width={60} height={30} className="object-contain h-8 w-auto" />
                    </div>
                    <div className="bg-white px-3 py-2 rounded-xl border border-gray-200 shadow-sm flex items-center justify-center h-12 w-20 transition-all hover:border-purple-200 hover:shadow-md hover:scale-105 cursor-pointer relative">
                      <Image src="/icons/stripe.png" alt="Stripe" width={60} height={30} className="object-contain h-6 w-auto" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
