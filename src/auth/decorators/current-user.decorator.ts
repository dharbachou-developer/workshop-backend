import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { RequestUser } from '../types/types';

export const CurrentUser = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): RequestUser | undefined => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const req = ctx.switchToHttp().getRequest();
    return req.user as RequestUser | undefined;
  },
);
