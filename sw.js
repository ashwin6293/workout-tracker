// Offline helper for the Workout Tracker.
// Network first: you always get the newest app and data when online
// (no stale-version problem); the last copy is used only when offline.
// GitHub API calls (sync, private data) are never cached or touched.
const CACHE = 'workout-tracker-v2';

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'])));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.hostname === 'api.github.com') return;          // let the browser handle it directly
  e.respondWith(
    fetch(e.request, {cache: 'no-store'})
      .then(res => {
        if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); }
        return res;
      })
      .catch(() => caches.match(e.request, {ignoreSearch: true}))
  );
});
