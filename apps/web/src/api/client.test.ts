import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError, get } from "@/api/client";
import { ENDPOINTS } from "@/api/endpoints";
import { clearTokens, getTokens, setTokens } from "@/features/auth/tokenStore";

// A JWT-shaped token whose `exp` is `expiresInSeconds` from now. The client
// only reads `exp`; the signature is never checked on this side.
function fakeAccessToken(name: string, expiresInSeconds: number): string {
  const encode = (value: Record<string, unknown>) =>
    btoa(JSON.stringify(value)).replace(/=+$/, "");
  const exp = Math.floor(Date.now() / 1000) + expiresInSeconds;

  return `${encode({ alg: "HS256" })}.${encode({ sub: name, exp })}.sig`;
}

// Still valid by its own `exp`, so these tests reach the API and get a 401
// there (as when the server rejects a token the phone thinks is fine).
const OLD_TOKENS = {
  accessToken: fakeAccessToken("old", 600),
  refreshToken: "old-refresh",
};
const NEW_TOKENS = {
  accessToken: fakeAccessToken("new", 900),
  refreshToken: "new-refresh",
};
const NEW_AUTH_HEADER = `Bearer ${NEW_TOKENS.accessToken}`;

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function getAuthHeader(init: RequestInit | undefined): string | null {
  return new Headers(init?.headers).get("Authorization");
}

function isRefreshCall(url: string): boolean {
  return url.endsWith(ENDPOINTS.auth.refresh);
}

const fetchMock = vi.fn<typeof fetch>();

describe("api client token refresh", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
    clearTokens();
    localStorage.clear();
    setTokens(OLD_TOKENS);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("refreshes an expired access token and retries the request", async () => {
    fetchMock.mockImplementation(async (input, init) => {
      if (isRefreshCall(String(input))) return jsonResponse(200, NEW_TOKENS);
      return getAuthHeader(init) === NEW_AUTH_HEADER
        ? jsonResponse(200, { total: 5 })
        : jsonResponse(401, { message: "Unauthorized" });
    });

    await expect(get(ENDPOINTS.budget.summary)).resolves.toEqual({ total: 5 });

    expect(getTokens()).toEqual(NEW_TOKENS);
    expect(JSON.parse(localStorage.getItem("session") ?? "null")).toEqual(
      NEW_TOKENS,
    );
  });

  it("refreshes before sending when the stored token has already expired", async () => {
    setTokens({
      accessToken: fakeAccessToken("expired", -60),
      refreshToken: "old-refresh",
    });
    fetchMock.mockImplementation(async (input, init) => {
      if (isRefreshCall(String(input))) return jsonResponse(200, NEW_TOKENS);
      return getAuthHeader(init) === NEW_AUTH_HEADER
        ? jsonResponse(200, { total: 5 })
        : jsonResponse(401, { message: "Unauthorized" });
    });

    await expect(get(ENDPOINTS.budget.summary)).resolves.toEqual({ total: 5 });

    // Refresh first, then one successful request: no wasted 401.
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(isRefreshCall(String(fetchMock.mock.calls[0][0]))).toBe(true);
  });

  it("shares one refresh between concurrent requests", async () => {
    fetchMock.mockImplementation(async (input, init) => {
      if (isRefreshCall(String(input))) return jsonResponse(200, NEW_TOKENS);
      return getAuthHeader(init) === NEW_AUTH_HEADER
        ? jsonResponse(200, [])
        : jsonResponse(401, { message: "Unauthorized" });
    });

    await Promise.all([
      get(ENDPOINTS.budget.summary),
      get(ENDPOINTS.expenses.list),
    ]);

    const refreshCalls = fetchMock.mock.calls.filter(([input]) =>
      isRefreshCall(String(input)),
    );
    expect(refreshCalls).toHaveLength(1);
  });

  it("uses tokens another tab already refreshed instead of refreshing again", async () => {
    fetchMock.mockImplementation(async (input, init) => {
      if (isRefreshCall(String(input))) {
        return jsonResponse(401, {
          message: "Invalid or expired refresh token",
        });
      }
      if (getAuthHeader(init) === NEW_AUTH_HEADER) {
        return jsonResponse(200, []);
      }
      // Another tab rotates the tokens while this request is in flight.
      localStorage.setItem("session", JSON.stringify(NEW_TOKENS));
      return jsonResponse(401, { message: "Unauthorized" });
    });

    await expect(get(ENDPOINTS.expenses.list)).resolves.toEqual([]);

    expect(
      fetchMock.mock.calls.some(([input]) => isRefreshCall(String(input))),
    ).toBe(false);
    expect(getTokens()).toEqual(NEW_TOKENS);
  });

  it("keeps the session when the refresh fails because the device is offline", async () => {
    fetchMock.mockImplementation(async (input) => {
      if (isRefreshCall(String(input))) throw new TypeError("Failed to fetch");
      return jsonResponse(401, { message: "Unauthorized" });
    });

    await expect(get(ENDPOINTS.budget.summary)).rejects.toThrow(
      "Failed to fetch",
    );

    expect(getTokens()).toEqual(OLD_TOKENS);
  });

  it("signs out when the server rejects the refresh token", async () => {
    fetchMock.mockImplementation(async (input) =>
      isRefreshCall(String(input))
        ? jsonResponse(401, { message: "Invalid or expired refresh token" })
        : jsonResponse(401, { message: "Unauthorized" }),
    );

    await expect(get(ENDPOINTS.budget.summary)).rejects.toBeInstanceOf(
      ApiError,
    );

    expect(getTokens()).toBeNull();
    expect(localStorage.getItem("session")).toBeNull();
  });
});
