'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
}

interface CookieConsentContextValue {
  preferences: CookiePreferences;
  hasConsent: boolean;
  isLoading: boolean;
  updatePreferences: (preferences: CookiePreferences) => void;
  clearConsent: () => void;
  canUseAnalytics: () => boolean;
  canUseMarketing: () => boolean;
  canUseFunctional: () => boolean;
}

const DEFAULT_PREFERENCES: CookiePreferences = {
  necessary: true,
  analytics: false,
  marketing: false,
  functional: false,
};

const CookieConsentContext = createContext<CookieConsentContextValue | null>(null);

// Single shared instance of consent state — components like Analytics and
// CookieBanner previously each held their own independent copy, so accepting
// cookies in the banner never actually told Analytics (already mounted in
// the root layout) that anything had changed.
export function CookieConsentProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<CookiePreferences>(DEFAULT_PREFERENCES);
  const [hasConsent, setHasConsent] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
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
    setPreferences(DEFAULT_PREFERENCES);
  };

  const canUseAnalytics = () => hasConsent && preferences.analytics;
  const canUseMarketing = () => hasConsent && preferences.marketing;
  const canUseFunctional = () => hasConsent && preferences.functional;

  return (
    <CookieConsentContext.Provider
      value={{
        preferences,
        hasConsent,
        isLoading,
        updatePreferences,
        clearConsent,
        canUseAnalytics,
        canUseMarketing,
        canUseFunctional,
      }}
    >
      {children}
    </CookieConsentContext.Provider>
  );
}

export function useCookieConsent() {
  const context = useContext(CookieConsentContext);
  if (!context) {
    throw new Error('useCookieConsent must be used within a CookieConsentProvider');
  }
  return context;
}
