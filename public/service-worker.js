self.addEventListener('install', e => {
    e.waitUntil(
        caches.open('sabor-cia-v3').then(cache => {
            return cache.addAll(['./', 'sobre', 'contato']);
        })
    );
});

self.addEventListener('fetch', e => {
    e.respondWith(
        caches.match(e.request).then(res => res || fetch(e.request))
    );
});