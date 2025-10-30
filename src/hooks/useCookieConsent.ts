'use client';

import { useState, useEffect } from 'react';

export interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
}

export function useCookieConsent() {
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    analytics: false,
    marketing: false,
    functional: false });
  const [hasConsent, setHasConsent] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load saved preferences from localStorage
    const savedConsent = localStorage.getItem('cookie-consent');
    if (savedConsent) {
      try {
        const parsedPreferences = JSON.parse(savedConsent);
        setPreferences(parsedPreferences);
        setHasConsent(true);
      } catch (error) {
        console.error('Error parsing cookie consent:', error);
      }
    }
    setIsLoading(false);
  }, []);

  const updatePreferences = (newPreferences: CookiePreferences) => {
    setPreferences(newPreferences);
    localStorage.setItem('cookie-consent', JSON.stringify(newPreferences));
    localStorage.setItem('cookie-consent-date', new Date().toISOString());
    setHasConsent(true);
  };

  const clearConsent = () => {
    localStorage.removeItem('cookie-consent');
    localStorage.removeItem('cookie-consent-date');
    setHasConsent(false);
    setPreferences({
      necessary: true,
      analytics: false,
      marketing: false,
      functional: false });
  };

  const canUseAnalytics = () => {
    return hasConsent && preferences.analytics;
  };

  const canUseMarketing = () => {
    return hasConsent && preferences.marketing;
  };

  const canUseFunctional = () => {
    return hasConsent && preferences.functional;
  };

  return {
    preferences,
    hasConsent,
    isLoading,
    updatePreferences,
    clearConsent,
    canUseAnalytics,
    canUseMarketing,
    canUseFunctional };
}
