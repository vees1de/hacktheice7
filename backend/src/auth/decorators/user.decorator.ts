import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { SafeUser } from '../types/safe-user.type';

export const CurrentUser = createParamDecorator(
  (data: keyof SafeUser | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user: SafeUser | undefined = request.user;

    return data ? user?.[data] : user;
  }
);
