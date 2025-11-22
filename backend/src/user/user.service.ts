import {
  BadRequestException,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { RegisterDto } from '../auth/dto/register.dto';
import { hash } from 'argon2';
import { UserDto } from './dto/user.dto';
import { BeneficiaryCategoryType } from '@prisma/client';
import PDFDocument from 'pdfkit';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async create(dto: RegisterDto) {
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
    return {
      ...profile,
      commercialOffersAvailable: Boolean(user.isEsiaVerified)
    };
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
    return {
      ...profile,
      commercialOffersAvailable: Boolean(updatedUser.isEsiaVerified)
    };
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

  async updateUserCategories(
    userId: string,
    categories: BeneficiaryCategoryType[]
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.prisma.userBeneficiaryCategory.deleteMany({
      where: { userId }
    });

    if (categories.length > 0) {
      const categoryEntities = await this.prisma.beneficiaryCategory.findMany({
        where: { name: { in: categories } }
      });

      if (categoryEntities.length !== categories.length) {
        throw new BadRequestException('One or more categories not found');
      }

      await this.prisma.userBeneficiaryCategory.createMany({
        data: categoryEntities.map(category => ({
          userId,
          categoryId: category.id,
          confirmed: true,
          confirmationDate: new Date()
        }))
      });
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        isEsiaVerified: categories.length > 0,
        onboardingStep: 'COMPLETE'
      }
    });

    return this.getProfile(userId);
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

  async generateUserReportPdf(userId: string): Promise<Buffer> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        region: true,
        userBeneficiaryCategories: {
          where: { confirmed: true },
          include: { beneficiaryCategory: true }
        }
      }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    let availableBenefits: { title: string; description?: string | null }[] = [];
    try {
      const benefits = await this.getAvailableBenefits(userId);
      availableBenefits = benefits
        .filter(benefit => !benefit.isHidden)
        .map(benefit => ({
          title: benefit.title,
          description: benefit.description
        }));
    } catch {
      availableBenefits = [];
    }

    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const buffers: Buffer[] = [];

    doc.on('data', chunk => buffers.push(chunk));

    const reportDate = new Date().toLocaleString('ru-RU');
    const fullName = `${user.lastName || ''} ${user.firstName || ''} ${
      user.patronymic || ''
    }`.trim();
    const categories =
      user.userBeneficiaryCategories?.map(
        category => category.beneficiaryCategory?.title || 'Без названия'
      ) ?? [];

    doc
      .fontSize(18)
      .fillColor('#1a73e8')
      .text('ЛАССО — Индивидуальный отчёт', { align: 'center' })
      .moveDown(1.5);

    doc
      .fontSize(12)
      .fillColor('#000')
      .text(`Дата формирования: ${reportDate}`)
      .moveDown();

    doc
      .fontSize(14)
      .fillColor('#1a73e8')
      .text('1. Общая информация', { underline: true })
      .moveDown(0.5);

    doc
      .fontSize(12)
      .fillColor('#000')
      .text(`ФИО: ${fullName || 'Не указано'}`)
      .text(`Телефон: ${user.phone || 'Не указан'}`)
      .text(`СНИЛС: ${user.snils || 'Не указан'}`)
      .text(`Регион: ${user.region?.name || 'Не указан'}`)
      .text(`Статус: ${user.status}`)
      .text(
        `Подтверждён ЕСИА: ${user.isEsiaVerified ? 'Да' : 'Нет'} (${
          user.onboardingStep || 'нет данных'
        })`
      )
      .moveDown();

    doc
      .fontSize(14)
      .fillColor('#1a73e8')
      .text('2. Подтверждённые категории', { underline: true })
      .moveDown(0.5);

    if (categories.length === 0) {
      doc.fontSize(12).fillColor('#000').text('Категории отсутствуют.').moveDown();
    } else {
      categories.forEach((title, index) => {
        doc
          .fontSize(12)
          .fillColor('#000')
          .text(`${index + 1}. ${title}`);
      });
      doc.moveDown();
    }

    doc
      .fontSize(14)
      .fillColor('#1a73e8')
      .text('3. Рекомендуемые льготы', { underline: true })
      .moveDown(0.5);

    if (availableBenefits.length === 0) {
      doc.fontSize(12).fillColor('#000').text('Подходящих льгот пока нет.').moveDown();
    } else {
      availableBenefits.slice(0, 10).forEach((benefit, index) => {
        doc
          .fontSize(12)
          .fillColor('#000')
          .text(`${index + 1}. ${benefit.title}`);
        if (benefit.description) {
          doc
            .fontSize(10)
            .fillColor('#4b5563')
            .text(benefit.description, { indent: 12 });
        }
        doc.moveDown(0.5);
      });
      if (availableBenefits.length > 10) {
        doc
          .fontSize(11)
          .fillColor('#4b5563')
          .text(`...и ещё ${availableBenefits.length - 10} льгот`);
        doc.moveDown();
      }
    }

    doc
      .fontSize(14)
      .fillColor('#1a73e8')
      .text('4. Подпись и печать', { underline: true })
      .moveDown(0.5);

    doc
      .fontSize(12)
      .fillColor('#000')
      .text('Ответственный: Экосистема ЛАССО')
      .text(`Электронная подпись: ${fullName || 'Пользователь'}`)
      .moveDown(2);

    const stampX = doc.page.width - 200;
    const stampY = doc.y;
    doc
      .save()
      .circle(stampX + 70, stampY + 70, 60)
      .lineWidth(2)
      .stroke('#1a73e8')
      .fontSize(12)
      .fillColor('#1a73e8')
      .text('ЛАССО', stampX + 20, stampY + 40, { width: 100, align: 'center' })
      .fontSize(9)
      .text('Электронная печать', stampX + 20, stampY + 60, {
        width: 100,
        align: 'center'
      })
      .restore();

    return await new Promise<Buffer>((resolve, reject) => {
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);
      doc.end();
    });
  }
}
