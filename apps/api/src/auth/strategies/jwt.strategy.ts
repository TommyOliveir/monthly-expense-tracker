import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { IAuthenticatedUser } from '@/auth/types/user';
import { AccessTokenPayload } from '@/auth/types/token';
import { JWT_SECRETS, JwtSecrets } from '@/auth/jwt-secrets';
import { SessionService } from '@/auth/session.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(JWT_SECRETS) secrets: JwtSecrets,
    private readonly sessionService: SessionService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secrets.accessSecret,
    });
  }

  // Runs after the signature and expiry checks. The session lookup is one
  // primary-key query, and it means a logout or deleted account takes effect
  // on the next request instead of when the 15-minute token runs out.
  async validate(payload: AccessTokenPayload): Promise<IAuthenticatedUser> {
    // Tokens issued before `sid`/`type` existed get a 401; the web client
    // then refreshes and receives one that has them.
    if (payload.type !== 'access' || !payload.sid) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    const session = await this.sessionService.findById(payload.sid);
    const isActive =
      session !== null &&
      session.userId === payload.sub &&
      session.expiresAt > new Date();

    if (!isActive) {
      throw new UnauthorizedException('Session has ended');
    }

    return {
      id: payload.sub,
      email: payload.email,
    };
  }
}
