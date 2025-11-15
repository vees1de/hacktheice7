import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { BeneficiaryCategoryType } from '@prisma/client';

@Injectable()
export class BeneficiaryCategoryService {
  constructor(private prisma: PrismaService) {}

  async assignCategoriesToUser(
    userId: string,
    categories: BeneficiaryCategoryType[]
  ) {
    // Сначала удаляем все текущие категории пользователя
    await this.prisma.userBeneficiaryCategory.deleteMany({
      where: { userId }
    });

    // Затем добавляем новые
    for (const categoryName of categories) {
      const category = await this.prisma.beneficiaryCategory.findFirst({
        where: { name: categoryName }
      });

      if (!category) {
        throw new NotFoundException(`Category ${categoryName} not found`);
      }

      await this.prisma.userBeneficiaryCategory.create({
        data: {
          userId,
          categoryId: category.id,
          confirmed: true,
          confirmationDate: new Date()
        }
      });
    }

    return this.getUserCategories(userId);
  }

  async getUserCategories(userId: string) {
    return this.prisma.userBeneficiaryCategory.findMany({
      where: { userId, confirmed: true },
      include: {
        beneficiaryCategory: true
      }
    });
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
        region: true
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

    // Получаем льготы для этих категорий в регионе пользователя
    return this.prisma.benefit.findMany({
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
  }
}
