/* Bump VERSION whenever an offline asset changes. No private HTML/API cache. */
const VERSION = 'pv-offline-v1';
const ASSETS = ['/pwa/offline.html', '/pwa/offline.css', '/pwa/offline.js', '/pwa/store.mjs', '/pwa-192x192.png'];
self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(VERSION).then((cache) => cache.addAll(ASSETS)));
  // Updates wait for all existing tabs to close: never interrupt a form.
});
self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((key) => key.startsWith('pv-offline-') && key !== VERSION).map((key) => caches.delete(key)));
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;
  if (ASSETS.includes(url.pathname) && !url.search) {
    event.respondWith(caches.open(VERSION).then(async (cache) => (await cache.match(request)) || fetch(request)));
    return;
  }
  // RSC, APIs, POSTs, credentials and server-rendered pages always use network.
  if (request.mode !== 'navigate') return;
  event.respondWith((async () => {
    try {
      return await fetch(request);
    } catch {
      return (await (await caches.open(VERSION)).match('/pwa/offline.html')) || Response.error();
    }
  })());
});
