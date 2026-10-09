import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from '../user/user.service';
import { CreateUserDto } from 'src/user/dto/create-user-dto';
import { LoginDto } from './dto/login.dto';
import { verify } from 'argon2';
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

  async registerUser(createUserDto: CreateUserDto) {
    const existingUser = await this.userService.findByEmail(
      createUserDto.email,
    );
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const newUser = await this.userService.create(createUserDto);
    const tokens = await this.generateTokens(newUser.id, newUser.email);

    const { ...userWithoutPassword } = newUser;

    return {
      user: userWithoutPassword,
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
    const { ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      ...tokens,
    };
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
