import { API_BASE_URL } from "@/config";
import { HTTP_STATUS } from "./httpCode";
import { ENDPOINTS } from "./endpoints";
import { getTokens } from "../features/auth/tokenStore";

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

let refreshPromise: Promise<AuthTokens> | null = null;

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

  const data: {
    access_token: string;
    refresh_token: string;
  } = await response.json();

  const newTokens: AuthTokens = {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
  };

  setTokens(newTokens);

  return newTokens;
}

async function refreshAccessToken(
  usedAccessToken: string | null,
): Promise<AuthTokens> {
  const currentAccessToken = getTokens()?.accessToken ?? null;

  if (
    usedAccessToken &&
    currentAccessToken &&
    currentAccessToken !== usedAccessToken
  ) {
    return getTokens()!;
  }

  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = performTokenRefresh();

  try {
    return await refreshPromise;
  } catch (error) {
    clearTokens();
    throw error;
  } finally {
    refreshPromise = null;
  }
}

async function request<T>(url: string, options?: RequestOptions): Promise<T> {
  const requiresAuth = options?.requiresAuth !== false;

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
