import { hash } from 'argon2';
import { hashRefreshToken, refreshTokenMatches } from './refresh-token-hash';

describe('refresh token hashing', () => {
  it('hashes to a stable SHA-256 hex digest', () => {
    const digest = hashRefreshToken('refresh-token');

    expect(digest).toMatch(/^[0-9a-f]{64}$/);
    expect(hashRefreshToken('refresh-token')).toBe(digest);
    expect(hashRefreshToken('other-token')).not.toBe(digest);
  });

  it('matches only the token that produced the hash', async () => {
    const storedHash = hashRefreshToken('refresh-token');

    await expect(
      refreshTokenMatches(storedHash, 'refresh-token'),
    ).resolves.toBe(true);
    await expect(refreshTokenMatches(storedHash, 'other-token')).resolves.toBe(
      false,
    );
  });

  it('still verifies hashes stored with argon2 before the switch', async () => {
    const legacyHash = await hash('refresh-token');

    await expect(
      refreshTokenMatches(legacyHash, 'refresh-token'),
    ).resolves.toBe(true);
    await expect(refreshTokenMatches(legacyHash, 'other-token')).resolves.toBe(
      false,
    );
  });

  it('rejects a malformed stored hash instead of throwing', async () => {
    await expect(refreshTokenMatches('not-hex', 'refresh-token')).resolves.toBe(
      false,
    );
  });
});
