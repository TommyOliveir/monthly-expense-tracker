import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    // Add custom logic here if needed (e.g., checking custom headers or metadata)
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any) {
    // Throw an explicit exception if JWT validation fails or user isn't found
    if (err || !user) {
      throw err || new UnauthorizedException('Invalid or expired token');
    }
    return user;
  }
}
