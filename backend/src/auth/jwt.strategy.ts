import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma.service';
import { SafeUser } from './types/safe-user.type';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private prisma: PrismaService,
    configService: ConfigService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET')
    });
  }

  async validate(payload: { id: string }): Promise<SafeUser> {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.id },
      include: {
        staffProfile: true,
        region: true,
        userBeneficiaryCategories: {
          include: {
            beneficiaryCategory: true
          }
        }
      }
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (user.status === 'REJECTED') {
      throw new UnauthorizedException('User account has been rejected');
    }

    const { passwordHash, verificationCode, ...safeUser } = user;
    return safeUser as SafeUser;
  }
}
