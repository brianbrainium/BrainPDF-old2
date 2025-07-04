const CACHE_NAME = 'brainpdf-cache-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/half-test.html',
  '/pages/page-1.html',
  '/style.css',
  '/main.js',
  '/memory.html',
  '/memory.js',
  '/ocr-plugin.js',
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.8.162/pdf.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.0/jszip.min.js',
  'https://unpkg.com/tesseract.js@4.0.2/dist/tesseract.min.js'
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
