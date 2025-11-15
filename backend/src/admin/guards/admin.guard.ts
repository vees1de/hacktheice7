import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException
} from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(
    context: ExecutionContext
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    console.log(user);

    if (!user) {
      throw new UnauthorizedException('User not authenticated');
    }

    if (!user.email.endsWith('@admin.ru')) {
      throw new ForbiddenException('Admin access required');
    }

    return true;
  }
}
