import {
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { OAuth2Client, TokenPayload } from 'google-auth-library';
import { GoogleProfile } from './types/google';

@Injectable()
export class GoogleTokenVerifier {
  private readonly logger = new Logger(GoogleTokenVerifier.name);
  private readonly client = new OAuth2Client();

  async verify(idToken: string): Promise<GoogleProfile> {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) {
      throw new InternalServerErrorException(
        'Google sign-in is not configured',
      );
    }

    let payload: TokenPayload | undefined;
    try {
      // Checks the signature against Google's public keys, the expiry,
      // the issuer, and that the token was minted for our client ID.
      const ticket = await this.client.verifyIdToken({
        idToken,
        audience: clientId,
      });
      payload = ticket.getPayload();
    } catch (error) {
      this.logger.warn(`Rejected Google ID token: ${String(error)}`);
      throw new UnauthorizedException('Invalid Google credential');
    }

    if (!payload?.sub || !payload.email) {
      throw new UnauthorizedException('Invalid Google credential');
    }

    return {
      googleId: payload.sub,
      email: payload.email.trim().toLowerCase(),
      emailVerified: payload.email_verified === true,
      name: payload.name ?? null,
    };
  }
}
