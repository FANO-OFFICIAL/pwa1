const CACHE_NAME = 'apprendre-le-francais-pwa-cache-v1';
const urlsToCache = [
  '/',
  'index.html',
  'style.css',
  'app.js',
  'manifest.json',
  'https://fonts.googleapis.com/icon?family=Material+Icons',
  'https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap'
];

// Étape 1: Installation du Service Worker et mise en cache des ressources
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache ouvert');
        // Ajoute les ressources de base au cache
        return cache.addAll(urlsToCache);
      })
  );
});

// Étape 2: Interception des requêtes et stratégie de cache
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Si la ressource est dans le cache, on la retourne
        if (response) {
          return response;
        }

        // Sinon, on essaie de la récupérer sur le réseau
        return fetch(event.request).then(
          networkResponse => {
            // Si la requête réussit, on la met en cache pour une utilisation future
            if (networkResponse && networkResponse.status === 200) {
              return caches.open(CACHE_NAME).then(cache => {
                cache.put(event.request, networkResponse.clone());
                return networkResponse;
              });
            }
            return networkResponse;
          }
        );
      })
      .catch(() => {
        // En cas d'erreur (par exemple, hors ligne et ressource non cachée),
        // on pourrait retourner une page de fallback, mais pour l'instant on laisse l'erreur se produire.
      })
  );
});

// Étape 3: Activation du Service Worker et nettoyage des anciens caches
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            // Supprime les anciens caches qui ne sont plus nécessaires
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
