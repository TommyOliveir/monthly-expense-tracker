// Refresh slightly early so a token doesn't expire while its request is in flight.
const EXPIRY_MARGIN_SECONDS = 30;

type JwtPayload = {
  exp?: unknown;
};

function decodeJwtPayload(token: string): JwtPayload | null {
  const payload = token.split(".")[1];
  if (!payload) {
    return null;
  }

  try {
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
    return JSON.parse(atob(padded)) as JwtPayload;
  } catch {
    return null;
  }
}

/**
 * Reads the token's `exp` claim without verifying it (only the API can do
 * that). Used to refresh before a request instead of after a wasted 401.
 * An unreadable token counts as expired.
 */
export function isAccessTokenExpired(
  token: string,
  nowMs: number = Date.now(),
): boolean {
  const exp = decodeJwtPayload(token)?.exp;
  if (typeof exp !== "number") {
    return true;
  }

  return exp - EXPIRY_MARGIN_SECONDS <= nowMs / 1000;
}
