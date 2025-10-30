// Google Analytics integration
export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID;
export const MATOMO_URL = process.env.NEXT_PUBLIC_MATOMO_URL;
export const MATOMO_SITE_ID = process.env.NEXT_PUBLIC_MATOMO_SITE_ID;

// Track page views
export const pageview = (url: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', GA_TRACKING_ID!, {
      page_path: url });
  }
};

// Track events
export const event = ({
  action,
  category,
  label,
  value }: {
  action: string;
  category: string;
  label?: string;
  value?: number;
}) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value });
  }
};

// Track product views
export const trackProductView = (productId: number, productName: string) => {
  event({
    action: 'view_item',
    category: 'ecommerce',
    label: productName,
    value: productId });
};

// Track product clicks
export const trackProductClick = (productId: number, productName: string) => {
  event({
    action: 'click',
    category: 'product',
    label: productName,
    value: productId });
};

// Track banner ad clicks
export const trackBannerClick = (bannerId: number, bannerTitle: string) => {
  event({
    action: 'click',
    category: 'banner_ad',
    label: bannerTitle,
    value: bannerId });
};

// Matomo Analytics integration
export const trackMatomoEvent = async (
  eventType: string,
  productId?: number,
  categoryId?: number,
  metadata?: any
) => {
  if (typeof window === 'undefined') return;

  // Only track if Matomo is configured
  if (!process.env.NEXT_PUBLIC_MATOMO_URL || !process.env.NEXT_PUBLIC_MATOMO_SITE_ID) {
    return; // Silently skip if not configured
  }

  try {
    const response = await fetch('/api/analytics', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_type: eventType,
        product_id: productId,
        category_id: categoryId,
        user_ip: '', // Will be filled by server
        user_agent: navigator.userAgent,
        referrer: document.referrer,
        page_url: window.location.href,
        metadata }) });

    if (!response.ok) {
      // Silently fail - don't log errors for optional analytics
      return;
    }
  } catch (error) {
    // Silently fail - don't log errors for optional analytics
    return;
  }
};

// Enhanced Matomo tracking functions
export const trackMatomoPageView = (url: string, title?: string) => {
  if (typeof window !== 'undefined' && window._paq) {
    window._paq.push(['setCustomUrl', url]);
    if (title) {
      window._paq.push(['setDocumentTitle', title]);
    }
    window._paq.push(['trackPageView']);
  }
};

export const trackMatomoGoal = (goalId: number, revenue?: number) => {
  if (typeof window !== 'undefined' && window._paq) {
    if (revenue) {
      window._paq.push(['trackGoal', goalId, revenue]);
    } else {
      window._paq.push(['trackGoal', goalId]);
    }
  }
};

export const trackMatomoEcommerce = (orderId: string, revenue: number, items: any[]) => {
  if (typeof window !== 'undefined' && window._paq) {
    window._paq.push(['addEcommerceItem', orderId, items]);
    window._paq.push(['trackEcommerceOrder', orderId, revenue]);
  }
};

// Enhanced Google Analytics ecommerce tracking
export const trackPurchase = (transactionId: string, value: number, currency: string = 'GBP', items: any[]) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'purchase', {
      transaction_id: transactionId,
      value: value,
      currency: currency,
      items: items
    });
  }
};

// Track custom events for both platforms
export const trackCustomEvent = (eventName: string, parameters: any = {}) => {
  // Google Analytics
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, parameters);
  }
  
  // Matomo
  if (typeof window !== 'undefined' && window._paq) {
    window._paq.push(['trackEvent', eventName, parameters.category || 'Custom', parameters.label || '', parameters.value || 0]);
  }
};

// Declare gtag and _paq functions for TypeScript
declare global {
  interface Window {
    gtag: (
      command: 'config' | 'event',
      targetId: string,
      config?: any
    ) => void;
    _paq: any[];
  }
}
