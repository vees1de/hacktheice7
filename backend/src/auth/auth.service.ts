import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
  NotFoundException
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { hash, verify } from 'argon2';
import { Response } from 'express';
import { UserService } from '../user/user.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { PrismaService } from '../prisma.service';

@Injectable()
export class AuthService {
  EXPIRE_DAY_REFRESH_TOKEN = 7;
  REFRESH_TOKEN_NAME = 'refreshToken';

  constructor(
    private jwt: JwtService,
    private userService: UserService,
    private prisma: PrismaService
  ) {}

  async register(dto: RegisterDto) {
    // Проверяем, существует ли пользователь с таким телефоном или СНИЛС
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [{ phone: dto.phone }, { snils: dto.snils }]
      }
    });

    if (existingUser) {
      throw new BadRequestException(
        'User with this phone or SNILS already exists'
      );
    }

    const hashedPassword = await hash(dto.password);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash: hashedPassword,
        firstName: dto.firstName,
        lastName: dto.lastName,
        patronymic: dto.patronymic,
        dateOfBirth: dto.dateOfBirth,
        phone: dto.phone,
        snils: dto.snils,
        regionId: dto.regionId,
        authProvider: 'email',
        consentGiven: true,
        consentDate: new Date(),
        verificationCode: '4444', // Мок-код для подтверждения
        status: 'REGISTRATION_PENDING'
      }
    });

    // Отправка SMS с кодом подтверждения (в реальности)
    // this.smsService.sendVerificationCode(dto.phone, '4444');

    return { userId: user.id };
  }

  async verifyPhone(phone: string) {
    const user = await this.prisma.user.findUnique({
      where: { phone }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.status !== 'REGISTRATION_PENDING') {
      throw new BadRequestException(
        'Phone already verified or user in another status'
      );
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        status: 'PHONE_VERIFIED',
        verificationCode: null // Удаляем код после подтверждения
      }
    });

    // В реальности здесь отправлялось бы уведомление админам о новом пользователе на подтверждение
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { phone: dto.phone }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedException(
        'User account is not active yet. Please wait for admin approval.'
      );
    }

    const isValid = await verify(user.passwordHash, dto.password);
    if (!isValid) {
      throw new UnauthorizedException('Invalid password');
    }

    const { passwordHash, verificationCode, ...safeUser } = user;
    const tokens = this.issueTokens(user.id);

    return {
      user: safeUser,
      ...tokens
    };
  }

  async refreshTokens(refreshToken: string) {
    try {
      const payload = await this.jwt.verifyAsync(refreshToken);
      const user = await this.prisma.user.findUnique({
        where: { id: payload.id }
      });

      if (!user || user.status !== 'ACTIVE') {
        throw new UnauthorizedException('User not found or not active');
      }

      const { passwordHash, verificationCode, ...safeUser } = user;
      const tokens = this.issueTokens(user.id);

      return {
        user: safeUser,
        ...tokens
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        region: true,
        userBeneficiaryCategories: {
          include: {
            beneficiaryCategory: true
          }
        }
      }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { passwordHash, verificationCode, ...safeUser } = user;
    return safeUser;
  }

  issueTokens(userId: string) {
    const payload = { id: userId };

    const accessToken = this.jwt.sign(payload, {
      expiresIn: '1h'
    });

    const refreshToken = this.jwt.sign(payload, {
      expiresIn: '7d'
    });

    return { accessToken, refreshToken };
  }

  addRefreshTokenToResponse(res: Response, refreshToken: string) {
    const expiresIn = new Date();
    expiresIn.setDate(expiresIn.getDate() + this.EXPIRE_DAY_REFRESH_TOKEN);

    res.cookie(this.REFRESH_TOKEN_NAME, refreshToken, {
      httpOnly: true,
      domain: process.env.DOMAIN || 'localhost',
      expires: expiresIn,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'lax' : 'none'
    });
  }

  removeRefreshTokenFromResponse(res: Response) {
    res.cookie(this.REFRESH_TOKEN_NAME, '', {
      httpOnly: true,
      domain: process.env.DOMAIN || 'localhost',
      expires: new Date(0),
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'lax' : 'none'
    });
  }
}
