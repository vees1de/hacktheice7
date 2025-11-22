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
const PdfPrinter = require('pdfmake');
import * as path from 'path';
import * as QRCode from 'qrcode';

const CERT_FONT_PATH = path.resolve(
  process.cwd(),
  'assets/fonts/Inter-Regular.ttf'
);

const pdfPrinter = new PdfPrinter({
  Inter: {
    normal: CERT_FONT_PATH,
    bold: CERT_FONT_PATH,
    italics: CERT_FONT_PATH,
    bolditalics: CERT_FONT_PATH
  }
});

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

    if (!user) throw new NotFoundException('User not found');

    let availableBenefits: { title: string; description?: string | null }[] =
      [];

    try {
      const benefits = await this.getAvailableBenefits(userId);
      availableBenefits = benefits
        .filter(b => !b.isHidden)
        .map(b => ({ title: b.title, description: b.description }));
    } catch {
      availableBenefits = [];
    }

    const fullName =
      `${user.lastName || ''} ${user.firstName || ''} ${user.patronymic || ''}`.trim();
    const reportDate = new Date().toLocaleString('ru-RU');
    const categories =
      user.userBeneficiaryCategories?.map(
        c => c.beneficiaryCategory?.title ?? 'Категория'
      ) ?? [];

    // --------- QR CODE GENERATION ----------

    const qrCodeBase64 = await QRCode.toDataURL(userId, {
      margin: 1,
      scale: 5,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    // ----------- PDFMAKE DOCUMENT DEFINITION ------------------

    const docDefinition = {
      defaultStyle: {
        font: 'Inter',
        fontSize: 11,
        color: '#000'
      },
      content: [
        {
          text: 'ЛАССО — Индивидуальный отчёт',
          alignment: 'center',
          fontSize: 20,
          bold: true,
          color: '#1a73e8',
          margin: [0, 0, 0, 20]
        },

        { text: `Дата формирования: ${reportDate}`, margin: [0, 0, 0, 10] },

        { text: '1. Общая информация', style: 'sectionHeader' },
        {
          ul: [
            `ФИО: ${fullName || 'Не указано'}`,
            `Телефон: ${user.phone || 'Не указан'}`,
            `СНИЛС: ${user.snils || 'Не указан'}`,
            `Регион: ${user.region?.name || 'Не указан'}`,
            `Статус: ${user.status}`,
            `ЕСИА подтверждена: ${user.isEsiaVerified ? 'Да' : 'Нет'} (${user.onboardingStep})`
          ],
          margin: [0, 0, 0, 15]
        },

        { text: '2. Подтверждённые категории', style: 'sectionHeader' },
        categories.length
          ? { ol: categories, margin: [0, 0, 0, 15] }
          : { text: 'Категории отсутствуют', margin: [0, 0, 0, 15] },

        availableBenefits.length > 10
          ? {
              text: `...и ещё ${availableBenefits.length - 10} льгот`,
              fontSize: 10,
              color: '#777',
              margin: [0, 0, 0, 15]
            }
          : {},

        { text: '3. Подпись и QR-код', style: 'sectionHeader' },

        {
          columns: [
            [
              { text: `Ответственный: Экосистема ЛАССО`, margin: [0, 0, 0, 2] },
              { text: `Электронная подпись: ${fullName || 'Пользователь'}` },
              {
                text: `ID пользователя: ${userId}`,
                fontSize: 10,
                color: '#555',
                margin: [0, 5, 0, 0]
              }
            ],

            // ---- QR IN THE CORNER ----
            {
              width: 120,
              image: qrCodeBase64,
              fit: [100, 100],
              alignment: 'right'
            }
          ],
          margin: [0, 20, 0, 0]
        }
      ],
      styles: {
        sectionHeader: {
          fontSize: 14,
          bold: true,
          color: '#1a73e8',
          margin: [0, 10, 0, 10]
        }
      }
    };

    // ----- PDF GENERATION -----

    return await new Promise<Buffer>((resolve, reject) => {
      const pdfDoc = pdfPrinter.createPdfKitDocument(docDefinition);

      const chunks: any[] = [];
      pdfDoc.on('data', chunk => chunks.push(chunk));
      pdfDoc.on('end', () => resolve(Buffer.concat(chunks)));
      pdfDoc.on('error', reject);

      pdfDoc.end();
    });
  }
}
