import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { UserService } from '@/user/user.service';
import { CreateUserDto } from '@/user/dto/create-user-dto';
import { LoginDto } from './dto/login.dto';
import { hash, verify } from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { GoogleTokenVerifier } from './google-token.verifier';
import { GoogleProfile } from './types/google';
import { SessionService } from './session.service';
import { AuthTokens, RefreshTokenPayload } from './types/token';

const ACCESS_TOKEN_TTL = '15m';
// Sliding window: every refresh pushes expiry out again, so a device stays
// signed in as long as the app is opened at least once in this period.
const REFRESH_TOKEN_TTL_DAYS = 30;
const DAY_IN_MS = 24 * 60 * 60 * 1000;

function getAccessSecret(): string {
  return process.env.JWT_SECRET || 'secretKey';
}

function getRefreshSecret(): string {
  return process.env.JWT_REFRESH_SECRET || 'refreshSecretKey';
}

function getSessionExpiry(): Date {
  return new Date(Date.now() + REFRESH_TOKEN_TTL_DAYS * DAY_IN_MS);
}

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly googleTokenVerifier: GoogleTokenVerifier,
    private readonly sessionService: SessionService,
  ) {}

  private toPublicUser(user: User) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, googleId, ...publicUser } = user;
    return publicUser;
  }

  private async generateTokens(
    userId: string,
    email: string,
    sessionId: string,
  ): Promise<AuthTokens> {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { sub: userId, email },
        { secret: getAccessSecret(), expiresIn: ACCESS_TOKEN_TTL },
      ),
      this.jwtService.signAsync(
        { sub: userId, email, sid: sessionId },
        {
          secret: getRefreshSecret(),
          expiresIn: `${REFRESH_TOKEN_TTL_DAYS}d`,
        },
      ),
    ]);

    return { accessToken, refreshToken };
  }

  // Each login (or signup) is a new device session with its own refresh token.
  private async startSession(user: User): Promise<AuthTokens> {
    const sessionId = randomUUID();
    const tokens = await this.generateTokens(user.id, user.email, sessionId);

    await this.sessionService.deleteExpiredForUser(user.id);
    await this.sessionService.create({
      id: sessionId,
      userId: user.id,
      refreshTokenHash: await hash(tokens.refreshToken),
      expiresAt: getSessionExpiry(),
    });

    return tokens;
  }

  private async verifyRefreshToken(
    refreshToken: string,
    options: { ignoreExpiration?: boolean } = {},
  ): Promise<RefreshTokenPayload | null> {
    try {
      const payload = await this.jwtService.verifyAsync<RefreshTokenPayload>(
        refreshToken,
        { secret: getRefreshSecret(), ...options },
      );
      // Tokens issued before sessions existed have no `sid`.
      return payload.sid ? payload : null;
    } catch {
      return null;
    }
  }

  async registerUser(createUserDto: CreateUserDto) {
    const existingUser = await this.userService.findByEmail(
      createUserDto.email,
    );
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const newUser = await this.userService.create(createUserDto);
    const tokens = await this.startSession(newUser);

    return {
      user: this.toPublicUser(newUser),
      ...tokens,
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.userService.findByEmail(loginDto.email);

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Accounts created through Google sign-in have no password.
    if (!user.password) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const passwordIsValid = await verify(user.password, loginDto.password);

    if (!passwordIsValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const tokens = await this.startSession(user);

    return {
      user: this.toPublicUser(user),
      ...tokens,
    };
  }

  async loginWithGoogle(credential: string) {
    const profile = await this.googleTokenVerifier.verify(credential);

    // Linking by email is only safe when Google vouches for the address.
    if (!profile.emailVerified) {
      throw new UnauthorizedException('Google account email is not verified');
    }

    const user = await this.findOrCreateGoogleUser(profile);
    const tokens = await this.startSession(user);

    return {
      user: this.toPublicUser(user),
      ...tokens,
    };
  }

  private async findOrCreateGoogleUser(profile: GoogleProfile) {
    const linkedUser = await this.userService.findByGoogleId(profile.googleId);
    if (linkedUser) {
      return linkedUser;
    }

    const existingUser = await this.userService.findByEmail(profile.email);
    if (existingUser) {
      return this.userService.update(existingUser.id, {
        googleId: profile.googleId,
        // Keep a name the user already set; fill it in only when missing.
        name: existingUser.name ?? profile.name,
      });
    }

    return this.userService.createFromGoogle(profile);
  }

  // Ends only the session this refresh token belongs to; other devices stay
  // signed in. An expired token still identifies its session, so it is
  // accepted here. Unknown tokens are ignored: the device is logged out anyway.
  async logout(refreshToken: string) {
    const payload = await this.verifyRefreshToken(refreshToken, {
      ignoreExpiration: true,
    });

    if (payload) {
      await this.sessionService.deleteForUser(payload.sid, payload.sub);
    }

    return { message: 'Logged out successfully' };
  }

  async refreshTokens(refreshToken: string): Promise<AuthTokens> {
    const payload = await this.verifyRefreshToken(refreshToken);
    if (!payload) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const session = await this.sessionService.findById(payload.sid);
    const isUsable =
      session !== null &&
      session.userId === payload.sub &&
      session.expiresAt > new Date() &&
      (await verify(session.refreshTokenHash, refreshToken));

    if (!isUsable) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const tokens = await this.generateTokens(
      payload.sub,
      payload.email,
      payload.sid,
    );
    const rotated = await this.sessionService.rotate({
      id: session.id,
      currentHash: session.refreshTokenHash,
      nextHash: await hash(tokens.refreshToken),
      expiresAt: getSessionExpiry(),
    });

    if (!rotated) {
      // Another refresh with this same token won the race.
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    return tokens;
  }
}
