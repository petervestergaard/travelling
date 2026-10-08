const CACHE_NAME = "bisgaard-klanen-offline-v1";
const APP_SHELL = [
  "./bisgaard_klanen_iphone.html",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./images/sanur.jpg",
  "./images/munduk.jpg",
  "./images/amed.jpg",
  "./images/ubud.jpg",
  "./images/gili-air.jpg",
  "./images/sanur-sunrise.jpg"
];
const PAGE_URL = new URL("./bisgaard_klanen_iphone.html", self.registration.scope).href;

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys
          .filter((key) => key.startsWith("bisgaard-klanen-offline-") && key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin) return;

  if (request.mode === "navigate" && url.href === PAGE_URL) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.put(request, copy)));
          }
          return response;
        })
        .catch(async () => {
          const cachedPage = await caches.match(PAGE_URL);
          if (cachedPage) return cachedPage;
          throw new Error("The Bisgaard-Klanen itinerary is not available offline yet.");
        })
    );
    return;
  }

  if (url.pathname.includes("/images/") || url.pathname.includes("/icons/") || url.pathname.endsWith("/manifest.webmanifest")) {
    event.respondWith(
      caches.match(request)
        .then((cached) => cached || fetch(request))
    );
  }
});
