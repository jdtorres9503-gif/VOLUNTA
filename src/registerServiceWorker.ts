// Service worker registration with graceful offline precache
export function registerPwaServiceWorker() {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('[PWA] ServiceWorker registered with scope:', registration.scope);
        })
        .catch((error) => {
          console.warn('[PWA] ServiceWorker registration skipped or failed:', error);
        });
    });
  }
}
