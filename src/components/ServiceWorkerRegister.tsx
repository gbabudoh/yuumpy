'use client';

import { useEffect } from 'react';

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    // Dev-mode static chunk URLs aren't content-hashed the way production
    // bundles are, so a cache-first service worker can serve a stale JS
    // bundle after a rebuild. Only register outside development, and
    // actively tear down any worker + cache left over from earlier dev
    // testing so it can't keep serving stale bundles.
    if (process.env.NODE_ENV === 'production') {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    } else {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((registration) => registration.unregister());
      });
      if ('caches' in window) {
        caches.keys().then((keys) => {
          keys.filter((key) => key.startsWith('yuumpy-static-')).forEach((key) => caches.delete(key));
        });
      }
    }
  }, []);

  return null;
}
