const CACHE_NAME = 'brainpdf-cache-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/style.css',
  '/main.js',
  '/libs/pdf.min.js',
  '/libs/pdf.worker.min.js',
  '/libs/jszip.min.js'
];
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async cache => {
      for (const asset of ASSETS) {
        try {
          await cache.add(new Request(asset, {mode: 'no-cors'}));
        } catch (err) {
          console.warn('SW cache failed for', asset, err);
        }
      }
    })
  );
});
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(res => res || fetch(event.request))
  );
});
