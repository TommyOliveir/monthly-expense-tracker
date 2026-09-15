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
    // 1. Check if user already exists
    const existingUser = await this.userService.findByEmail(
      createUserDto.email,
    );
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // 2. Create the new user (UserService handles hashing password via argon2)
    const newUser = await this.userService.create(createUserDto);

    // 3. Exclude password hash from returned object
    const { password, ...result } = newUser;
    return result;
  }

  async login(loginDto: LoginDto) {
    // 1. Find user
    const user = await this.userService.findByEmail(loginDto.email);

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // 2. Compare password with Argon2 hash
    const passwordIsValid = await verify(user.password, loginDto.password);

    if (!passwordIsValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // 3. Create JWT payload
    const payload = {
      sub: user.id,
      email: user.email,
    };

    // 4. Generate token
    const accessToken = await this.jwtService.signAsync(payload);

    // 5. Don't return password
    const { password, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      accessToken,
    };
  }
}
