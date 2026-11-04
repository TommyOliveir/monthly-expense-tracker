const LOCAL_FRONTEND_ORIGIN = 'http://localhost:3000';

/**
 * Builds the CORS allowlist from FRONTEND_URL, which may hold several
 * comma-separated origins (e.g. production + preview URLs). Browsers send the
 * Origin without a trailing slash, so one in the env value would never match.
 */
export function getAllowedOrigins(frontendUrl: string | undefined): string[] {
  const configuredOrigins = (frontendUrl ?? '')
    .split(',')
    .map((origin) => origin.trim().replace(/\/+$/, ''))
    .filter(Boolean);

  return Array.from(new Set([LOCAL_FRONTEND_ORIGIN, ...configuredOrigins]));
}
