const CACHE_NAME = "flashlight-pwa-cache-v1";
const urlsToCache = [
  "/",
  "/index.html",
  "/css/styleIndex.css", // Añade aquí tus estilos si los tienes
  "/css/styleAcercaDelProyecto.css",
  "/css/styleCrud.css",
  "/css/styleFlash.css", 
  "/js/script.js", // Añade aquí tu JS principal si es necesario
  "/js/scriptFlash.js",
  "/img/Naruto.jpg",
  "/img/Kanye.jpg"
];

// Instalación del Service Worker
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Archivos cacheados");
      return cache.addAll(urlsToCache);
    })
  );
});

// Activación del Service Worker
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log("Eliminando caché antigua:", cache);
            return caches.delete(cache);
          }
        })
      )
    )
  );
});

// Intercepta solicitudes y sirve desde la caché si está disponible
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});