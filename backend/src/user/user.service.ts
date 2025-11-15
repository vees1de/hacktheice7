import {
  BadRequestException,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { RegisterDto } from '../auth/dto/register.dto';
import { BeneficiaryCategoryType } from '@prisma/client';
import { hash } from 'argon2';
import { UserDto } from './user.dto';

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
        status: 'REGISTRATION_PENDING',
        verificationCode: '4444' // Мок-код для подтверждения
      }
    });

    return user;
  }

  async getPendingUsers() {
    return this.prisma.user.findMany({
      where: {
        status: 'PHONE_VERIFIED'
      },
      include: {
        region: true,
        userBeneficiaryCategories: {
          include: {
            beneficiaryCategory: true
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });
  }

  async approveUser(userId: string, categories: BeneficiaryCategoryType[]) {
    // Проверяем, существует ли пользователь (вне транзакции, чтобы не тратить ресурсы, если пользователь не найден)
    const user = await this.prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.status === 'ACTIVE') {
      throw new BadRequestException('User is already approved');
    }

    // Проверяем, существуют ли все запрашиваемые категории (вне транзакции, чтобы проверить заранее)
    // Это предотвратит ошибку внутри транзакции из-за отсутствующей категории
    const categoryRecords = await this.prisma.beneficiaryCategory.findMany({
      where: {
        name: { in: categories }
      }
    });

    const foundCategoryNames = new Set(categoryRecords.map(cat => cat.name));
    const missingCategories = categories.filter(
      cat => !foundCategoryNames.has(cat)
    );

    if (missingCategories.length > 0) {
      throw new NotFoundException(
        `Beneficiary categories not found: ${missingCategories.join(', ')}`
      );
    }

    // Используем транзакцию для атомарности операций
    const updatedUser = await this.prisma.$transaction(async prisma => {
      // Обновляем статус пользователя ВНУТРИ транзакции
      const userUpdate = await prisma.user.update({
        where: { id: userId },
        data: {
          status: 'ACTIVE',
          isVerified: true
        }
      });

      // Назначаем категории льгот ВНУТРИ транзакции
      for (const category of categories) {
        // Находим ID категории по её имени ВНУТРИ транзакции
        // (Мы уже проверили, что она существует, но делаем это внутри транзакции для консистентности)
        const beneficiaryCategory = categoryRecords.find(
          cat => cat.name === category
        );
        if (!beneficiaryCategory) {
          // Теоретически, этого не должно произойти, если проверка выше корректна
          throw new Error(
            `Unexpected error: Category ${category} not found after pre-check`
          );
        }

        await prisma.userBeneficiaryCategory.create({
          data: {
            userId,
            categoryId: beneficiaryCategory.id,
            confirmed: true,
            confirmationDate: new Date()
          }
        });
      }

      return userUpdate; // Возвращаем обновленного пользователя
    }); // Если где-то внутри throw, транзакция автоматически откатится

    return updatedUser;
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
      where: { id }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Если обновляется пароль, хешируем его
    let passwordHash = user.passwordHash;
    if (dto.password) {
      passwordHash = await hash(dto.password);
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: {
        ...dto,
        passwordHash
      },
      include: {
        region: {
          select: {
            id: true,
            name: true,
            code: true
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
