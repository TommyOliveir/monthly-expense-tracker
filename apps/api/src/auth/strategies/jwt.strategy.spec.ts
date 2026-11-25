import { UnauthorizedException } from '@nestjs/common';
import { Session } from '@prisma/client';
import { SessionService } from '@/auth/session.service';
import { AccessTokenPayload } from '@/auth/types/token';
import { JwtStrategy } from './jwt.strategy';

function buildSession(overrides: Partial<Session> = {}): Session {
  return {
    id: 'session-1',
    userId: 'user-1',
    refreshTokenHash: 'hash',
    expiresAt: new Date(Date.now() + 60_000),
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    ...overrides,
  };
}

const accessPayload: AccessTokenPayload = {
  sub: 'user-1',
  email: 'tommy@gmail.com',
  sid: 'session-1',
  type: 'access',
};

describe('JwtStrategy', () => {
  const sessionService = { findById: jest.fn() };
  let strategy: JwtStrategy;

  beforeEach(() => {
    jest.resetAllMocks();
    strategy = new JwtStrategy(
      { accessSecret: 'access-secret', refreshSecret: 'refresh-secret' },
      sessionService as unknown as SessionService,
    );
  });

  it('returns the caller while their session is active', async () => {
    sessionService.findById.mockResolvedValue(buildSession());

    await expect(strategy.validate(accessPayload)).resolves.toEqual({
      id: 'user-1',
      email: 'tommy@gmail.com',
    });
    expect(sessionService.findById).toHaveBeenCalledWith('session-1');
  });

  it.each([
    ['logged out (session deleted)', null],
    ['expired', buildSession({ expiresAt: new Date(Date.now() - 1000) })],
    ['owned by another user', buildSession({ userId: 'user-2' })],
  ])('rejects a token whose session is %s', async (_label, session) => {
    sessionService.findById.mockResolvedValue(session);

    await expect(strategy.validate(accessPayload)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it.each([
    ['a refresh token', { ...accessPayload, type: 'refresh' as const }],
    ['a token without a type', { ...accessPayload, type: undefined }],
    ['a token without a session id', { ...accessPayload, sid: undefined }],
  ])('rejects %s without touching the database', async (_label, payload) => {
    await expect(strategy.validate(payload)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
    expect(sessionService.findById).not.toHaveBeenCalled();
  });
});
