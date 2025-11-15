// src/auth/jwt.strategy.ts (или путь к вашему стратегии)
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma.service'; // Убедитесь, что путь правильный
import { NeedApprovalException } from './exceptions/need-approval.exception';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private prisma: PrismaService, // Используем PrismaService
    configService: ConfigService // Используем ConfigService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // Убедитесь, что токен извлекается правильно
      ignoreExpiration: false, // Важно: не игнорируем expiration
      secretOrKey: configService.get('JWT_SECRET') // Убедитесь, что секрет совпадает
    });
  }

  async validate(payload: { id: string }) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.id },
      select: {
        // Выбирайте только нужные поля, исключая passwordHash
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        status: true,
        // ... другие нужные поля
        passwordHash: false // Исключить!
      }
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (user.status === 'REGISTRATION_PENDING') {
      throw new NeedApprovalException();
    }

    if (user.status === 'REJECTED') {
      throw new UnauthorizedException('User rejected');
    }

    console.log('validate user:', user);
    return user;
  }
}
