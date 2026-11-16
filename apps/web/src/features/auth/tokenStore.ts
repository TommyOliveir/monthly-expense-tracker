import type { AuthTokens } from "./types/auth";

type TokenListener = (tokens: AuthTokens | null) => void;

const STORAGE_KEY = "session";

// Safari throws on localStorage access when "Block All Cookies" is on. The
// session then lives in memory only instead of crashing login.
function readStorage(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function writeStorage(value: string): void {
  try {
    localStorage.setItem(STORAGE_KEY, value);
  } catch (error) {
    console.warn("Could not persist the session:", error);
  }
}

function removeStorage(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing persisted, nothing to remove.
  }
}

function parseTokens(rawValue: string | null): AuthTokens | null {
  if (!rawValue) {
    return null;
  }

  try {
    const parsed = JSON.parse(rawValue) as Partial<AuthTokens>;
    // A session without an access token can't authenticate anything.
    return parsed.accessToken ? (parsed as AuthTokens) : null;
  } catch {
    removeStorage();
    return null;
  }
}

function getInitialTokens(): AuthTokens | null {
  if (typeof window === "undefined") {
    return null;
  }

  return parseTokens(readStorage());
}

let tokens: AuthTokens | null = getInitialTokens();

const listeners = new Set<TokenListener>();

function applyTokens(newTokens: AuthTokens | null): void {
  if (areTokensEqual(tokens, newTokens)) {
    return;
  }

  tokens = newTokens;

  listeners.forEach((listener) => {
    listener(tokens);
  });
}

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

    applyTokens(parseTokens(event.newValue));
  });
}

// Picks up tokens another tab just saved. The `storage` event is async, so a
// tab that waited for another tab's refresh calls this to see the result now.
export function syncTokensFromStorage(): AuthTokens | null {
  if (typeof window !== "undefined") {
    applyTokens(parseTokens(readStorage()));
  }

  return tokens;
}

export function getTokens(): AuthTokens | null {
  return tokens;
}

export function setTokens(newTokens: AuthTokens): void {
  if (areTokensEqual(tokens, newTokens)) {
    return;
  }

  tokens = newTokens;

  if (typeof window !== "undefined") {
    writeStorage(JSON.stringify(newTokens));
  }

  listeners.forEach((listener) => {
    listener(tokens);
  });
}

export function clearTokens(): void {
  if (tokens === null) {
    return;
  }

  tokens = null;

  if (typeof window !== "undefined") {
    removeStorage();
  }

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
