import { render, screen, waitFor } from "@testing-library/react";
import {
  type QueryClient,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AuthProvider, useAuth } from "@/features/auth/AuthProvider";
import { clearTokens, setTokens } from "@/features/auth/tokenStore";
import QueryProvider from "@/providers/query-provider";
import { QUERY_CACHE_STORAGE_KEY } from "@/providers/queryCacheStorage";

const SUMMARY_KEY = ["budget", "summary", { month: 11, year: 2026 }];
const TOKENS = { accessToken: "access", refreshToken: "refresh" };

type SummaryProps = {
  queryFn: () => Promise<string>;
};

function Summary({ queryFn }: SummaryProps) {
  const { data, isPending } = useQuery({ queryKey: SUMMARY_KEY, queryFn });
  return <p>{isPending ? "loading" : data}</p>;
}

type SignedInSummaryProps = SummaryProps & {
  onQueryClient: (queryClient: QueryClient) => void;
};

// Like TrackerScreen: the data only renders while signed in.
function SignedInSummary({ queryFn, onQueryClient }: SignedInSummaryProps) {
  const { isAuthenticated } = useAuth();
  onQueryClient(useQueryClient());
  return isAuthenticated ? <Summary queryFn={queryFn} /> : <p>signed out</p>;
}

function readPersistedCache(): string | null {
  return localStorage.getItem(QUERY_CACHE_STORAGE_KEY);
}

const neverResolves = () => new Promise<string>(() => {});
const DAY_MS = 24 * 60 * 60 * 1000;

describe("QueryProvider persistence", () => {
  beforeEach(() => {
    localStorage.clear();
    clearTokens();
    setTokens(TOKENS);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("shows the last saved data on the next app open before the API answers", async () => {
    const firstOpen = render(
      <QueryProvider>
        <Summary queryFn={() => Promise.resolve("₱1,000 budget")} />
      </QueryProvider>,
    );
    // The persister saves on a ~1 s throttle.
    await waitFor(() => expect(readPersistedCache()).toContain("₱1,000"), {
      timeout: 3000,
    });
    firstOpen.unmount();

    // Reopen: the API never answers, yet the saved data is shown.
    render(
      <QueryProvider>
        <Summary queryFn={neverResolves} />
      </QueryProvider>,
    );

    expect(await screen.findByText("₱1,000 budget")).toBeInTheDocument();
  });

  it.each([
    { label: "2 days", days: 2, shown: "₱1,000 budget" },
    { label: "29 days", days: 29, shown: "₱1,000 budget" },
    // Past the 30-day session lifetime the copy is dropped.
    { label: "31 days", days: 31, shown: "loading" },
  ])(
    "after $label away, shows $shown while the API wakes up",
    async ({ days, shown }) => {
      const firstOpen = render(
        <QueryProvider>
          <Summary queryFn={() => Promise.resolve("₱1,000 budget")} />
        </QueryProvider>,
      );
      await waitFor(() => expect(readPersistedCache()).toContain("₱1,000"), {
        timeout: 3000,
      });
      firstOpen.unmount();

      const savedAt = Date.now();
      vi.spyOn(Date, "now").mockReturnValue(savedAt + days * DAY_MS);
      render(
        <QueryProvider>
          <Summary queryFn={neverResolves} />
        </QueryProvider>,
      );

      expect(await screen.findByText(shown)).toBeInTheDocument();
    },
  );

  it("keeps data in memory and on disk when you leave the tracker and come back", async () => {
    const fetchSummary = vi.fn(() => Promise.resolve("₱1,000 budget"));
    const view = render(
      <QueryProvider>
        <Summary queryFn={fetchSummary} />
      </QueryProvider>,
    );
    expect(await screen.findByText("₱1,000 budget")).toBeInTheDocument();

    for (let trip = 0; trip < 3; trip++) {
      // Like opening /about: the tracker's query has no observer for a while.
      view.rerender(
        <QueryProvider>
          <p>about</p>
        </QueryProvider>,
      );
      await new Promise((resolve) => setTimeout(resolve, 20));
      view.rerender(
        <QueryProvider>
          <Summary queryFn={fetchSummary} />
        </QueryProvider>,
      );
      expect(screen.getByText("₱1,000 budget")).toBeInTheDocument();
    }

    expect(fetchSummary).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(readPersistedCache()).toContain("₱1,000"), {
      timeout: 3000,
    });
  });

  it("wipes cached data, in memory and on disk, when the session ends", async () => {
    let queryClient: QueryClient | undefined;
    render(
      <QueryProvider>
        <AuthProvider>
          <SignedInSummary
            queryFn={() => Promise.resolve("private numbers")}
            onQueryClient={(client) => (queryClient = client)}
          />
        </AuthProvider>
      </QueryProvider>,
    );
    expect(await screen.findByText("private numbers")).toBeInTheDocument();
    await waitFor(() => expect(readPersistedCache()).toContain("private"), {
      timeout: 3000,
    });

    clearTokens();

    expect(await screen.findByText("signed out")).toBeInTheDocument();
    expect(queryClient?.getQueryData(SUMMARY_KEY)).toBeUndefined();
    expect(readPersistedCache() ?? "").not.toContain("private");
  });
});
