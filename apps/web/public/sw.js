// IPON Ledger service worker: offline app shell.
// Bump CACHE_VERSION when this file's caching rules change; old caches are
// deleted on activate. Hashed /_next/static files never need a bump.
const CACHE_VERSION = "v2";
const CACHE_PREFIX = "ipon-shell-";
const CACHE_NAME = `${CACHE_PREFIX}${CACHE_VERSION}`;
const OFFLINE_URL = "/offline";
// On a weak signal, show the cached page after this long instead of waiting.
const NAVIGATION_TIMEOUT_MS = 3000;
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

async function findCachedPage(cache, request) {
  return (
    (await cache.match(request)) ??
    (await cache.match(request, { ignoreSearch: true }))
  );
}

async function fetchAndCachePage(request) {
  const response = await fetch(request);
  if (response.ok && response.type === "basic") {
    const cache = await caches.open(CACHE_NAME);
    await cache.put(request, response.clone());
  }
  return response;
}

async function getOfflineResponse(cache, request) {
  const offlinePage = await cache.match(OFFLINE_URL);
  if (!offlinePage) return Response.error();
  // Redirect rather than serve /offline's HTML under another URL: the Next
  // router would otherwise hydrate it as the requested route.
  return new URL(request.url).pathname === OFFLINE_URL
    ? offlinePage
    : Response.redirect(OFFLINE_URL, 302);
}

function waitForTimeout(ms) {
  return new Promise((resolve) => setTimeout(() => resolve(null), ms));
}

async function respondToNavigation(request, networkResponse) {
  const cache = await caches.open(CACHE_NAME);

  try {
    const firstResponse = await Promise.race([
      networkResponse,
      waitForTimeout(NAVIGATION_TIMEOUT_MS),
    ]);
    if (firstResponse) return firstResponse;

    // The network is slow: use the cached page if there is one, otherwise
    // keep waiting for the network.
    return (await findCachedPage(cache, request)) ?? (await networkResponse);
  } catch {
    return (
      (await findCachedPage(cache, request)) ??
      (await getOfflineResponse(cache, request))
    );
  }
}

// Network first, so a new deploy shows as soon as the phone is online. When
// the network takes longer than NAVIGATION_TIMEOUT_MS the cached page is shown
// instead, and the fetch keeps running to refresh the cache for next time.
function handleNavigation(event) {
  const networkResponse = fetchAndCachePage(event.request);
  // Keeps the worker alive until the fetch settles, even when the cached page
  // already answered. The catch stops an offline failure being reported twice.
  event.waitUntil(networkResponse.catch(() => undefined));
  return respondToNavigation(event.request, networkResponse);
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
  // API calls go to another origin (Render) and are never cached: auth and
  // expense data always come from the network.
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(handleNavigation(event));
    return;
  }

  if (isCacheFirstAsset(url)) {
    event.respondWith(handleStaticAsset(request));
  }
});
