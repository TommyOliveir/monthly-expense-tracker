import type { AuthTokens } from "./types/auth";

type TokenListener = (tokens: AuthTokens | null) => void;

const STORAGE_KEY = "session";

function getInitialTokens(): AuthTokens | null {
  const storedToken = localStorage.getItem(STORAGE_KEY);

  if (!storedToken) {
    return null;
  }

  try {
    return JSON.parse(storedToken) as AuthTokens;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

let tokens: AuthTokens | null = getInitialTokens();

const listeners = new Set<TokenListener>();

function areTokensEqual(
  first: AuthTokens | null,
  second: AuthTokens | null,
): boolean {
  if (first === null || second === null) {
    return first === second;
  }

  return (
    first.accessToken === second.accessToken &&
    first.refreshToken === second.refreshToken
  );
}

if (typeof window !== "undefined") {
  window.addEventListener("storage", (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY) {
      return;
    }

    let newTokens: AuthTokens | null = null;

    if (event.newValue) {
      try {
        newTokens = JSON.parse(event.newValue) as AuthTokens;
      } catch {
        localStorage.removeItem(STORAGE_KEY);
        newTokens = null;
      }
    }

    if (!areTokensEqual(tokens, newTokens)) {
      tokens = newTokens;

      listeners.forEach((listener) => {
        listener(tokens);
      });
    }
  });
}

export function getTokens(): AuthTokens | null {
  return tokens;
}

export function setTokens(newTokens: AuthTokens): void {
  if (areTokensEqual(tokens, newTokens)) {
    return;
  }

  tokens = newTokens;

  localStorage.setItem(STORAGE_KEY, JSON.stringify(newTokens));

  listeners.forEach((listener) => {
    listener(tokens);
  });
}

export function clearTokens(): void {
  if (tokens === null) {
    return;
  }

  tokens = null;

  localStorage.removeItem(STORAGE_KEY);

  listeners.forEach((listener) => {
    listener(null);
  });
}

export function subscribeToTokens(listener: TokenListener): () => void {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}
