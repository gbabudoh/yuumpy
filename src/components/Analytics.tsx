'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Script from 'next/script';
import { pageview, trackMatomoPageView } from '@/lib/analytics';
import { useCookieConsent } from '@/hooks/useCookieConsent';

export default function Analytics() {
  const pathname = usePathname();
  const { canUseAnalytics, isLoading } = useCookieConsent();

  useEffect(() => {
    if (pathname && !isLoading && canUseAnalytics()) {
      // Track page view in Google Analytics
      pageview(pathname);
      
      // Track page view in Matomo
      trackMatomoPageView(pathname, document.title);
    }
  }, [pathname, isLoading, canUseAnalytics]);

  // Only load analytics scripts if user has consented
  if (isLoading || !canUseAnalytics()) {
    return null;
  }

  return (
    <>
      {/* Google Analytics */}
      {process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID && (
        <>
          <Script
            strategy="afterInteractive"
            src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID}`}
          />
          <Script
            id="google-analytics"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID}', {
                  page_path: window.location.pathname,
                  analytics_storage: 'granted',
                  ad_storage: 'granted' });
              ` }}
          />
        </>
      )}

      {/* Matomo Analytics */}
      {process.env.NEXT_PUBLIC_MATOMO_URL && (
        <Script
          id="matomo-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              var _paq = window._paq = window._paq || [];
              _paq.push(['setConsentGiven']);
              _paq.push(['trackPageView']);
              _paq.push(['enableLinkTracking']);
              (function() {
                var u="${process.env.NEXT_PUBLIC_MATOMO_URL}";
                _paq.push(['setTrackerUrl', u+'matomo.php']);
                _paq.push(['setSiteId', '${process.env.NEXT_PUBLIC_MATOMO_SITE_ID}']);
                var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
                g.async=true; g.src=u+'matomo.js'; s.parentNode.insertBefore(g,s);
              })();
            ` }}
        />
      )}
    </>
  );
}
