import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from '../user/user.service';
import { CreateUserDto } from 'src/user/dto/create-user-dto';
import { LoginDto } from './dto/login.dto';
import { hash, verify } from 'argon2';
import { JwtService } from '@nestjs/jwt';
interface JwtPayload {
  sub: string;
  email: string;
  iat?: number;
  exp?: number;
}
@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  // Helper method to sign both tokens
  private async generateTokens(userId: string, email: string) {
    const payload = { sub: userId, email };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_SECRET || 'secretKey',
        // expiresIn: '15m',// Short-lived access token put this back with working on refersh token
        expiresIn: '1d',
      }),
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_REFRESH_SECRET || 'refreshSecretKey',
        expiresIn: '7d', // Long-lived refresh token
      }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  // 2. CREATE THE HELPER METHOD HERE
  private async updateRefreshTokenHash(
    userId: string,
    refreshToken: string | null,
  ) {
    // If refreshToken is provided, hash it. If null (during logout), keep it null.
    const refreshTokenHash = refreshToken ? await hash(refreshToken) : null;

    // Call the update method in your UserService
    await this.userService.update(userId, { refreshTokenHash });
  }

  async registerUser(createUserDto: CreateUserDto) {
    const existingUser = await this.userService.findByEmail(
      createUserDto.email,
    );
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const newUser = await this.userService.create(createUserDto);
    const tokens = await this.generateTokens(newUser.id, newUser.email);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, refreshTokenHash, ...userWithoutSecrets } = newUser;

    return {
      user: userWithoutSecrets,
      ...tokens,
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.userService.findByEmail(loginDto.email);

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const passwordIsValid = await verify(user.password, loginDto.password);

    if (!passwordIsValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const tokens = await this.generateTokens(user.id, user.email);

    // ⚠️ CRITICAL MISSING STEP: Hash and save the refresh token to the database
    await this.updateRefreshTokenHash(user.id, tokens.refreshToken);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, refreshTokenHash, ...userWithoutSecrets } = user;

    return {
      user: userWithoutSecrets,
      ...tokens,
    };
  }
  // auth.service.ts
  async logout(userId: string) {
    // Clear the stored refresh token hash in database
    await this.userService.update(userId, { refreshTokenHash: null });

    return { message: 'Logged out successfully' };
  }

  async refreshTokens(refreshToken: string) {
    try {
      // 1. Verify refresh token signature & expiration
      const payload = await this.jwtService.verifyAsync<JwtPayload>(
        refreshToken,
        {
          secret: process.env.JWT_REFRESH_SECRET || 'refreshSecretKey',
        },
      );

      // 2. Fetch fresh user data
      const user = await this.userService.findByEmail(payload.email);
      if (!user) {
        throw new UnauthorizedException('Access Denied');
      }

      // 3. Issue fresh tokens
      return await this.generateTokens(user.id, user.email);
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }
}
