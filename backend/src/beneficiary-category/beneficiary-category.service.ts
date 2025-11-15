import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { BeneficiaryCategoryType } from '@prisma/client';

@Injectable()
export class BeneficiaryCategoryService {
  constructor(private prisma: PrismaService) {}

  async getAllCategories() {
    return this.prisma.beneficiaryCategory.findMany({
      orderBy: { title: 'asc' }
    });
  }

  async assignCategoriesToUser(
    userId: string,
    categories: BeneficiaryCategoryType[]
  ) {
    // Полная замена: удаляем все и добавляем переданные
    await this.prisma.userBeneficiaryCategory.deleteMany({ where: { userId } });
    for (const categoryName of categories) {
      await this.addCategoryToUser(userId, categoryName);
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

  async addCategoryToUser(userId: string, category: BeneficiaryCategoryType) {
    const categoryEntity = await this.prisma.beneficiaryCategory.findFirst({
      where: { name: category }
    });

    if (!categoryEntity) {
      throw new NotFoundException(`Category ${category} not found`);
    }

    await this.prisma.userBeneficiaryCategory.upsert({
      where: {
        userId_categoryId: { userId, categoryId: categoryEntity.id }
      },
      update: {
        confirmed: true,
        confirmationDate: new Date()
      },
      create: {
        userId,
        categoryId: categoryEntity.id,
        confirmed: true,
        confirmationDate: new Date()
      }
    });

    return this.getUserCategories(userId);
  }

  async removeCategoryFromUser(
    userId: string,
    category: BeneficiaryCategoryType
  ) {
    const categoryEntity = await this.prisma.beneficiaryCategory.findFirst({
      where: { name: category }
    });

    if (!categoryEntity) {
      throw new NotFoundException(`Category ${category} not found`);
    }

    await this.prisma.userBeneficiaryCategory.deleteMany({
      where: { userId, categoryId: categoryEntity.id }
    });

    return this.getUserCategories(userId);
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
