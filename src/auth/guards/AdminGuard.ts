import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { RequestUser } from '../types/types';

type Role = 'ADMIN' | 'MANAGER' | 'USER';

declare module 'express-serve-static-core' {
  interface Request {
    user?: RequestUser;
  }
}

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(ctx: ExecutionContext): boolean {
    // Если не прод — ничего не ограничиваем (или верни true без условий).
    if (process.env.NODE_ENV !== 'production') return true;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const req = ctx.switchToHttp().getRequest();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const user = req.user as { id: string; roles?: Role[] } | undefined;

    if (!user?.roles?.length) {
      throw new ForbiddenException('Access denied: no roles in prod');
    }

    const isAdmin = user.roles.includes('ADMIN');
    if (!isAdmin) {
      throw new ForbiddenException(
        'Access denied: only admin allowed in production',
      );
    }

    return true;
  }
}
