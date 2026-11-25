import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { Session, User } from '@prisma/client';
import { hash } from 'argon2';
import { UserService } from '@/user/user.service';
import { AuthService } from './auth.service';
import { GoogleTokenVerifier } from './google-token.verifier';
import { SessionService } from './session.service';
import { hashRefreshToken } from './refresh-token-hash';
import { JWT_SECRETS, JwtSecrets } from './jwt-secrets';
import { GoogleProfile } from './types/google';

const googleProfile: GoogleProfile = {
  googleId: 'google-123',
  email: 'tommy@gmail.com',
  emailVerified: true,
  name: 'Tommy',
};

function buildUser(overrides: Partial<User> = {}): User {
  return {
    id: 'user-1',
    name: 'Tommy',
    email: 'tommy@gmail.com',
    password: 'hashed-password',
    googleId: null,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    ...overrides,
  };
}

function buildSession(overrides: Partial<Session> = {}): Session {
  return {
    id: 'session-1',
    userId: 'user-1',
    refreshTokenHash: 'stored-hash',
    expiresAt: new Date(Date.now() + 60_000),
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    ...overrides,
  };
}

const refreshPayload = {
  sub: 'user-1',
  email: 'tommy@gmail.com',
  sid: 'session-1',
};

describe('AuthService', () => {
  let service: AuthService;
  const userService = {
    findByGoogleId: jest.fn(),
    findByEmail: jest.fn(),
    createFromGoogle: jest.fn(),
    update: jest.fn(),
  };
  const googleTokenVerifier = { verify: jest.fn() };
  const jwtService = { signAsync: jest.fn(), verifyAsync: jest.fn() };
  const secrets: JwtSecrets = {
    accessSecret: 'test-access-secret',
    refreshSecret: 'test-refresh-secret',
  };
  const sessionService = {
    create: jest.fn(),
    findById: jest.fn(),
    rotate: jest.fn(),
    deleteForUser: jest.fn(),
    deleteExpiredForUser: jest.fn(),
  };

  beforeEach(async () => {
    jest.resetAllMocks();
    jwtService.signAsync.mockResolvedValue('signed-token');
    userService.update.mockImplementation((id: string, data: Partial<User>) =>
      Promise.resolve(buildUser({ id, ...data })),
    );

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserService, useValue: userService },
        { provide: GoogleTokenVerifier, useValue: googleTokenVerifier },
        { provide: JwtService, useValue: jwtService },
        { provide: SessionService, useValue: sessionService },
        { provide: JWT_SECRETS, useValue: secrets },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('loginWithGoogle', () => {
    it('signs in a user already linked to the Google account', async () => {
      googleTokenVerifier.verify.mockResolvedValue(googleProfile);
      userService.findByGoogleId.mockResolvedValue(
        buildUser({ googleId: 'google-123' }),
      );

      const result = await service.loginWithGoogle('id-token');

      expect(googleTokenVerifier.verify).toHaveBeenCalledWith('id-token');
      expect(result.accessToken).toBe('signed-token');
      expect(result.user).toEqual(
        expect.objectContaining({ id: 'user-1', email: 'tommy@gmail.com' }),
      );
      expect(result.user).not.toHaveProperty('password');
      expect(result.user).not.toHaveProperty('googleId');
      expect(userService.findByEmail).not.toHaveBeenCalled();
      expect(userService.createFromGoogle).not.toHaveBeenCalled();
    });

    it('links the Google account to an existing user with the same email', async () => {
      googleTokenVerifier.verify.mockResolvedValue(googleProfile);
      userService.findByGoogleId.mockResolvedValue(null);
      userService.findByEmail.mockResolvedValue(buildUser({ name: 'Tom' }));

      await service.loginWithGoogle('id-token');

      expect(userService.update).toHaveBeenCalledWith('user-1', {
        googleId: 'google-123',
        name: 'Tom',
      });
      expect(userService.createFromGoogle).not.toHaveBeenCalled();
    });

    it('creates a new user when no account matches', async () => {
      googleTokenVerifier.verify.mockResolvedValue(googleProfile);
      userService.findByGoogleId.mockResolvedValue(null);
      userService.findByEmail.mockResolvedValue(null);
      userService.createFromGoogle.mockResolvedValue(
        buildUser({ id: 'user-2', password: null, googleId: 'google-123' }),
      );

      const result = await service.loginWithGoogle('id-token');

      expect(userService.createFromGoogle).toHaveBeenCalledWith(googleProfile);
      expect(result.user.id).toBe('user-2');
      // A device session is stored, the same as a password login.
      expect(sessionService.create).toHaveBeenCalledWith(
        expect.objectContaining({ userId: 'user-2' }),
      );
    });

    it('rejects a Google account whose email is not verified', async () => {
      googleTokenVerifier.verify.mockResolvedValue({
        ...googleProfile,
        emailVerified: false,
      });

      await expect(service.loginWithGoogle('id-token')).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
      expect(userService.findByGoogleId).not.toHaveBeenCalled();
      expect(userService.findByEmail).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('rejects password login for an account created through Google', async () => {
      userService.findByEmail.mockResolvedValue(
        buildUser({ password: null, googleId: 'google-123' }),
      );

      await expect(
        service.login({ email: 'tommy@gmail.com', password: 'anything' }),
      ).rejects.toThrow('Invalid email or password');
    });
  });

  describe('sessions', () => {
    it('starts a new session per login, with the session id in both tokens', async () => {
      googleTokenVerifier.verify.mockResolvedValue(googleProfile);
      userService.findByGoogleId.mockResolvedValue(buildUser());

      await service.loginWithGoogle('id-token');

      const [{ id: sessionId, refreshTokenHash }] = sessionService.create.mock
        .calls[0] as [{ id: string; refreshTokenHash: string }];
      expect(refreshTokenHash).toBe(hashRefreshToken('signed-token'));
      expect(jwtService.signAsync).toHaveBeenCalledWith(
        {
          sub: 'user-1',
          email: 'tommy@gmail.com',
          sid: sessionId,
          type: 'access',
        },
        expect.objectContaining({ secret: 'test-access-secret' }),
      );
      expect(jwtService.signAsync).toHaveBeenCalledWith(
        {
          sub: 'user-1',
          email: 'tommy@gmail.com',
          sid: sessionId,
          type: 'refresh',
        },
        expect.objectContaining({ secret: 'test-refresh-secret' }),
      );
      expect(sessionService.deleteExpiredForUser).toHaveBeenCalledWith(
        'user-1',
      );
    });
  });

  describe('refreshTokens', () => {
    beforeEach(() => {
      jwtService.verifyAsync.mockResolvedValue(refreshPayload);
    });

    it('rotates the session and returns new tokens', async () => {
      const storedHash = hashRefreshToken('old-refresh-token');
      sessionService.findById.mockResolvedValue(
        buildSession({ refreshTokenHash: storedHash }),
      );
      sessionService.rotate.mockResolvedValue(true);

      const tokens = await service.refreshTokens('old-refresh-token');

      expect(tokens).toEqual({
        accessToken: 'signed-token',
        refreshToken: 'signed-token',
      });
      expect(sessionService.rotate).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'session-1', currentHash: storedHash }),
      );
    });

    it('accepts a session hashed with argon2 once and moves it to SHA-256', async () => {
      const legacyHash = await hash('old-refresh-token');
      sessionService.findById.mockResolvedValue(
        buildSession({ refreshTokenHash: legacyHash }),
      );
      sessionService.rotate.mockResolvedValue(true);

      await service.refreshTokens('old-refresh-token');

      expect(sessionService.rotate).toHaveBeenCalledWith(
        expect.objectContaining({
          currentHash: legacyHash,
          nextHash: hashRefreshToken('signed-token'),
        }),
      );
    });

    it('rejects a token that is not the current one for its session', async () => {
      sessionService.findById.mockResolvedValue(
        buildSession({
          refreshTokenHash: hashRefreshToken('newer-refresh-token'),
        }),
      );

      await expect(
        service.refreshTokens('old-refresh-token'),
      ).rejects.toBeInstanceOf(UnauthorizedException);
      expect(sessionService.rotate).not.toHaveBeenCalled();
    });

    it('rejects a token whose session was logged out', async () => {
      sessionService.findById.mockResolvedValue(null);

      await expect(
        service.refreshTokens('old-refresh-token'),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('rejects an expired session', async () => {
      sessionService.findById.mockResolvedValue(
        buildSession({
          refreshTokenHash: hashRefreshToken('old-refresh-token'),
          expiresAt: new Date(Date.now() - 1000),
        }),
      );

      await expect(
        service.refreshTokens('old-refresh-token'),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('rejects an access token sent as a refresh token', async () => {
      jwtService.verifyAsync.mockResolvedValue({
        ...refreshPayload,
        type: 'access',
      });

      await expect(
        service.refreshTokens('access-token'),
      ).rejects.toBeInstanceOf(UnauthorizedException);
      expect(sessionService.findById).not.toHaveBeenCalled();
    });

    it('verifies refresh tokens with the refresh secret', async () => {
      sessionService.findById.mockResolvedValue(
        buildSession({
          refreshTokenHash: hashRefreshToken('old-refresh-token'),
        }),
      );
      sessionService.rotate.mockResolvedValue(true);

      await service.refreshTokens('old-refresh-token');

      expect(jwtService.verifyAsync).toHaveBeenCalledWith(
        'old-refresh-token',
        expect.objectContaining({ secret: 'test-refresh-secret' }),
      );
    });

    it('rejects a token issued before sessions existed', async () => {
      jwtService.verifyAsync.mockResolvedValue({
        sub: 'user-1',
        email: 'tommy@gmail.com',
      });

      await expect(
        service.refreshTokens('legacy-refresh-token'),
      ).rejects.toBeInstanceOf(UnauthorizedException);
      expect(sessionService.findById).not.toHaveBeenCalled();
    });

    it('rejects the loser of two concurrent refreshes', async () => {
      sessionService.findById.mockResolvedValue(
        buildSession({
          refreshTokenHash: hashRefreshToken('old-refresh-token'),
        }),
      );
      sessionService.rotate.mockResolvedValue(false);

      await expect(
        service.refreshTokens('old-refresh-token'),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });
  });

  describe('logout', () => {
    it('ends only the session the refresh token belongs to', async () => {
      jwtService.verifyAsync.mockResolvedValue(refreshPayload);

      await service.logout('refresh-token');

      expect(jwtService.verifyAsync).toHaveBeenCalledWith(
        'refresh-token',
        expect.objectContaining({ ignoreExpiration: true }),
      );
      expect(sessionService.deleteForUser).toHaveBeenCalledWith(
        'session-1',
        'user-1',
      );
    });

    it('succeeds without touching sessions for an invalid token', async () => {
      jwtService.verifyAsync.mockRejectedValue(new Error('invalid signature'));

      await expect(service.logout('garbage')).resolves.toEqual({
        message: 'Logged out successfully',
      });
      expect(sessionService.deleteForUser).not.toHaveBeenCalled();
    });
  });
});
