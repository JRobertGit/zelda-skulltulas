// Generated at build time by vite.config.ts.
const CACHE = 'byl-ba1a6f33ad98';
const FILES = ["./","apple-touch-icon.png","assets/index-BnlFrIgy.js","assets/index-i-kPw3-k.css","icon-192.png","icon-512.png","manifest.webmanifest"];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('byl-') && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

// Saved copy first, so a weak signal never makes the app wait.
self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;
  const key = request.mode === 'navigate' ? './' : request;
  event.respondWith(
    caches.open(CACHE).then((cache) =>
      cache.match(key, { ignoreSearch: request.mode === 'navigate', ignoreVary: true }).then((hit) => hit ?? fetch(request)),
    ),
  );
});
