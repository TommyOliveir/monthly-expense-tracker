import { API_BASE_URL } from "@/config";
import { HTTP_STATUS } from "./httpCode";
import { ENDPOINTS } from "./endpoints";
import {
  clearTokens,
  getTokens,
  setTokens,
  syncTokensFromStorage,
} from "@/features/auth/tokenStore";
import { AuthTokens } from "@/features/auth/types/auth";
import { isAccessTokenExpired } from "@/features/auth/utils/isAccessTokenExpired";

type RequestOptions = RequestInit & {
  requiresAuth?: boolean;
};

function normalizeErrorMessage(message: unknown): string {
  if (Array.isArray(message)) {
    return message.join(", ");
  }

  if (typeof message === "string" && message.trim()) {
    return message;
  }

  return "Request failed";
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message = "Request failed",
    public accessToken: string | null = null,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// Shared by every tab of the app, so only one of them refreshes at a time.
const REFRESH_LOCK_NAME = "ipon-auth-refresh";

let refreshPromise: Promise<AuthTokens> | null = null;
// The access token this tab got from its latest refresh. It's never refreshed
// early again, so a phone whose clock runs ahead can't refresh on every request.
let lastRefreshedAccessToken: string | null = null;

async function requestOnce<T>(
  url: string,
  options?: RequestOptions,
): Promise<T> {
  const accessToken = getTokens()?.accessToken ?? null;

  const headers = new Headers(options?.headers);

  if (
    options?.body &&
    !(options.body instanceof FormData) &&
    !headers.has("Content-Type")
  ) {
    headers.set("Content-Type", "application/json");
  }

  if (options?.requiresAuth !== false && accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);

    throw new ApiError(
      response.status,
      normalizeErrorMessage(errorBody?.message),
      accessToken,
    );
  }

  const text = await response.text();

  if (!text) {
    return null as T;
  }

  return JSON.parse(text) as T;
}

async function performTokenRefresh(): Promise<AuthTokens> {
  const tokens = getTokens();

  if (!tokens?.refreshToken) {
    throw new ApiError(HTTP_STATUS.UNAUTHORIZED, "No refresh token available");
  }

  const response = await fetch(`${API_BASE_URL}${ENDPOINTS.auth.refresh}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      refresh_token: tokens.refreshToken,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);

    throw new ApiError(
      response.status,
      normalizeErrorMessage(errorBody?.message),
    );
  }

  const newTokens: AuthTokens = await response.json();

  if (!newTokens?.accessToken || !newTokens.refreshToken) {
    throw new ApiError(
      HTTP_STATUS.UNAUTHORIZED,
      "Refresh response is missing tokens",
    );
  }

  setTokens(newTokens);
  lastRefreshedAccessToken = newTokens.accessToken;

  return newTokens;
}

// Refresh tokens are single-use, so two tabs refreshing with the same one
// would sign each other out. The Web Locks API queues them across tabs; where
// it's missing, the in-tab dedup in refreshAccessToken still applies.
async function withRefreshLock(
  task: () => Promise<AuthTokens>,
): Promise<AuthTokens> {
  if (typeof navigator === "undefined" || !navigator.locks) {
    return task();
  }

  return await navigator.locks.request(REFRESH_LOCK_NAME, task);
}

// Only a rejection from the server means the session is over. A network error
// (offline phone, flaky connection) must keep the tokens for the next try.
function isSessionRejected(error: unknown): boolean {
  return (
    error instanceof ApiError &&
    (error.status === HTTP_STATUS.UNAUTHORIZED ||
      error.status === HTTP_STATUS.FORBIDDEN ||
      error.status === HTTP_STATUS.BAD_REQUEST)
  );
}

async function refreshAccessToken(
  usedAccessToken: string | null,
): Promise<AuthTokens> {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = withRefreshLock(() => {
    // Another tab may have refreshed while this one waited for the lock.
    const currentTokens = syncTokensFromStorage();

    if (
      usedAccessToken &&
      currentTokens?.accessToken &&
      currentTokens.accessToken !== usedAccessToken
    ) {
      return Promise.resolve(currentTokens);
    }

    return performTokenRefresh();
  });

  try {
    return await refreshPromise;
  } catch (error) {
    if (isSessionRejected(error)) {
      clearTokens();
    }
    throw error;
  } finally {
    refreshPromise = null;
  }
}

// After a break the stored access token has usually expired (it lasts 15 min).
// Sending it anyway only earns a 401, so refresh first and save a round trip.
function shouldRefreshBeforeRequest(accessToken: string | undefined): boolean {
  return (
    accessToken !== undefined &&
    accessToken !== lastRefreshedAccessToken &&
    isAccessTokenExpired(accessToken)
  );
}

async function request<T>(url: string, options?: RequestOptions): Promise<T> {
  const requiresAuth = options?.requiresAuth !== false;
  const storedAccessToken = getTokens()?.accessToken;

  if (requiresAuth && shouldRefreshBeforeRequest(storedAccessToken)) {
    await refreshAccessToken(storedAccessToken ?? null);
  }

  try {
    return await requestOnce<T>(url, options);
  } catch (error) {
    if (
      !requiresAuth ||
      !(error instanceof ApiError) ||
      error.status !== HTTP_STATUS.UNAUTHORIZED
    ) {
      throw error;
    }

    const usedAccessToken = error.accessToken;
    const currentAccessToken = getTokens()?.accessToken ?? null;

    if (
      usedAccessToken &&
      currentAccessToken &&
      currentAccessToken !== usedAccessToken
    ) {
      return requestOnce<T>(url, options);
    }

    await refreshAccessToken(usedAccessToken);

    return requestOnce<T>(url, options);
  }
}

export function get<T>(url: string, options?: RequestOptions): Promise<T> {
  return request<T>(url, {
    method: "GET",
    ...options,
  });
}

export function post<TResponse, TBody>(
  url: string,
  body: TBody,
  options?: RequestOptions,
): Promise<TResponse> {
  return request<TResponse>(url, {
    method: "POST",
    body: JSON.stringify(body),
    ...options,
  });
}

export function patch<TResponse, TBody>(
  url: string,
  body: TBody,
  options?: RequestOptions,
): Promise<TResponse> {
  return request<TResponse>(url, {
    method: "PATCH",
    body: JSON.stringify(body),
    ...options,
  });
}

export function del<T>(url: string, options?: RequestOptions): Promise<T> {
  return request<T>(url, {
    method: "DELETE",
    ...options,
  });
}

export function postForm<TResponse>(
  url: string,
  formData: FormData,
  options?: RequestOptions,
): Promise<TResponse> {
  return request<TResponse>(url, {
    method: "POST",
    body: formData,
    ...options,
  });
}
