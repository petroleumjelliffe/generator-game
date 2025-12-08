// Service Worker for Generator Game PWA
// INCREMENT THIS VERSION when deploying breaking changes
const CACHE_VERSION = 'v3';
const CACHE_NAME = `generator-game-${CACHE_VERSION}`;

// Only cache static assets that don't change often
const STATIC_ASSETS = [
  '/generator-game/manifest.json',
  '/generator-game/icon-192.png',
  '/generator-game/icon-512.png',
];

// Install event - cache static assets only
self.addEventListener('install', (event) => {
  console.log(`[SW] Installing ${CACHE_NAME}`);
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_ASSETS))
  );
  // Force the waiting service worker to become active immediately
  self.skipWaiting();
});

// Activate event - clean up ALL old caches
self.addEventListener('activate', (event) => {
  console.log(`[SW] Activating ${CACHE_NAME}`);
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name.startsWith('generator-game-') && name !== CACHE_NAME)
          .map((name) => {
            console.log(`[SW] Deleting old cache: ${name}`);
            return caches.delete(name);
          })
      );
    })
  );
  // Claim all clients immediately so they get the new SW
  return self.clients.claim();
});

// Fetch event - NETWORK FIRST for HTML/JS/CSS, cache-first for static assets
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // Skip cross-origin requests
  if (url.origin !== location.origin) return;

  // For HTML, JS, and CSS - always try network first (stale-while-revalidate)
  if (event.request.mode === 'navigate' ||
      url.pathname.endsWith('.js') ||
      url.pathname.endsWith('.css') ||
      url.pathname.endsWith('.html') ||
      url.pathname === '/generator-game/' ||
      url.pathname === '/generator-game') {

    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Cache the fresh response
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
          return response;
        })
        .catch(() => {
          // Network failed, try cache as fallback
          return caches.match(event.request);
        })
    );
    return;
  }

  // For static assets (images, manifest) - cache first
  event.respondWith(
    caches.match(event.request)
      .then((cached) => {
        if (cached) return cached;

        return fetch(event.request).then((response) => {
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        });
      })
  );
});
