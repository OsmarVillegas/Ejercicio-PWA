const CACHE_NAME = "flashlight-pwa-cache-v1";

console.log("Service Worker");

self.addEventListener('push', e => {
    const data = e.data.json()
    console.log(data)
    self.registration.showNotification(data.title, {
        body: data.message,
        icon: 'https://i.pinimg.com/736x/58/b0/88/58b088ad4b6d6c4403170a5cb44ab5a2.jpg'
    });
});

const ASSETS = [
  "./index.html",
  "./pages/acercaDelProyecto.html",
  "./pages/crudTareas.html",
  "./pages/flash.html",
  "./css/styleIndex.css", // Añade aquí tus estilos si los tienes
  "./css/styleAcercaDelProyecto.css",
  "./css/styleCrud.css",
  "./css/styleFlash.css", 
  "./js/script.js", // Añade aquí tu JS principal si es necesario
  "./js/scriptFlash.js",
  "./js/scriptCrud.js", 
  "./js/scriptNotificaciones.js",
  "./img/Naruto.jpg",
  "./img/Kanye.jpg"
];

// Instalar el Service Worker y almacenar recursos en caché
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Caching assets...");
      return cache.addAll(ASSETS);
    })
  );
});

// Activar el Service Worker y limpiar cachés antiguas
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cache) => cache !== CACHE_NAME)
          .map((cache) => caches.delete(cache))
      );
    })
  );
});

// Interceptar solicitudes y servir desde la caché
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Devuelve desde la caché o hace una solicitud a la red
      return response || fetch(event.request).catch(() => caches.match("/offline.html"));
    })
  );
});