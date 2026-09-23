const CACHE_NAME = 'gpon-fttx-v5';
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/logo-gpon.png',
  '/icon-192.png',
  '/icon-512.png',
  '/icon.svg'
];

// Instalación del Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Escuchar mensaje para forzar activación inmediata
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Activación y limpieza de todos los cachés antiguos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Estrategia de red: Network First con fallback a Cache para assets estáticos
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Omitir peticiones de API (la API se maneja con Axios y Dexie en el cliente)
  if (url.pathname.startsWith('/api') || url.hostname.includes('onrender.com') || url.pathname.includes('/infra/')) {
    return;
  }

  // Las navegaciones de página siempre van primero a la red para recibir el HTML y JS más reciente
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          return networkResponse;
        })
        .catch(() => {
          return caches.match('/index.html').then((cached) => {
            return cached || new Response('Sin conexión a red', { status: 503, statusText: 'Offline' });
          });
        })
    );
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          return new Response('Sin conexión a red', { status: 503, statusText: 'Offline' });
        });
      })
  );
});
