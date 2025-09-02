import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}

  canActivate(ctx: ExecutionContext): boolean {
    const req = ctx.switchToHttp().getRequest<Request & { user?: any }>();

    const token = this.getFromCookies(req, 'token');

    console.log('token', token);
    if (!token) {
      throw new UnauthorizedException('Missing access token');
    }

    try {
      const payload = jwt.verify(token, 'dev_secret') as jwt.JwtPayload;

      if (!payload) {
        throw new UnauthorizedException('Invalid token payload');
      }

      req.user = payload;
      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }

    return false;
  }

  private getFromCookies(req: Request, name: string): string | null {
    // для Express не забудь app.use(cookieParser()) в main.ts
    // @ts-expect-error
    return req.cookies?.[name] ?? null;
  }
}
