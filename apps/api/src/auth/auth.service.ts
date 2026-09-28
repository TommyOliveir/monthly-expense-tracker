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

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async registerUser(createUserDto: CreateUserDto) {
    // 1. Check if email exists
    const existingUser = await this.userService.findByEmail(
      createUserDto.email,
    );
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // 2. Create new user (UserService handles single Argon2 hashing + category seeding)
    const newUser = await this.userService.create(createUserDto);

    // 3. Create JWT payload
    const payload = {
      sub: newUser.id,
      email: newUser.email,
    };

    // 4. Generate token
    const accessToken = await this.jwtService.signAsync(payload);

    // 5. Omit password hash from response
    const { password, ...userWithoutPassword } = newUser;

    return {
      user: userWithoutPassword,
      accessToken,
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.userService.findByEmail(loginDto.email);

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Verify plaintext login password against stored Argon2 hash
    const passwordIsValid = await verify(user.password, loginDto.password);

    if (!passwordIsValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const payload = {
      sub: user.id,
      email: user.email,
    };

    const accessToken = await this.jwtService.signAsync(payload);
    const { password, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      accessToken,
    };
  }
}
