import { createHash, timingSafeEqual } from 'node:crypto';
import { verify } from 'argon2';

// Refresh tokens are long, random, signed JWTs, so a fast hash is safe here.
// argon2's deliberate slowness only protects low-entropy secrets like
// passwords, and on a small Render instance it made every refresh slow.
export function hashRefreshToken(refreshToken: string): string {
  return createHash('sha256').update(refreshToken).digest('hex');
}

// Sessions created before the switch hold an argon2 hash. They still verify
// once; the rotation after that stores a SHA-256 hash.
function isLegacyArgon2Hash(storedHash: string): boolean {
  return storedHash.startsWith('$argon2');
}

export async function refreshTokenMatches(
  storedHash: string,
  refreshToken: string,
): Promise<boolean> {
  if (isLegacyArgon2Hash(storedHash)) {
    return verify(storedHash, refreshToken);
  }

  const expected = Buffer.from(storedHash, 'hex');
  const actual = Buffer.from(hashRefreshToken(refreshToken), 'hex');

  return expected.length === actual.length && timingSafeEqual(expected, actual);
}
