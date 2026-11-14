import { createHash } from 'node:crypto';
import { readFileSync, readdirSync } from 'node:fs';
import { defineConfig, type Plugin } from 'vite';

/**
 * Writes sw.js listing every file of this build, so the app keeps working with
 * no signal. The cache name changes with the files, which lets a new version
 * replace the old one the next time the phone is online.
 */
function offline(): Plugin {
  return {
    name: 'offline',
    apply: 'build',
    generateBundle(_options, bundle) {
      const built = Object.keys(bundle);
      const copied = readdirSync('public');
      const files = ['./', ...[...built, ...copied].filter((f) => !f.endsWith('.map')).sort()];
      const hash = createHash('sha256');
      for (const item of Object.values(bundle)) hash.update(item.type === 'chunk' ? item.code : item.source);
      for (const file of copied) hash.update(readFileSync(`public/${file}`));
      const version = hash.digest('hex').slice(0, 12);
      this.emitFile({
        type: 'asset',
        fileName: 'sw.js',
        source: `// Generated at build time by vite.config.ts.
const CACHE = 'byl-${version}';
const FILES = ${JSON.stringify(files)};

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
`,
      });
    },
  };
}

// A fixed port and network name keep the web address stable, because browsers
// tie saved progress to the exact address. Relative paths let the same build
// move to static hosting later.
export default defineConfig({
  base: './',
  plugins: [offline()],
  preview: { host: true, port: 4173, strictPort: true, allowedHosts: ['.local'] },
  server: { host: true, port: 5173, strictPort: true, allowedHosts: ['.local'] },
});
