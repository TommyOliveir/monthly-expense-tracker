"use client";

import { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { useState } from "react";
import {
  getQueryCacheStorage,
  QUERY_CACHE_STORAGE_KEY,
} from "./queryCacheStorage";

// Bump when a cached response shape changes, so old caches are dropped.
const QUERY_CACHE_VERSION = "1";
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export default function QueryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // Ensure each request/render has its own QueryClient instance in SSR
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute stale time
            // Kept as long as the persisted cache, so restored data isn't
            // garbage-collected before the screen that needs it mounts.
            gcTime: ONE_DAY_MS,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  // Saved to localStorage so reopening the installed app shows the last data
  // at once while fresh data loads (the API can take a while to wake up).
  const [persister] = useState(() =>
    createSyncStoragePersister({
      storage: getQueryCacheStorage(),
      key: QUERY_CACHE_STORAGE_KEY,
    }),
  );

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister,
        maxAge: ONE_DAY_MS,
        buster: QUERY_CACHE_VERSION,
      }}
    >
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </PersistQueryClientProvider>
  );
}
