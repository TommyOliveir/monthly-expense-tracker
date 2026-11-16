import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '@/user/dto/create-user-dto';
import { LoginDto } from './dto/login.dto';
import { GoogleLoginDto } from './dto/google-login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { GetUser } from './decorators/get-user.decorator';
import { IAuthenticatedUser } from './types/user';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // Returns the caller decoded from the access token.
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@GetUser() user: IAuthenticatedUser) {
    return user;
  }

  @Post('signup')
  signup(@Body() createUserDto: CreateUserDto) {
    return this.authService.registerUser(createUserDto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('google')
  loginWithGoogle(@Body() googleLoginDto: GoogleLoginDto) {
    return this.authService.loginWithGoogle(googleLoginDto.credential);
  }

  // Public: the refresh token identifies the device session to end, so logout
  // still works after the access token has expired.
  @HttpCode(HttpStatus.OK)
  @Post('logout')
  logout(@Body() { refresh_token }: RefreshTokenDto) {
    return this.authService.logout(refresh_token);
  }

  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  refresh(@Body() { refresh_token }: RefreshTokenDto) {
    return this.authService.refreshTokens(refresh_token);
  }
}
