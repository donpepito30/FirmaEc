import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

const isInsideIframe = typeof window !== 'undefined' && window.self !== window.top;

// Unregister service workers only if inside iframe / preview environments to self-heal
try {
  if ('serviceWorker' in navigator && isInsideIframe) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const registration of registrations) {
        registration.unregister().then((success) => {
          if (success) {
            console.log('[PWA] Unregistered stale service worker successfully in iframe preview.');
          }
        });
      }
    }).catch((e) => console.warn('[PWA] ServiceWorker cleanup error:', e));
  }
} catch (e) {
  console.warn('[PWA] ServiceWorker not supported or blocked by iframe sandbox:', e);
}

// Register service worker if supported, NOT in iframe
if ('serviceWorker' in navigator && !isInsideIframe) {
  try {
    const registerSW = () => {
      navigator.serviceWorker.register('/sw.js').then(
        (reg) => console.log('[PWA] ServiceWorker registered with scope:', reg.scope),
        (err) => console.warn('[PWA] ServiceWorker registration failed:', err)
      ).catch((err) => {
        console.warn('[PWA] ServiceWorker register promise rejection:', err);
      });
    };

    if (document.readyState === 'complete') {
      registerSW();
    } else {
      window.addEventListener('load', registerSW);
    }
  } catch (err) {
    console.warn('[PWA] ServiceWorker registration error:', err);
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

