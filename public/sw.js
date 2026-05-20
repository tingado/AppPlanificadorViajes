const CACHE = 'lm-planner-v1';
const SHELL = [
  '/AppPlanificadorViajes/',
  '/AppPlanificadorViajes/_next/static/',
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(['/AppPlanificadorViajes/']))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  // No cachear tiles del mapa (tile.openstreetmap.org)
  if (e.request.url.includes('openstreetmap') || e.request.url.includes('tile.')) return;

  e.respondWith(
    caches.match(e.request).then((cached) => {
      if (cached) return cached;
      return fetch(e.request).then((res) => {
        // Solo cachear requests de mismo origin y assets estáticos
        if (
          res.ok &&
          (e.request.url.includes('/_next/static/') || e.request.url.endsWith('/'))
        ) {
          const clone = res.clone();
          caches.open(CACHE).then((c) => c.put(e.request, clone));
        }
        return res;
      }).catch(() => caches.match('/AppPlanificadorViajes/'));
    })
  );
});
