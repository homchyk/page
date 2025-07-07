const CACHE_NAME = 'cache-v1.5.3';

// Список файлів, які треба закешувати при встановленні
const FILES_TO_CACHE = [
  '/page/manifest.json',
  '/page/icons/192.png',
  '/page/icons/512.png',
  '/page/favicon.png',
  '/page/index.html',
  '/page/app.css',
  '/page/app.js',
  '/page/script.js',
  '/page/street.js',
  '/page/lang.js',
  '/page/fontawesome/font-awesome.css',
  '/page/fontawesome/FontAwesome.otf',
  '/page/fontawesome/fontawesome-webfont.eot',
  '/page/fontawesome/fontawesome-webfont.woff',
  '/page/fontawesome/fontawesome-webfont.woff2',
  '/page/fontawesome/fontawesome-webfont.ttf',
  '/page/fontawesome/fontawesome-webfont.svg',
  '/page/module/filesaver.js',
  '/page/module/html2canvas.js',
  '/page/module/jspdf.js',
  '/page/module/alert/script.js',
  '/page/module/alert/style.css',
  '/page/module/pagination/script.js',
  '/page/module/pagination/style.css',
  '/page/module/ux/main.js',
  '/page/module/ux/main.css',
  '/page/module/ux/rsc.js',
  '/page/module/ux/rsc.css',
  '/page/module/ux/modal.js',
  '/page/module/ux/modal.css'
  
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
              return caches.match('/page/index.html');
            }
          });
      })
  );
});
