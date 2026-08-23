import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Register PWA Service Worker for app installation & caching
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(
      (reg) => console.log('[PWA] ServiceWorker registered with scope:', reg.scope),
      (err) => console.error('[PWA] ServiceWorker registration failed:', err)
    );
  });
} else if ('serviceWorker' in navigator) {
  // Always register in dev mode too so PWA install prompt works in development preview
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((err) => {
      console.warn('[PWA] ServiceWorker dev registration error:', err);
    });
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

