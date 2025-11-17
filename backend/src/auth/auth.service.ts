import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
  NotFoundException
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { hash, verify } from 'argon2';
import { randomBytes } from 'crypto';
import { UserService } from '../user/user.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { PrismaService } from '../prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private jwt: JwtService,
    private userService: UserService,
    private prisma: PrismaService
  ) {}

  async getUserById(userId: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
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
        throw new NotFoundException('User not found');
      }

      const { passwordHash, verificationCode, ...safeUser } = user;
      return {
        ...safeUser,
        commercialOffersAvailable: Boolean(user.isEsiaVerified)
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to fetch user');
    }
  }

  async register(dto: RegisterDto) {
    try {
      const existingUser = await this.prisma.user.findFirst({
        where: {
          OR: [{ phone: dto.phone }]
        }
      });

      if (existingUser) {
        throw new BadRequestException(
          'User with this email, phone or SNILS already exists'
        );
      }

      const hashedPassword = await hash(dto.password);

      const user = await this.prisma.user.create({
        data: {
          email: dto.email || null,
          passwordHash: hashedPassword,
          firstName: dto.firstName,
          lastName: dto.lastName,
          patronymic: dto.patronymic,
          dateOfBirth: dto.dateOfBirth,
          phone: dto.phone,
          snils: dto.snils || null,
          regionId: dto.regionId,
          authProvider: 'email',
          consentGiven: true,
          consentDate: new Date(),
          verificationCode: '4444',
          status: 'PENDING',
          onboardingStep: 'SMS_VERIFICATION'
        }
      });

      // Отправка SMS с кодом подтверждения (в реальности)
      // this.smsService.sendVerificationCode(dto.phone, '4444');

      return { userId: user.id };
    } catch (error) {
      if (error.code === 'P2002') {
        throw new BadRequestException(
          'Unique constraint violation: email, phone or SNILS already exists'
        );
      }
      throw error;
    }
  }

  async verifyPhone(phone: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { phone }
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      if (user.status !== 'PENDING') {
        throw new BadRequestException(
          'Phone already verified or user in another status'
        );
      }

      if (!user.verificationCode) {
        throw new BadRequestException(
          'No verification code found for this user'
        );
      }

      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          verificationCode: null,
          onboardingStep: 'ESIA_AUTH',
          status: 'ACTIVE',
          isVerified: true,
          isEsiaVerified: false
        }
      });

      // Здесь можно инициировать следующий шаг — авторизацию через ЕСИА
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new BadRequestException('Verification failed');
    }
  }

  async login(dto: LoginDto) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { phone: dto.phone },
        include: {
          staffProfile: true
        }
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      if (user.onboardingStep === 'SMS_VERIFICATION') {
        throw new UnauthorizedException(
          'Телефон не подтвержден. Введите SMS-код, чтобы продолжить.'
        );
      }

      if (user.status !== 'ACTIVE') {
        throw new UnauthorizedException('User status does not allow login');
      }

      const isValid = await verify(user.passwordHash, dto.password);
      if (!isValid) {
        throw new UnauthorizedException('Invalid password');
      }

      const { passwordHash, verificationCode, ...safeUser } = user;
      const tokens = this.issueTokens(user.id);

      return {
        user: {
          ...safeUser,
          commercialOffersAvailable: Boolean(user.isEsiaVerified)
        },
        ...tokens
      };
    } catch (error) {
      if (
        error instanceof UnauthorizedException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new UnauthorizedException('Login failed');
    }
  }

  async refreshTokens(refreshToken: string) {
    try {
      if (!refreshToken) {
        throw new UnauthorizedException('Refresh token not found');
      }

      const payload = await this.jwt.verifyAsync(refreshToken);
      const user = await this.prisma.user.findUnique({
        where: { id: payload.id },
        include: {
          staffProfile: true
        }
      });

      if (!user || user.status !== 'ACTIVE') {
        throw new UnauthorizedException('User not found or not active');
      }

      const { passwordHash, verificationCode, ...safeUser } = user;
      const tokens = this.issueTokens(user.id);

      return {
        user: {
          ...safeUser,
          commercialOffersAvailable: Boolean(user.isEsiaVerified)
        },
        ...tokens
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  issueTokens(userId: string): { accessToken: string; refreshToken: string } {
    if (!userId) {
      throw new BadRequestException('User ID is required for token issuance');
    }

    const payload = { id: userId };

    const accessToken = this.jwt.sign(payload, {
      expiresIn: '1h'
    });

    const refreshToken = this.jwt.sign(payload, {
      expiresIn: '7d'
    });

    return { accessToken, refreshToken };
  }

  async createShareToken(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user || user.status !== 'ACTIVE') {
      throw new NotFoundException('User not found or not active');
    }

    const token = randomBytes(24).toString('hex');
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes TTL

    await this.prisma.authToken.create({
      data: {
        token,
        type: 'share_profile',
        expiresAt,
        userId: user.id,
        used: false
      }
    });

    return { token, expiresAt };
  }

  async getUserFromShareToken(hashToken: string) {
    const authToken = await this.prisma.authToken.findUnique({
      where: { token: hashToken },
      include: {
        user: {
          include: {
            region: {
              select: {
                id: true,
                name: true,
                code: true
              }
            },
            userBeneficiaryCategories: {
              where: { confirmed: true },
              include: {
                beneficiaryCategory: {
                  select: {
                    id: true,
                    name: true,
                    title: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!authToken || authToken.type !== 'share_profile') {
      throw new UnauthorizedException('Invalid token');
    }

    if (authToken.used || authToken.expiresAt < new Date()) {
      throw new UnauthorizedException('Token expired or already used');
    }

    if (!authToken.user || authToken.user.status !== 'ACTIVE') {
      throw new UnauthorizedException('User is not active');
    }

    await this.prisma.authToken.update({
      where: { id: authToken.id },
      data: { used: true }
    });

    const user = authToken.user;

    const age = this.calculateAge(new Date(user.dateOfBirth));

    return {
      id: user.id,
      fullName: [user.lastName, user.firstName, user.patronymic]
        .filter(Boolean)
        .join(' '),
      phone: user.phone,
      age,
      region: user.region,
      benefits: user.userBeneficiaryCategories.map(
        ({ beneficiaryCategory }) => ({
          id: beneficiaryCategory.id,
          code: beneficiaryCategory.name,
          title: beneficiaryCategory.title
        })
      )
    };
  }

  private calculateAge(dateOfBirth: Date): number {
    const today = new Date();
    let age = today.getFullYear() - dateOfBirth.getFullYear();
    const monthDiff = today.getMonth() - dateOfBirth.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < dateOfBirth.getDate())
    ) {
      age--;
    }

    return Math.max(age, 0);
  }
}
