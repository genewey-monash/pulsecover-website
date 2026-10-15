/* PulseCover service worker: makes the site installable and shows the last loaded pages when offline.
   Network first (so users always get the newest version); API calls are never cached. */
const CACHE = 'pulsecover-v1';
self.addEventListener('install', (e) => { self.skipWaiting(); });
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== location.origin || url.pathname.startsWith('/api/') || url.pathname.startsWith('/download/') || /\.(mp4|webm|apk)$/.test(url.pathname)) return;
  e.respondWith(fetch(req).then((res) => {
    if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }
    return res;
  }).catch(() => caches.match(req).then((hit) => hit || (req.mode === 'navigate' ? caches.match('/') : undefined) || new Response('You are offline. Please reconnect and try again.', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } }))));
});
