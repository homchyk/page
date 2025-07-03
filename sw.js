const CACHE_NAME = 'cache-v1';

// Список файлів, які треба закешувати при встановленні (додай сюди свої)
const FILES_TO_CACHE = [
  '/manifest.json',
  '/icons/192.png',
  '/icons/512.png',
  '/favicon.png',
  '/index.html',
  '/app.css',
  '/app.js',
  '/script.js',
  '/street.js',
  '/lang.js',
  '/fontawesome/font-awesome.css',
  '/fontawesome/FontAwesome.otf',
  '/fontawesome/fontawesome-webfont.eot',
  '/fontawesome/fontawesome-webfont.woff',
  '/fontawesome/fontawesome-webfont.woff2',
  '/fontawesome/fontawesome-webfont.ttf',
  '/fontawesome/fontawesome-webfont.svg',
  '/module/filesaver.js',
  '/module/html2canvas.js',
  '/module/jspdf.js',
  '/module/alert/script.js',
  '/module/alert/style.css',
  '/module/pagination/script.js',
  '/module/pagination/style.css',
  '/module/ux/main.js',
  '/module/ux/main.css',
  '/module/ux/rsc.js',
  '/module/ux/rsc.css',
  '/module/ux/modal.js',
  '/module/ux/modal.css'
  
];

// При встановленні — кешуємо всі файли
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(FILES_TO_CACHE))
      .then(() => self.skipWaiting()) // активує відразу
  );
});

// При активації — очищаємо старі кеші
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keyList =>
      Promise.all(keyList.map(key => {
        if (key !== CACHE_NAME) {
          return caches.delete(key);
        }
      }))
    )
  );
  self.clients.claim();
});

// Перехоплення запитів — спроба з кешу, інакше з інтернету
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Якщо є в кеші — повертаємо
        if (response) return response;

        // Інакше — пробуємо з інтернету, і додаємо в кеш
        return fetch(event.request)
          .then(fetchResponse => {
            return caches.open(CACHE_NAME).then(cache => {
              // Кешуємо нову версію
              if (event.request.method === "GET") {
                cache.put(event.request, fetchResponse.clone());
              }
              return fetchResponse;
            });
          })
          .catch(() => {
            // Якщо немає інтернету — повертаємо offline.html
            if (event.request.mode === 'navigate') {
              return caches.match('/index.html');
            }
          });
      })
  );
});
