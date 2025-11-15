import {
  BadRequestException,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { RegisterDto } from '../auth/dto/register.dto';
import { hash } from 'argon2';
import { UserDto } from './dto/user.dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async create(dto: RegisterDto) {
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
        status: 'PENDING',
        verificationCode: '4444'
      }
    });

    return user;
  }

  async getById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async getByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email }
    });
  }

  async getByPhone(phone: string) {
    return this.prisma.user.findUnique({
      where: { phone }
    });
  }

  async getProfile(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
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
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Возвращаем профиль без чувствительных данных
    const { passwordHash, verificationCode, ...profile } = user;
    return profile;
  }
  async update(id: string, dto: UserDto) {
    // Проверяем, существует ли пользователь
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        userBeneficiaryCategories: true // Подгружаем связанные категории
      }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Если обновляется пароль, хешируем его
    let passwordHash = user.passwordHash;
    if (dto.password) {
      passwordHash = await hash(dto.password);
    }

    // Подготовим данные для обновления, исключая вложенные объекты
    const { password, userBeneficiaryCategories, ...userData } = dto;

    // Обновляем основные данные пользователя
    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: {
        ...userData,
        passwordHash,
        // Обработка связанных данных (категории)
        userBeneficiaryCategories: userBeneficiaryCategories
          ? {
              deleteMany: {}, // Удаляем все старые связи
              create: userBeneficiaryCategories.map(cat => ({
                categoryId: cat.name, // Предполагаем, что `name` в DTO - это ID категории
                confirmed: cat.confirmed
              }))
            }
          : undefined
      },
      include: {
        region: {
          select: {
            id: true,
            name: true,
            code: true
          }
        },
        userBeneficiaryCategories: {
          include: {
            beneficiaryCategory: true
          }
        }
      }
    });

    // Возвращаем обновленный профиль без чувствительных данных
    const { passwordHash: _, verificationCode, ...profile } = updatedUser;
    return profile;
  }

  async getUserBenefits(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        userBeneficiaryCategories: {
          where: { confirmed: true },
          include: {
            beneficiaryCategory: true
          }
        },
        region: true,
        hiddenBenefits: true
      }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.isVerified || user.status !== 'ACTIVE') {
      throw new Error('User is not verified or not active');
    }

    // Получаем ID категорий пользователя
    const categoryIds = user.userBeneficiaryCategories.map(uc => uc.categoryId);

    // Получаем ID скрытых льгот
    const hiddenBenefitIds = user.hiddenBenefits.map(hb => hb.benefitId);

    // Получаем льготы для этих категорий в регионе пользователя, исключая скрытые
    const benefits = await this.prisma.benefit.findMany({
      where: {
        benefitRegions: {
          some: {
            regionId: user.regionId
          }
        },
        benefitCategories: {
          some: {
            categoryId: {
              in: categoryIds
            }
          }
        },
        id: {
          notIn: hiddenBenefitIds
        }
      },
      include: {
        benefitCategories: {
          include: {
            beneficiaryCategory: true
          }
        },
        benefitRegions: {
          include: {
            region: true
          }
        }
      }
    });

    return benefits;
  }

  async getAvailableBenefits(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        userBeneficiaryCategories: {
          where: { confirmed: true },
          include: {
            beneficiaryCategory: true
          }
        },
        region: true,
        hiddenBenefits: true
      }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.isVerified || user.status !== 'ACTIVE') {
      throw new Error('User is not verified or not active');
    }

    // Получаем ID категорий пользователя
    const categoryIds = user.userBeneficiaryCategories.map(uc => uc.categoryId);

    // Получаем ID скрытых льгот
    const hiddenBenefitIds = user.hiddenBenefits.map(hb => hb.benefitId);

    // Получаем ВСЕ льготы для этих категорий в регионе пользователя
    const benefits = await this.prisma.benefit.findMany({
      where: {
        benefitRegions: {
          some: {
            regionId: user.regionId
          }
        },
        benefitCategories: {
          some: {
            categoryId: {
              in: categoryIds
            }
          }
        }
      },
      include: {
        benefitCategories: {
          include: {
            beneficiaryCategory: true
          }
        },
        benefitRegions: {
          include: {
            region: true
          }
        }
      }
    });

    // Добавляем флаг, скрыта ли льгота для пользователя
    return benefits.map(benefit => ({
      ...benefit,
      isHidden: hiddenBenefitIds.includes(benefit.id)
    }));
  }

  async hideBenefit(userId: string, benefitId: string) {
    // Проверяем, существует ли пользователь
    const user = await this.prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Проверяем, существует ли льгота
    const benefit = await this.prisma.benefit.findUnique({
      where: { id: benefitId }
    });

    if (!benefit) {
      throw new NotFoundException('Benefit not found');
    }

    // Проверяем, не скрыта ли уже эта льгота
    const existingHidden = await this.prisma.hiddenBenefit.findFirst({
      where: {
        userId,
        benefitId
      }
    });

    if (existingHidden) {
      throw new BadRequestException('Benefit is already hidden for this user');
    }

    // Добавляем льготу в список скрытых
    return this.prisma.hiddenBenefit.create({
      data: {
        userId,
        benefitId
      }
    });
  }

  async unhideBenefit(userId: string, benefitId: string) {
    // Проверяем, существует ли пользователь
    const user = await this.prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Проверяем, существует ли связь скрытой льготы
    const hiddenBenefit = await this.prisma.hiddenBenefit.findFirst({
      where: {
        userId,
        benefitId
      }
    });

    if (!hiddenBenefit) {
      throw new NotFoundException('Benefit was not hidden for this user');
    }

    // Удаляем льготу из списка скрытых
    await this.prisma.hiddenBenefit.delete({
      where: {
        userId_benefitId: {
          userId,
          benefitId
        }
      }
    });

    return { success: true };
  }
}
