import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '@/user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies/jwt.strategy';
import { ConfigModule } from '@nestjs/config';
import { GoogleTokenVerifier } from './google-token.verifier';
import { SessionService } from './session.service';
import { JWT_SECRETS, loadJwtSecrets } from './jwt-secrets';
@Module({
  imports: [
    UserModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({}), // We will pass secrets dynamically in AuthService
    ConfigModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    GoogleTokenVerifier,
    SessionService,
    // Throws during startup when a secret is missing, so the API never boots
    // with a guessable signing key.
    { provide: JWT_SECRETS, useFactory: () => loadJwtSecrets() },
  ],
  exports: [AuthService, JwtModule, PassportModule],
})
export class AuthModule {}
