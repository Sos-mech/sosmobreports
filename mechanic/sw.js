const CACHE_NAME='mechanic-pwa-v1';
const urlsToCache=[
  '/',
  '/index.html',
  '/style.css',
  '/manifest.json',
  '/jobs.js',
  '/qr.js'
];

self.addEventListener('install', e=>{
  e.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.addAll(urlsToCache)));
});

self.addEventListener('fetch', e=>{
  e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request)));
});

// Background sync placeholder
self.addEventListener('sync', e=>{
  if(e.tag==='sync-jobs'){ e.waitUntil(syncJobs()); }
});
async function syncJobs(){ console.log('Sync jobs when online'); }