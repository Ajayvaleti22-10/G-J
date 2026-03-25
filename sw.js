/**
 * G&J Window Tinting — Service Worker
 * Handles caching for performance & offline resilience
 */

const CACHE_NAME = 'gj-tinting-v3';
const CACHE_VERSION = 1;

// Assets to cache immediately on install
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/css/style.css',
  '/js/main.js',
  '/images/logo-gj.png',
];

// External resources to cache when first fetched
const CACHE_ON_DEMAND = [
  'https://fonts.googleapis.com',
  'https://fonts.gstatic.com',
];

/* ---- Install: precache core assets ---- */
self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(PRECACHE_ASSETS);
    }).then(function () {
      return self.skipWaiting();
    })
  );
});

/* ---- Activate: clean up old caches ---- */
self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys
          .filter(function (key) { return key !== CACHE_NAME; })
          .map(function (key) { return caches.delete(key); })
      );
    }).then(function () {
      return self.clients.claim();
    })
  );
});

/* ---- Fetch: cache strategy ---- */
self.addEventListener('fetch', function (event) {
  const url = new URL(event.request.url);

  // Skip non-GET and browser-extension requests
  if (event.request.method !== 'GET') return;
  if (url.protocol === 'chrome-extension:') return;

  // Google Fonts — cache first, network fallback
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    event.respondWith(
      caches.match(event.request).then(function (cached) {
        return cached || fetch(event.request).then(function (response) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(function (cache) {
            cache.put(event.request, clone);
          });
          return response;
        });
      })
    );
    return;
  }

  // Google Maps & other Google embeds — network only (dynamic content)
  if (url.hostname.includes('google.com') || url.hostname.includes('googleapis.com')) {
    event.respondWith(fetch(event.request).catch(function () {
      return new Response('Offline', { status: 503 });
    }));
    return;
  }

  // Site assets — cache first, then network, update cache in background
  if (url.hostname === self.location.hostname) {
    event.respondWith(
      caches.match(event.request).then(function (cached) {
        const networkFetch = fetch(event.request).then(function (response) {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(function (cache) {
              cache.put(event.request, clone);
            });
          }
          return response;
        }).catch(function () {
          // Return offline fallback for navigation requests
          if (event.request.mode === 'navigate') {
            return caches.match('/index.html');
          }
        });

        return cached || networkFetch;
      })
    );
    return;
  }

  // Default: network with cache fallback
  event.respondWith(
    fetch(event.request).catch(function () {
      return caches.match(event.request);
    })
  );
});
