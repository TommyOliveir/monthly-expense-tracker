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
// How long saved data is shown on open. Matches the refresh token's 30-day
// sliding lifetime (REFRESH_TOKEN_TTL_DAYS in the API): after that long away
// you have to log in again anyway. A shorter window meant anyone who skipped
// a day saw the skeleton for the whole Render cold start (~1 minute).
const CACHE_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;
const STALE_TIME_MS = 5 * 60 * 1000;

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
            // Cached data counts as fresh for 5 minutes, so moving between
            // pages doesn't refetch. Safe because every mutation invalidates
            // the keys it changes; this only bounds how long an edit made on
            // another device takes to show up here.
            staleTime: STALE_TIME_MS,
            // Never garbage-collect: unused data stays in memory (and so in the
            // saved copy) until logout clears it. This can't be CACHE_MAX_AGE_MS:
            // timers above 2^31-1 ms (~24.8 days) fire after ~1 ms instead, so
            // leaving the tracker deleted its data and returning refetched.
            // The 30-day limit is enforced on restore by `maxAge` below.
            gcTime: Infinity,
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
        maxAge: CACHE_MAX_AGE_MS,
        buster: QUERY_CACHE_VERSION,
      }}
    >
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </PersistQueryClientProvider>
  );
}
