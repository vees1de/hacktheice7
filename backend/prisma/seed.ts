import {
  PrismaClient,
  BeneficiaryCategoryType,
  StaffRole
} from '@prisma/client';
import { hash } from 'argon2';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding start');

  // --------------------------
  // REGIONS
  // --------------------------
  const regions = await prisma.region.createMany({
    data: [
      { name: 'Москва', code: '77', type: 'город' },
      { name: 'Санкт-Петербург', code: '78', type: 'город' },
      { name: 'Новосибирская область', code: '54', type: 'область' },
      { name: 'Свердловская область', code: '66', type: 'область' },
      { name: 'Республика Саха (Якутия)', code: '14', type: 'республика' }
    ],
    skipDuplicates: true
  });

  const regionList = await prisma.region.findMany();

  // --------------------------
  // BENEFICIARY CATEGORIES
  // --------------------------
  const categories = await prisma.beneficiaryCategory.createMany({
    data: [
      {
        name: BeneficiaryCategoryType.PENSIONER,
        title: 'Пенсионер',
        icon: '/icons/pensioner.svg'
      },
      {
        name: BeneficiaryCategoryType.DISABLED_1,
        title: 'Инвалид 1 группы',
        icon: '/icons/disabled_1.svg'
      },
      {
        name: BeneficiaryCategoryType.DISABLED_2,
        title: 'Инвалид 2 группы',
        icon: '/icons/disabled_2.svg'
      },
      {
        name: BeneficiaryCategoryType.DISABLED_3,
        title: 'Инвалид 3 группы',
        icon: '/icons/disabled_2.svg'
      },
      {
        name: BeneficiaryCategoryType.MULTICHILD_PARENT,
        title: 'Многодетный родитель',
        icon: '/icons/multichild.svg'
      },
      {
        name: BeneficiaryCategoryType.VETERAN,
        title: 'Ветеран',
        icon: '/icons/low_income.svg'
      },
      {
        name: BeneficiaryCategoryType.LOW_INCOME,
        title: 'Малоимущий',
        icon: '/icons/low_income.svg'
      },
      {
        name: BeneficiaryCategoryType.STUDENT,
        title: 'Студент',
        icon: '/icons/student.svg'
      },
      {
        name: BeneficiaryCategoryType.DISABLED_CHILD_PARENT,
        title: 'Родитель ребенка-инвалида',
        icon: '/icons/parent.svg'
      }
    ],
    skipDuplicates: true
  });

  const categoryList = await prisma.beneficiaryCategory.findMany();

  // --------------------------
  // STAFF + USERS
  // --------------------------

  async function createStaffUser({
    email,
    role,
    phone,
    firstName,
    lastName,
    regionId,
    snils
  }: {
    email: string;
    role: StaffRole;
    phone: string;
    firstName: string;
    lastName: string;
    regionId: string;
    snils?: string;
  }) {
    const passwordHash = await hash(`${role.toLowerCase()}123`);

    const fallbackSnils =
      snils || phone.replace(/\D/g, '').padEnd(11, '0').slice(0, 11);

    const user = await prisma.user.upsert({
      where: { phone },
      update: {},
      create: {
        email,
        passwordHash,
        firstName,
        lastName,
        patronymic: '',
        phone,
        dateOfBirth: new Date('1990-01-01'),
        snils: fallbackSnils,
        status: 'ACTIVE',
        isVerified: true,
        isEsiaVerified: false,
        onboardingStep: 'COMPLETE',
        regionId,
        consentGiven: true,
        consentDate: new Date()
      }
    });

    const staff = await prisma.staff.upsert({
      where: { userId: user.id },
      update: { role },
      create: { userId: user.id, role }
    });

    return { user, staff };
  }

  const { user: admin } = await createStaffUser({
    email: 'admin@demo.ru',
    phone: '+79990000000',
    firstName: 'Админ',
    lastName: 'Админов',
    role: StaffRole.ADMIN,
    regionId: regionList[0].id
  });

  const { user: partner, staff: partnerStaff } = await createStaffUser({
    email: 'partner@demo.ru',
    phone: '+79991110000',
    firstName: 'Партнер',
    lastName: 'Партнеров',
    role: StaffRole.PARTNER,
    regionId: regionList[1].id
  });

  const { user: manager } = await createStaffUser({
    email: 'manager@demo.ru',
    phone: '+79992220000',
    firstName: 'Менеджер',
    lastName: 'Менеджеров',
    role: StaffRole.MANAGER,
    regionId: regionList[2].id
  });

  // Кассиры для сканирования QR (роль PARTNER)
  const cashiers = [
    {
      email: 'cashier1@demo.ru',
      phone: '+79993330000',
      firstName: 'Кассир',
      lastName: 'Иванова',
      snils: '93300000000'
    },
    {
      email: 'cashier2@demo.ru',
      phone: '+79994440000',
      firstName: 'Кассир',
      lastName: 'Петров',
      snils: '94400000000'
    }
  ];

  for (const cashier of cashiers) {
    await createStaffUser({
      ...cashier,
      role: StaffRole.PARTNER,
      regionId: regionList[0].id
    });
  }

  // --------------------------
  // OFFERS (UPDATED)
  // --------------------------

  const offersToCreate = [
    {
      title: '50% скидка на лекарства',
      description: 'Скидка на препараты',
      partnerName: 'Сеть аптек "Здоровье"',
      partnerLogo: '/logos/health.png',
      discount: '50%',
      validFrom: new Date(),
      validTo: new Date('2026-01-01'),
      terms: 'Показать удостоверение',
      link: 'https://example.com'
    },
    {
      title: 'Бесплатный проезд',
      description: 'Проезд для пенсионеров',
      partnerName: 'Городской транспорт',
      partnerLogo: '/logos/transport.png',
      discount: '100%',
      validFrom: new Date(),
      validTo: new Date('2026-01-01'),
      terms: 'Оформить МФЦ карту',
      link: 'https://example.com'
    }
  ];

  for (const data of offersToCreate) {
    const offer = await prisma.offer.create({
      data: {
        ...data,
        createdByStaffId: partnerStaff.id
      }
    });

    await prisma.offerRegion.create({
      data: {
        offerId: offer.id,
        regionId: regionList[0].id
      }
    });

    await prisma.offerBeneficiaryCategory.create({
      data: {
        offerId: offer.id,
        categoryId: categoryList[0].id
      }
    });
  }

  // --------------------------
  // BENEFITS (новая модель)
  // --------------------------

  const benefit = await prisma.benefit.create({
    data: {
      title: 'Компенсация ЖКХ',
      description: 'Скидка 50% на коммунальные услуги',
      type: 'Компенсация',
      validFrom: new Date(),
      validTo: new Date('2026-01-01'),
      requirements: 'Статус малоимущего',
      howToGet: 'Оформить через МФЦ',
      sourceUrl: 'https://example.com',

      benefitRegions: {
        create: regionList.slice(0, 2).map(r => ({
          regionId: r.id
        }))
      },

      benefitCategories: {
        create: categoryList.slice(0, 2).map(c => ({
          categoryId: c.id
        }))
      }
    }
  });

  console.log('🌱 Seeding completed');
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
