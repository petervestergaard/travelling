const CACHE_NAME = "bisgaard-klanen-offline-v3";
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
      .then((cache) => cache.addAll(APP_SHELL.map((asset) => new Request(new URL(asset, self.registration.scope), { cache: "reload" }))))
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

  if (request.mode === "navigate" && url.pathname === new URL(PAGE_URL).pathname) {
    event.respondWith(
      (async () => {
        try {
          const response = await fetch(request, { cache: "no-cache" });
          if (response.ok) {
            await caches.open(CACHE_NAME).then((cache) => cache.put(PAGE_URL, response.clone()));
          }
          return response;
        } catch {
          const cachedPage = await caches.match(PAGE_URL);
          if (cachedPage) return cachedPage;
          throw new Error("The Bisgaard-Klanen itinerary is not available offline yet.");
        }
      })()
    );
    return;
  }

  if (url.pathname.includes("/images/") || url.pathname.includes("/icons/") || url.pathname.endsWith("/manifest.webmanifest")) {
    event.respondWith(
      (async () => {
        try {
          const response = await fetch(request, { cache: "no-cache" });
          if (response.ok) {
            await caches.open(CACHE_NAME).then((cache) => cache.put(request, response.clone()));
          }
          return response;
        } catch {
          const cachedAsset = await caches.match(request);
          if (cachedAsset) return cachedAsset;
          throw new Error(`The offline asset ${url.pathname} has not been cached yet.`);
        }
      })()
    );
  }
});
