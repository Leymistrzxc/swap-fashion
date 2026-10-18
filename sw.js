// Swap Fashion - Service Worker
const CACHE_NAME = 'swap-fashion-v4';
const URLS_TO_CACHE = [
    '/swap-fashion/',
    '/swap-fashion/index.html',
    '/swap-fashion/home.html',
    '/swap-fashion/cart.html',
    '/swap-fashion/checkout.html',
    '/swap-fashion/profile.html',
    '/swap-fashion/notifications.html',
    '/swap-fashion/inbox.html',
    '/swap-fashion/style.css',
    '/swap-fashion/app.js',
    '/swap-fashion/ue-building.jpg'
];

// Install - cache files
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(URLS_TO_CACHE))
            .then(() => self.skipWaiting())
    );
});

// Activate - clean old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
            )
        ).then(() => self.clients.claim())
    );
});

// Fetch - serve from cache first, fall back to network
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => response || fetch(event.request))
            .catch(() => caches.match('/swap-fashion/index.html'))
    );
});