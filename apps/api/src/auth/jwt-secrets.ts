// Injection token for the secrets that sign and verify JWTs.
export const JWT_SECRETS = Symbol('JWT_SECRETS');

export type JwtSecrets = {
  accessSecret: string;
  refreshSecret: string;
};

type JwtSecretEnv = {
  JWT_SECRET?: string;
  JWT_REFRESH_SECRET?: string;
};

// Runs when the auth module starts, so a missing secret stops the API from
// booting instead of silently signing tokens with a value from the source code.
export function loadJwtSecrets(env: JwtSecretEnv = process.env): JwtSecrets {
  const accessSecret = env.JWT_SECRET?.trim();
  const refreshSecret = env.JWT_REFRESH_SECRET?.trim();

  const missing = [
    !accessSecret && 'JWT_SECRET',
    !refreshSecret && 'JWT_REFRESH_SECRET',
  ].filter(Boolean);
  if (!accessSecret || !refreshSecret) {
    throw new Error(
      `Missing ${missing.join(' and ')}. Set them in apps/api/.env locally, or in the host's environment variables.`,
    );
  }

  // With one shared secret, a refresh token would also pass as an access token.
  if (accessSecret === refreshSecret) {
    throw new Error('JWT_SECRET and JWT_REFRESH_SECRET must be different.');
  }

  return { accessSecret, refreshSecret };
}
