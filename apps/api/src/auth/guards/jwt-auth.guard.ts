import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { IAuthenticatedUser } from '../types/user';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    // Add custom logic here if needed (e.g., checking custom headers or metadata)
    return super.canActivate(context);
  }

  handleRequest<TUser = IAuthenticatedUser>(
    err: unknown,
    user: TUser | false | null | undefined,
  ): TUser {
    if (err || !user) {
      throw err instanceof Error
        ? err
        : new UnauthorizedException('Invalid or expired token');
    }

    return user;
  }
}
