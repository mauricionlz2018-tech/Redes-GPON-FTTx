import React from 'react';
import ReactDOM from 'react-dom/client';
import 'leaflet/dist/leaflet.css';
import App from './App';
import './index.css';
import { ErrorBoundary } from './components/ErrorBoundary';

// Capturar errores de carga dinámica de chunks generados por nuevas compilaciones en Vercel
window.addEventListener('vite:preloadError', (event) => {
  console.warn('Nueva versión detectada en servidor, recargando asset:', event);
  window.location.reload();
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);

// Registrar Service Worker para instalación PWA sin bucles de recarga
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        console.log('Service Worker PWA registrado en scope:', reg.scope);
      })
      .catch((err) => {
        console.warn('Aviso Service Worker:', err);
      });
  });
}


