const CACHE_NAME = 'gpon-telecom-v15';
const MAP_CACHE_NAME = 'gpon-map-tiles-v1';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/logo-gpon.png',
  '/icon-192.png',
  '/icon-512.png',
  '/icon.svg'
];

// Instalación del Service Worker: Pre-cachear el cascarón (App Shell)
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      // Intentar pre-cachear cada asset de forma segura
      for (const asset of STATIC_ASSETS) {
        try {
          await cache.add(asset);
        } catch (e) {
          console.warn(`[SW] No se pudo pre-cachear ${asset}:`, e);
        }
      }
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

// Activación y limpieza de cachés antiguas, preservando la caché de mapas
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME && key !== MAP_CACHE_NAME)
          .map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Estrategia de peticiones (Fetch)
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // 1. Omitir peticiones de API (se manejan vía Axios + Dexie en cliente) y WebSockets (HMR / SSE)
  if (
    url.pathname.startsWith('/api') ||
    url.hostname.includes('onrender.com') ||
    url.pathname.includes('/infra/') ||
    event.request.headers.get('accept')?.includes('text/event-stream') ||
    url.protocol === 'ws:' ||
    url.protocol === 'wss:'
  ) {
    return;
  }

  // 2. Caché para teselas de mapas (OpenStreetMap y ArcGIS Satellite)
  // Estrategia: Cache First con actualización en segundo plano (Stale-While-Revalidate)
  if (
    url.hostname.includes('tile.openstreetmap.org') ||
    url.hostname.includes('arcgisonline.com')
  ) {
    event.respondWith(
      caches.open(MAP_CACHE_NAME).then(async (mapCache) => {
        const cachedResponse = await mapCache.match(event.request);

        const fetchPromise = fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && (networkResponse.status === 200 || networkResponse.type === 'opaque')) {
              mapCache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          })
          .catch(() => cachedResponse);

        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // 3. Peticiones de Navegación de páginas HTML (SPA: /mapa, /clientes, /reportes, etc.)
  // Estrategia: Network First. Si falla la red (offline), servir el cascarón de la SPA (index.html)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put('/index.html', copy.clone());
              cache.put('/', copy);
            });
          }
          return networkResponse;
        })
        .catch(async () => {
          const cached = (await caches.match('/index.html')) || (await caches.match('/'));
          if (cached) {
            return cached;
          }
          return new Response(
            '<!doctype html><html><body style="font-family:sans-serif;background:#0f172a;color:#fff;text-align:center;padding:2rem;"><h2>GPON Telecom</h2><p>Conexión en pausa. Verifica tu acceso a internet.</p></body></html>',
            { headers: { 'Content-Type': 'text/html; charset=utf-8' }, status: 200 }
          );
        })
    );
    return;
  }

  // 4. Recursos Estáticos (JavaScript, CSS, imágenes, tipografías)
  // Estrategia: Network First con fallback a Cache
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (
          networkResponse &&
          (networkResponse.status === 200 || networkResponse.type === 'opaque')
        ) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      })
      .catch(async () => {
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) {
          return cachedResponse;
        }

        // Si es una petición de documento que falló
        if (event.request.destination === 'document') {
          const appShell = (await caches.match('/index.html')) || (await caches.match('/'));
          if (appShell) return appShell;
        }

        return new Response('', { status: 408, statusText: 'Request Timed Out / Offline' });
      })
  );
});
