const CACHE = 'lm-planner-v3';

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
  const url = e.request.url;

  // No interceptar tiles del mapa
  if (url.includes('openstreetmap') || url.includes('tile.')) return;

  // Chunks JS/_next/static: network-first para evitar servir chunks stale
  // tras un nuevo deploy (chunk hashes cambian con cada build)
  if (url.includes('/_next/static/chunks/') || url.includes('/_next/static/css/')) {
    e.respondWith(
      fetch(e.request)
        .then((res) => {
          if (res.ok) {
            const clone = res.clone();
            caches.open(CACHE).then((c) => c.put(e.request, clone));
          }
          return res;
        })
        .catch(() => caches.match(e.request))
    );
    return;
  }

  // Shell HTML: cache-first con fallback a red
  e.respondWith(
    caches.match(e.request).then((cached) => {
      if (cached) return cached;
      return fetch(e.request).then((res) => {
        if (res.ok && e.request.url.endsWith('/')) {
          const clone = res.clone();
          caches.open(CACHE).then((c) => c.put(e.request, clone));
        }
        return res;
      }).catch(() => caches.match('/AppPlanificadorViajes/'));
    })
  );
});
