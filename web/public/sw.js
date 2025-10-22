// Basic service worker for PWA
const CACHE_NAME = 'olfong-v2';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  // Skip caching for API calls and media files
  if (event.request.url.includes('/api/') || 
      event.request.url.includes('/uploads/') ||
      event.request.url.includes('localhost:3001') ||
      event.request.url.includes('http://localhost:5000')) {
    return fetch(event.request);
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request).catch(() => {
          // Return a basic error response if fetch fails
          return new Response('Service unavailable', { 
            status: 503, 
            statusText: 'Service Unavailable' 
          });
        });
      }
    )
  );
});