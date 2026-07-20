'use client';

import { useState } from 'react';
import { X, Settings, Shield, BarChart3, Target, Check } from 'lucide-react';
import { useCookieConsent, CookiePreferences } from '@/hooks/useCookieConsent';

interface CookieBannerProps {
  onAccept?: (preferences: CookiePreferences) => void;
  onReject?: () => void;
}

export default function CookieBanner({ onAccept, onReject }: CookieBannerProps) {
  const { hasConsent, isLoading, updatePreferences: commitConsent } = useCookieConsent();
  const [dismissed, setDismissed] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  // Draft preferences for the settings panel — only written to the shared
  // consent state (and localStorage) once the user actually confirms a
  // choice via Accept All / Reject All / Save Preferences below.
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true, // Always true, can't be disabled
    analytics: false,
    marketing: false,
    functional: false });

  const handleAcceptAll = () => {
    const allAccepted = {
      necessary: true,
      analytics: true,
      marketing: true,
      functional: true };

    commitConsent(allAccepted);
    onAccept?.(allAccepted);
    initializeAnalytics();
  };

  const handleRejectAll = () => {
    const onlyNecessary = {
      necessary: true,
      analytics: false,
      marketing: false,
      functional: false };

    commitConsent(onlyNecessary);
    onReject?.();
  };

  const handleSavePreferences = () => {
    commitConsent(preferences);
    onAccept?.(preferences);

    if (preferences.analytics) {
      initializeAnalytics();
    }
  };

  const initializeAnalytics = () => {
    // Belt-and-suspenders consent-mode update for Google's own consent API —
    // the actual activation now comes from the shared context state change
    // above causing Analytics.tsx to render the GA/Matomo scripts for the
    // first time, not from this call (window.gtag may not exist yet here).
    if (typeof window !== 'undefined' && window.gtag) {
      (window as any).gtag('consent', 'update', {
        analytics_storage: 'granted',
        ad_storage: 'granted' });
    }

    if (typeof window !== 'undefined' && window._paq) {
      window._paq.push(['setConsentGiven']);
    }
  };

  const updatePreference = (key: keyof CookiePreferences, value: boolean) => {
    if (key === 'necessary') return; // Can't change necessary cookies
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  if (isLoading || hasConsent || dismissed) return null;

  return (
    <>
      {/* Cookie Banner */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
            {!showSettings ? (
              // Main Banner View
              <div className="p-6 md:p-8">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <Shield className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">We value your privacy</h2>
                      <p className="text-sm text-gray-600">Choose how we use cookies to improve your experience</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setDismissed(true)}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="mb-6">
                  <p className="text-gray-700 leading-relaxed mb-4">
                    We use cookies to enhance your browsing experience, serve personalized content, 
                    and analyze our traffic. By clicking "Accept All", you consent to our use of cookies.
                  </p>
                  
                  <div className="flex flex-wrap gap-2 text-sm">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full">Necessary</span>
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full">Analytics</span>
                    <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full">Marketing</span>
                    <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full">Functional</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleAcceptAll}
                    className="flex-1 text-white px-6 py-3 rounded-xl font-semibold transition-colors cursor-pointer hover:bg-purple-700"
                    style={{ backgroundColor: '#8827ee' }}
                  >
                    Accept All
                  </button>
                  <button
                    onClick={handleRejectAll}
                    className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-colors cursor-pointer"
                  >
                    Reject All
                  </button>
                  <button
                    onClick={() => setShowSettings(true)}
                    className="flex-1 bg-white border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:border-gray-400 transition-colors cursor-pointer flex items-center justify-center space-x-2"
                  >
                    <Settings className="w-4 h-4" />
                    <span>Customize</span>
                  </button>
                </div>

                <div className="mt-4 text-center">
                  <a
                    href="/privacy-policy"
                    className="text-sm text-blue-600 hover:text-blue-700 underline"
                  >
                    Learn more in our Privacy Policy
                  </a>
                </div>
              </div>
            ) : (
              // Settings View
              <div className="p-6 md:p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                      <Settings className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">Cookie Preferences</h2>
                      <p className="text-sm text-gray-600">Customize your cookie settings</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowSettings(false)}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-6 mb-8">
                  {/* Necessary Cookies */}
                  <div className="border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Shield className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">Necessary Cookies</h3>
                          <p className="text-sm text-gray-600">Essential for website functionality</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Check className="w-5 h-5 text-green-600" />
                        <span className="text-sm text-green-600 font-medium">Always Active</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700">
                      These cookies are essential for the website to function properly. They enable basic 
                      features like page navigation, access to secure areas, and form submissions.
                    </p>
                  </div>

                  {/* Analytics Cookies */}
                  <div className="border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                          <BarChart3 className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">Analytics Cookies</h3>
                          <p className="text-sm text-gray-600">Help us understand website usage</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={preferences.analytics}
                          onChange={(e) => updatePreference('analytics', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all" data-checked-bg="#8827ee"></div>
                      </label>
                    </div>
                    <p className="text-sm text-gray-700">
                      These cookies help us understand how visitors interact with our website by collecting 
                      and reporting information anonymously. This includes Google Analytics and Matomo.
                    </p>
                  </div>

                  {/* Marketing Cookies */}
                  <div className="border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                          <Target className="w-4 h-4 text-purple-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">Marketing Cookies</h3>
                          <p className="text-sm text-gray-600">Used for personalized advertising</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={preferences.marketing}
                          onChange={(e) => updatePreference('marketing', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all" data-checked-bg="#8827ee"></div>
                      </label>
                    </div>
                    <p className="text-sm text-gray-700">
                      These cookies are used to track visitors across websites to display relevant and 
                      engaging advertisements for individual users.
                    </p>
                  </div>

                  {/* Functional Cookies */}
                  <div className="border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                          <Settings className="w-4 h-4 text-orange-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">Functional Cookies</h3>
                          <p className="text-sm text-gray-600">Enable enhanced features</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={preferences.functional}
                          onChange={(e) => updatePreference('functional', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all" data-checked-bg="#8827ee"></div>
                      </label>
                    </div>
                    <p className="text-sm text-gray-700">
                      These cookies enable enhanced functionality and personalization, such as remembering 
                      your preferences and settings.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleSavePreferences}
                    className="flex-1 text-white px-6 py-3 rounded-xl font-semibold transition-colors cursor-pointer hover:bg-purple-700"
                    style={{ backgroundColor: '#8827ee' }}
                  >
                    Save Preferences
                  </button>
                  <button
                    onClick={() => setShowSettings(false)}
                    className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-colors cursor-pointer"
                  >
                    Back
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
