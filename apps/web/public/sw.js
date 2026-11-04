// IPON Ledger service worker: offline app shell.
// Bump CACHE_VERSION when this file's caching rules change; old caches are
// deleted on activate. Hashed /_next/static files never need a bump.
const CACHE_VERSION = "v1";
const CACHE_PREFIX = "ipon-shell-";
const CACHE_NAME = `${CACHE_PREFIX}${CACHE_VERSION}`;
const OFFLINE_URL = "/offline";
const OPTIONAL_PRECACHE_URLS = [
  "/manifest.webmanifest",
  "/icon/192",
  "/icon/512",
  "/apple-icon",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      // The offline page is required; a missing icon must not block installing.
      await cache.add(new Request(OFFLINE_URL, { cache: "reload" }));
      await Promise.all(
        OPTIONAL_PRECACHE_URLS.map((url) =>
          cache.add(url).catch((error) => {
            console.warn(`[sw] Could not precache ${url}`, error);
          }),
        ),
      );
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME)
          .map((key) => caches.delete(key)),
      );
      await self.clients.claim();
    })(),
  );
});

function isCacheFirstAsset(url) {
  return (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/sounds/") ||
    url.pathname.startsWith("/icon/") ||
    url.pathname === "/apple-icon" ||
    url.pathname === "/favicon.ico"
  );
}

// Network first, so a new deploy shows as soon as the phone is online.
async function handleNavigation(request) {
  const cache = await caches.open(CACHE_NAME);

  try {
    const response = await fetch(request);
    if (response.ok && response.type === "basic") {
      await cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cachedPage =
      (await cache.match(request)) ??
      (await cache.match(request, { ignoreSearch: true }));
    if (cachedPage) return cachedPage;

    const offlinePage = await cache.match(OFFLINE_URL);
    if (!offlinePage) return Response.error();
    // Redirect rather than serve /offline's HTML under another URL: the Next
    // router would otherwise hydrate it as the requested route.
    return new URL(request.url).pathname === OFFLINE_URL
      ? offlinePage
      : Response.redirect(OFFLINE_URL, 302);
  }
}

// Cache first: these URLs are content-hashed or never change.
async function handleStaticAsset(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  if (response.ok && response.type === "basic") {
    await cache.put(request, response.clone());
  }
  return response;
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  // API calls go to another origin (Railway) and are never cached: auth and
  // expense data always come from the network.
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(handleNavigation(request));
    return;
  }

  if (isCacheFirstAsset(url)) {
    event.respondWith(handleStaticAsset(request));
  }
});
