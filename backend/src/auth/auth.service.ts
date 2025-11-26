import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
  NotFoundException
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  generateAuthenticationOptions,
  generateRegistrationOptions,
  verifyAuthenticationResponse,
  verifyRegistrationResponse
} from '@simplewebauthn/server';
import { isoBase64URL } from '@simplewebauthn/server/helpers';
import {
  AuthenticationResponseJSON,
  AuthenticatorTransportFuture,
  RegistrationResponseJSON
} from '@simplewebauthn/types';
import { hash, verify } from 'argon2';
import { randomBytes } from 'crypto';
import { UserService } from '../user/user.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { PrismaService } from '../prisma.service';

type PendingRegistrationData = {
  firstName: string;
  lastName: string;
  patronymic?: string | null;
  dateOfBirth: string;
  phone: string;
  regionId: string;
  email?: string | null;
  snils?: string | null;
  passwordHash: string;
};

@Injectable()
export class AuthService {
  constructor(
    private jwt: JwtService,
    private userService: UserService,
    private prisma: PrismaService,
    private config: ConfigService
  ) {}

  private get rpID(): string {
    const rpId = this.config.get<string>('WEBAUTHN_RP_ID');
    if (rpId) return rpId;

    try {
      const origin = this.expectedOrigin;
      return new URL(origin).hostname;
    } catch {
      return 'localhost';
    }
  }

  private get rpName(): string {
    return this.config.get<string>('WEBAUTHN_RP_NAME') ?? 'Lasso App';
  }

  private get expectedOrigin(): string {
    return (
      this.config.get<string>('WEBAUTHN_ORIGIN') ??
      this.config.get<string>('FRONTEND_URL') ??
      'http://localhost:3000'
    );
  }

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
          phone: dto.phone
        }
      });

      if (existingUser) {
        throw new BadRequestException(
          'User with this email, phone or SNILS already exists'
        );
      }

      const dateOfBirth = new Date(dto.dateOfBirth);
      if (isNaN(dateOfBirth.getTime())) {
        throw new BadRequestException('Invalid date of birth');
      }

      const hashedPassword = await hash(dto.password);
      const verificationCode = '4444';
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
      const pendingData: PendingRegistrationData = {
        firstName: dto.firstName,
        lastName: dto.lastName,
        patronymic: dto.patronymic || null,
        phone: dto.phone,
        regionId: dto.regionId,
        email: dto.email || null,
        snils: dto.snils || null,
        dateOfBirth: dateOfBirth.toISOString(),
        passwordHash: hashedPassword
      };

      await this.prisma.registrationRequest.upsert({
        where: { phone: dto.phone },
        update: {
          data: pendingData,
          verificationCode,
          expiresAt
        },
        create: {
          phone: dto.phone,
          data: pendingData,
          verificationCode,
          expiresAt
        }
      });

      // Отправка SMS с кодом подтверждения (в реальности)
      // this.smsService.sendVerificationCode(dto.phone, verificationCode);

      return { phone: dto.phone };
    } catch (error) {
      if (error.code === 'P2002') {
        throw new BadRequestException(
          'Unique constraint violation: email, phone or SNILS already exists'
        );
      }
      throw error;
    }
  }

  async verifyPhone(phone: string, code: string) {
    try {
      const request = await this.prisma.registrationRequest.findUnique({
        where: { phone }
      });

      if (!request) {
        throw new NotFoundException('Registration request not found');
      }

      if (request.verificationCode !== code) {
        throw new BadRequestException('Invalid verification code');
      }

      if (request.expiresAt < new Date()) {
        throw new BadRequestException('Verification code expired');
      }

      const pendingData = request.data as PendingRegistrationData;

      if (!pendingData?.passwordHash) {
        throw new BadRequestException('Incorrect registration data');
      }

      const existingUser = await this.prisma.user.findFirst({
        where: { phone }
      });

      if (existingUser) {
        throw new BadRequestException('User with this phone already exists');
      }

      await this.prisma.user.create({
        data: {
          passwordHash: pendingData.passwordHash,
          firstName: pendingData.firstName,
          lastName: pendingData.lastName,
          patronymic: pendingData.patronymic || null,
          dateOfBirth: new Date(pendingData.dateOfBirth),
          phone,
          regionId: pendingData.regionId,
          email: pendingData.email || null,
          snils: pendingData.snils || null,
          authProvider: 'email',
          consentGiven: true,
          consentDate: new Date(),
          onboardingStep: 'ESIA_AUTH',
          status: 'ACTIVE',
          isVerified: true,
          isEsiaVerified: false
        }
      });

      await this.prisma.registrationRequest.delete({
        where: { id: request.id }
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
        result: true,
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

  async getWebauthnRegistrationOptions(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const existingCredentials = await this.prisma.webAuthnCredential.findMany({
      where: { userId }
    });

    const options = await generateRegistrationOptions({
      rpName: this.rpName,
      rpID: this.rpID,
      userName: user.phone,
      userID: Buffer.from(user.id, 'utf-8'),
      userDisplayName: [user.firstName, user.lastName].filter(Boolean).join(' '),
      attestationType: 'none',
      authenticatorSelection: {
        userVerification: 'preferred',
        residentKey: 'preferred',
        authenticatorAttachment: 'platform'
      },
      excludeCredentials: existingCredentials.map(cred => ({
        id: cred.credentialId,
        transports: (cred.transports as AuthenticatorTransportFuture[]) ?? undefined
      }))
    });

    await this.storeChallenge(userId, 'webauthn_registration', options.challenge);
    return options;
  }

  async verifyWebauthnRegistration(
    userId: string,
    response: RegistrationResponseJSON
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const challenge = await this.consumeChallenge(
      userId,
      'webauthn_registration'
    );

    const verification = await verifyRegistrationResponse({
      response,
      expectedChallenge: challenge.token,
      expectedOrigin: this.expectedOrigin,
      expectedRPID: this.rpID,
      requireUserVerification: true
    });

    if (!verification.verified || !verification.registrationInfo) {
      throw new UnauthorizedException('Biometric verification failed');
    }

    const {
      credentialID,
      credentialPublicKey,
      counter,
      credentialDeviceType,
      credentialBackedUp
    } = verification.registrationInfo;

    const credentialId =
      typeof credentialID === 'string'
        ? credentialID
        : isoBase64URL.fromBuffer(credentialID);
    const publicKey =
      typeof credentialPublicKey === 'string'
        ? credentialPublicKey
        : isoBase64URL.fromBuffer(credentialPublicKey);
    const transports =
      response.response?.transports && Array.isArray(response.response.transports)
        ? response.response.transports
        : [];

    await this.prisma.webAuthnCredential.upsert({
      where: { credentialId },
      update: {
        publicKey,
        counter,
        deviceType: credentialDeviceType,
        backedUp: credentialBackedUp,
        transports
      },
      create: {
        credentialId,
        publicKey,
        counter,
        deviceType: credentialDeviceType,
        backedUp: credentialBackedUp,
        transports,
        userId: user.id
      }
    });

    await this.prisma.authToken.update({
      where: { id: challenge.id },
      data: { used: true }
    });

    return { verified: true };
  }

  async getWebauthnLoginOptions(phone: string) {
    const user = await this.prisma.user.findUnique({
      where: { phone }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedException('User status does not allow login');
    }

    const authenticators = await this.prisma.webAuthnCredential.findMany({
      where: { userId: user.id }
    });

    if (!authenticators.length) {
      throw new BadRequestException(
        'Biometric login is not configured for this account'
      );
    }

    const options = await generateAuthenticationOptions({
      rpID: this.rpID,
      userVerification: 'preferred',
      allowCredentials: authenticators.map(cred => ({
        id: cred.credentialId,
        transports: (cred.transports as AuthenticatorTransportFuture[]) ?? undefined
      }))
    });

    await this.storeChallenge(user.id, 'webauthn_login', options.challenge);

    return {
      options,
      displayName: [user.firstName, user.lastName].filter(Boolean).join(' '),
      phone: user.phone
    };
  }

  async verifyWebauthnLogin(
    phone: string,
    response: AuthenticationResponseJSON
  ) {
    const user = await this.prisma.user.findUnique({
      where: { phone },
      include: {
        staffProfile: true
      }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedException('User status does not allow login');
    }

    const authenticator = await this.prisma.webAuthnCredential.findUnique({
      where: { credentialId: response.id }
    });

    if (!authenticator || authenticator.userId !== user.id) {
      throw new UnauthorizedException(
        'Biometric key is not linked to this account'
      );
    }

    const challenge = await this.consumeChallenge(user.id, 'webauthn_login');

    const verification = await verifyAuthenticationResponse({
      response,
      expectedChallenge: challenge.token,
      expectedOrigin: this.expectedOrigin,
      expectedRPID: this.rpID,
      authenticator: {
        credentialID: authenticator.credentialId,
        credentialPublicKey: isoBase64URL.toBuffer(authenticator.publicKey),
        counter: authenticator.counter,
        transports:
          (authenticator.transports as AuthenticatorTransportFuture[]) ?? undefined
      },
      requireUserVerification: true
    });

    if (!verification.verified || !verification.authenticationInfo) {
      throw new UnauthorizedException('Biometric authentication failed');
    }

    if (verification.authenticationInfo.newCounter !== undefined) {
      await this.prisma.webAuthnCredential.update({
        where: { credentialId: authenticator.credentialId },
        data: { counter: verification.authenticationInfo.newCounter }
      });
    }

    await this.prisma.authToken.update({
      where: { id: challenge.id },
      data: { used: true }
    });

    const { passwordHash, verificationCode, ...safeUser } = user;
    const tokens = this.issueTokens(user.id);

    return {
      result: true,
      user: {
        ...safeUser,
        commercialOffersAvailable: Boolean(user.isEsiaVerified)
      },
      ...tokens
    };
  }

  private async storeChallenge(
    userId: string,
    type: string,
    challenge: string
  ) {
    await this.prisma.authToken.deleteMany({
      where: { userId, type }
    });

    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    return this.prisma.authToken.create({
      data: {
        token: challenge,
        type,
        userId,
        expiresAt,
        used: false
      }
    });
  }

  private async consumeChallenge(userId: string, type: string) {
    const token = await this.prisma.authToken.findFirst({
      where: {
        userId,
        type,
        used: false,
        expiresAt: { gt: new Date() }
      },
      orderBy: { createdAt: 'desc' }
    });

    if (!token) {
      throw new UnauthorizedException('Biometric challenge expired');
    }

    return token;
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
