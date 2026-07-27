// divorcerbot service worker — offline-first cache of the shell so the deterministic tools work with no
// network. The AI analyser needs network only if you choose a BYOK provider; WebLLM caches its own model.
const CACHE = 'divorcerbot-v3';
const ASSETS = ['./', './index.html', './divorce.mjs', './precedents.mjs', './ingest.mjs', './manifest.webmanifest'];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', (e) => {
  const u = new URL(e.request.url);
  if (u.origin !== location.origin) return; // never intercept provider / model-CDN calls
  e.respondWith(caches.match(e.request).then((r) => r || fetch(e.request)));
});
