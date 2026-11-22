// Minimal service worker: cache the app shell so already-calculated
// charts keep working offline. Network-first for navigation, cache-first
// for same-origin static assets. No data is collected.
const CACHE = 'astro-v1';
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(['/'])).catch(() => undefined));
  self.skipWaiting();
});
self.addEventListener('activate', (e) => { e.waitUntil(self.clients.claim()); });
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== self.location.origin) return;
  e.respondWith(
    fetch(e.request).then((res) => { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(e.request, copy)).catch(() => undefined); return res; })
      .catch(() => caches.match(e.request)),
  );
});
