import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Registrar Service Worker para instalación como App PWA en Android e iOS
if ('serviceWorker' in navigator && !import.meta.env.DEV) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        console.log('✔ Service Worker PWA registrado con éxito en scope:', reg.scope);
      })
      .catch((err) => {
        console.warn('Advertencia al registrar Service Worker:', err);
      });
  });
}

