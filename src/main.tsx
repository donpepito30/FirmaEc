import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Unregister any service workers in preview/iframe/dev environments to self-heal and prevent White Screens
try {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const registration of registrations) {
        registration.unregister().then((success) => {
          if (success) {
            console.log('[PWA] Unregistered stale service worker successfully to avoid caching issues.');
          }
        });
      }
    }).catch((e) => console.warn('[PWA] ServiceWorker cleanup error:', e));
  }
} catch (e) {
  console.warn('[PWA] ServiceWorker not supported or blocked by iframe sandbox:', e);
}

const isInsideIframe = typeof window !== 'undefined' && window.self !== window.top;
const isLocalhost = typeof window !== 'undefined' && (
  window.location.hostname === 'localhost' || 
  window.location.hostname === '127.0.0.1'
);

// Register service worker if supported, not in iframe, and running under HTTPS or localhost
if ('serviceWorker' in navigator && !isInsideIframe) {
  try {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').then(
        (reg) => console.log('[PWA] ServiceWorker registered with scope:', reg.scope),
        (err) => console.warn('[PWA] ServiceWorker registration failed:', err)
      ).catch((err) => {
        console.warn('[PWA] ServiceWorker register promise rejection:', err);
      });
    });
  } catch (err) {
    console.warn('[PWA] ServiceWorker registration error:', err);
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

