import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { User } from '@prisma/client';
import { UserService } from '@/user/user.service';
import { AuthService } from './auth.service';
import { GoogleTokenVerifier } from './google-token.verifier';
import { GoogleProfile } from './types/google';

// @nestjs/jwt ships ESM that Jest's CommonJS runtime can't parse, and the
// service only needs the class as an injection token here.
jest.mock('@nestjs/jwt', () => ({ JwtService: class JwtService {} }));

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
    refreshTokenHash: null,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    ...overrides,
  };
}

describe('AuthService', () => {
  let service: AuthService;
  const userService = {
    findByGoogleId: jest.fn(),
    findByEmail: jest.fn(),
    createFromGoogle: jest.fn(),
    update: jest.fn(),
  };
  const googleTokenVerifier = { verify: jest.fn() };
  const jwtService = { signAsync: jest.fn() };

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
      expect(result.user).not.toHaveProperty('refreshTokenHash');
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
      // The refresh token hash is stored, the same as a password login.
      expect(userService.update).toHaveBeenCalledWith('user-2', {
        refreshTokenHash: expect.any(String) as string,
      });
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
});
