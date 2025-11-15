import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { STAFF_ROLES_KEY } from '../decorators/staff-roles.decorator';
import { StaffRole } from '@prisma/client';

@Injectable()
export class StaffRolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<StaffRole[]>(
      STAFF_ROLES_KEY,
      [context.getHandler(), context.getClass()]
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user?.staffProfile) {
      throw new ForbiddenException('Недостаточно прав для доступа');
    }

    if (!requiredRoles.includes(user.staffProfile.role)) {
      throw new ForbiddenException('Доступ запрещен');
    }

    return true;
  }
}
