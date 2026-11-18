// Where the React Query cache is persisted between app opens.
export const QUERY_CACHE_STORAGE_KEY = "ipon-query-cache";

// Safari throws on localStorage access when storage is blocked; the cache
// then stays in memory only, as it did before persistence.
export function getQueryCacheStorage(): Storage | undefined {
  if (typeof window === "undefined") {
    return undefined;
  }

  try {
    return window.localStorage;
  } catch {
    return undefined;
  }
}

// The persister saves on a short throttle, so the saved copy is also removed
// directly: closing the app right after logout must not leave data behind.
export function removePersistedQueryCache(): void {
  getQueryCacheStorage()?.removeItem(QUERY_CACHE_STORAGE_KEY);
}
