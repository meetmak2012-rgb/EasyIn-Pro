
const CACHE_NAME = 'easyin-pro-v2';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  '/src/index.css',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Opened cache, pre-fetching assets...');
      return cache.addAll(ASSETS);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Return cached asset if found, otherwise fetch from network
      return response || fetch(event.request).then((networkResponse) => {
        // Optionally cache new successful requests here
        return networkResponse;
      });
    }).catch(() => {
      // If both fail (offline and not in cache), return a fallback if needed
    })
  );
});
