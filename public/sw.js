const CACHE_NAME = 'computer-seekho-v3';
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/illustrations.js',
  '/lessons.js',
  '/assets/logo.png',
  '/assets/ill-desktop.jpg',
  '/assets/ill-laptop.jpg',
  '/assets/ill-mouse.jpg',
  '/assets/ill-keyboard.jpg',
  '/assets/ill-shop.jpg',
  '/assets/part-01-meet-computer.jpg',
  '/assets/part-02-know-computer.jpg',
  '/assets/part-03-meet-mouse.jpg',
  '/assets/part-04-master-mouse.jpg',
  '/assets/part-05-master-keyboard.jpg',
  '/assets/part-06-files-folders.jpg',
  '/assets/practice-lab.jpg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[ServiceWorker] Precaching core assets');
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('[ServiceWorker] Precache partial error:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[ServiceWorker] Removing old cache', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Skip non-GET requests and chrome-extension schemes
  if (event.request.method !== 'GET' || !url.protocol.startsWith('http')) {
    return;
  }

  // Cache-first for audio, images, fonts
  const isMediaOrAsset = 
    url.pathname.startsWith('/audio/') || 
    url.pathname.startsWith('/assets/') ||
    event.request.destination === 'image' ||
    event.request.destination === 'audio' ||
    event.request.destination === 'font';

  if (isMediaOrAsset) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        }).catch(() => {
          // Fallback if network offline and not in cache
          return new Response('Asset offline', { status: 503 });
        });
      })
    );
    return;
  }

  // Network-first with cache fallback for HTML, JS, CSS
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) return cachedResponse;
          if (event.request.mode === 'navigate') {
            return caches.match('/index.html');
          }
          return new Response('Offline', { status: 503 });
        });
      })
  );
});
