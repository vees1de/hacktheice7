import { PrismaClient } from '@prisma/client';
// Импортируем argon2 вместо bcrypt
import { hash } from 'argon2';

const prisma = new PrismaClient();

async function main() {
  // Сначала очищаем данные для повторного запуска
  // Удаляем связи перед удалением основных сущностей
  await prisma.offerBeneficiaryCategory.deleteMany({});
  await prisma.offerRegion.deleteMany({});
  await prisma.offer.deleteMany({});
  await prisma.region.deleteMany({});
  await prisma.beneficiaryCategory.deleteMany({});

  // Создаем тестовые регионы
  const regions = await Promise.all([
    prisma.region.create({
      data: { name: 'Москва', code: '77', type: 'город' }
    }),
    prisma.region.create({
      data: { name: 'Санкт-Петербург', code: '78', type: 'город' }
    }),
    prisma.region.create({
      data: { name: 'Новосибирская область', code: '54', type: 'область' }
    }),
    prisma.region.create({
      data: { name: 'Свердловская область', code: '66', type: 'область' }
    }),
    prisma.region.create({
      data: { name: 'Республика Саха (Якутия)', code: '14', type: 'республика' }
    })
  ]);

  // Создаем тестовые категории льготников
  const categories = await Promise.all([
    prisma.beneficiaryCategory.create({
      data: {
        name: 'PENSIONER',
        title: 'Пенсионер',
        icon: '/icons/pensioner.svg'
      }
    }),
    prisma.beneficiaryCategory.create({
      data: {
        name: 'DISABLED_1',
        title: 'Инвалид 1 группы',
        icon: '/icons/disabled_1.svg'
      }
    }),
    prisma.beneficiaryCategory.create({
      data: {
        name: 'DISABLED_2',
        title: 'Инвалид 2 группы',
        icon: '/icons/disabled_2.svg'
      }
    }),
    prisma.beneficiaryCategory.create({
      data: {
        name: 'DISABLED_3',
        title: 'Инвалид 3 группы',
        icon: '/icons/disabled_2.svg'
      }
    }),
    prisma.beneficiaryCategory.create({
      data: {
        name: 'MULTICHILD_PARENT',
        title: 'Многодетный родитель',
        icon: '/icons/multichild.svg'
      }
    }),
    prisma.beneficiaryCategory.create({
      data: {
        name: 'LOW_INCOME',
        title: 'Малоимущий',
        icon: '/icons/low_income.svg'
      }
    }),
    prisma.beneficiaryCategory.create({
      data: {
        name: 'STUDENT',
        title: 'Студент',
        icon: '/icons/low_income.svg'
      }
    }),
    prisma.beneficiaryCategory.create({
      data: {
        name: 'DISABLED_CHILD_PARENT',
        title: 'Родитель ребенка-инвалида',
        icon: '/icons/low_income.svg'
      }
    }),
    prisma.beneficiaryCategory.create({
      data: {
        name: 'VETERAN',
        title: 'Ветеран',
        icon: '/icons/low_income.svg'
      }
    })
  ]);

  // Хешируем пароли для сотрудников
  const adminPasswordHash = await hash('adminPassword123');
  const partnerPasswordHash = await hash('partnerPassword123');
  const managerPasswordHash = await hash('managerPassword123');

  // Проверяем, существует ли пользователь с email 'admin@admin.ru'
  let adminUser = await prisma.user.findUnique({
    where: { email: 'admin@admin.ru' }
  });

  if (adminUser) {
    // Если пользователь существует, обновляем его
    adminUser = await prisma.user.update({
      where: { email: 'admin@admin.ru' },
      data: {
        firstName: 'Админ',
        lastName: 'Админов',
        patronymic: 'Админович',
        dateOfBirth: new Date('1980-01-01'),
        phone: '+79990000000',
        snils: '000-000-000 00',
        passwordHash: adminPasswordHash,
        status: 'ACTIVE',
        region: { connect: { id: regions[0].id } }, // Подключаем к первому региону
        consentGiven: true,
        consentDate: new Date()
      }
    });
    console.log('Администратор обновлен');
  } else {
    // Если пользователь не существует, создаем нового
    adminUser = await prisma.user.create({
      data: {
        email: 'admin@admin.ru',
        firstName: 'Админ',
        lastName: 'Админов',
        patronymic: 'Админович',
        dateOfBirth: new Date('1980-01-01'),
        phone: '+79990000000',
        snils: '000-000-000 00',
        passwordHash: adminPasswordHash,
        status: 'ACTIVE',
        region: { connect: { id: regions[0].id } }, // Подключаем к первому региону
        consentGiven: true,
        consentDate: new Date()
      }
    });
    console.log('Администратор создан');
  }

  const adminStaff = await prisma.staff.upsert({
    where: { userId: adminUser.id },
    update: {
      role: 'ADMIN'
    },
    create: {
      userId: adminUser.id,
      role: 'ADMIN'
    }
  });
  console.log('Профиль администратора синхронизирован');

  const partnerUser = await prisma.user.upsert({
    where: { email: 'partner@admin.ru' },
    update: {
      firstName: 'Партнер',
      lastName: 'Партнеров',
      patronymic: 'Партнерович',
      dateOfBirth: new Date('1985-05-05'),
      phone: '+79991110000',
      snils: '111-111-111 11',
      passwordHash: partnerPasswordHash,
      status: 'ACTIVE',
      isVerified: true,
      onboardingStep: 'COMPLETE',
      region: { connect: { id: regions[1].id } },
      consentGiven: true,
      consentDate: new Date()
    },
    create: {
      email: 'partner@admin.ru',
      firstName: 'Партнер',
      lastName: 'Партнеров',
      patronymic: 'Партнерович',
      dateOfBirth: new Date('1985-05-05'),
      phone: '+79991110000',
      snils: '111-111-111 11',
      passwordHash: partnerPasswordHash,
      status: 'ACTIVE',
      isVerified: true,
      onboardingStep: 'COMPLETE',
      region: { connect: { id: regions[1].id } },
      consentGiven: true,
      consentDate: new Date()
    }
  });

  const partnerStaff = await prisma.staff.upsert({
    where: { userId: partnerUser.id },
    update: {
      role: 'PARTNER'
    },
    create: {
      userId: partnerUser.id,
      role: 'PARTNER'
    }
  });
  console.log('Партнерский аккаунт готов');

  const managerUser = await prisma.user.upsert({
    where: { email: 'manager@admin.ru' },
    update: {
      firstName: 'Менеджер',
      lastName: 'Менеджеров',
      patronymic: 'Менеджерович',
      dateOfBirth: new Date('1990-09-09'),
      phone: '+79992220000',
      snils: '222-222-222 22',
      passwordHash: managerPasswordHash,
      status: 'ACTIVE',
      isVerified: true,
      onboardingStep: 'COMPLETE',
      region: { connect: { id: regions[2].id } },
      consentGiven: true,
      consentDate: new Date()
    },
    create: {
      email: 'manager@admin.ru',
      firstName: 'Менеджер',
      lastName: 'Менеджеров',
      patronymic: 'Менеджерович',
      dateOfBirth: new Date('1990-09-09'),
      phone: '+79992220000',
      snils: '222-222-222 22',
      passwordHash: managerPasswordHash,
      status: 'ACTIVE',
      isVerified: true,
      onboardingStep: 'COMPLETE',
      region: { connect: { id: regions[2].id } },
      consentGiven: true,
      consentDate: new Date()
    }
  });

  const managerStaff = await prisma.staff.upsert({
    where: { userId: managerUser.id },
    update: {
      role: 'MANAGER'
    },
    create: {
      userId: managerUser.id,
      role: 'MANAGER'
    }
  });
  console.log('Менеджерский аккаунт готов');

  // Создаем 15 тестовых акций
  const offersData = [
    {
      title: '50% скидка на лекарства',
      description:
        'Специальная скидка на лекарственные препараты в аптеках сети "Здоровье"',
      partnerName: 'Сеть аптек "Здоровье"',
      partnerLogo: '/logos/health_pharmacy.png',
      discount: '50%',
      validFrom: new Date(),
      validTo: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
      terms: 'Предъявите удостоверение льготника при покупке',
      link: 'https://example.com/health-pharmacy'
    },
    {
      title: 'Бесплатный проезд в общественном транспорте',
      description: 'Льготный проездной билет для пенсионеров',
      partnerName: 'Городской транспорт',
      partnerLogo: '/logos/city_transport.png',
      discount: '100%',
      validFrom: new Date(),
      validTo: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
      terms: 'Требуется оформление специального проездного билета в МФЦ',
      link: 'https://example.com/city-transport'
    },
    {
      title: '30% скидка на путевки в санатории',
      description:
        'Специальное предложение для льготных категорий граждан на путевки в санатории Краснодарского края',
      partnerName: 'Турфирма "Отдых+"',
      partnerLogo: '/logos/rest_plus.png',
      discount: '30%',
      validFrom: new Date(),
      validTo: new Date(new Date().setMonth(new Date().getMonth() + 6)),
      terms:
        'Необходимо предоставить документы, подтверждающие льготную категорию',
      link: 'https://example.com/rest-plus'
    },
    {
      title: 'Бесплатное питание для школьников',
      description:
        'Организация бесплатного питания для детей из многодетных семей',
      partnerName: 'Департамент образования',
      partnerLogo: '/logos/education_dept.png',
      discount: '100%',
      validFrom: new Date(),
      validTo: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
      terms:
        'Предоставляется на основании заявления родителей и документов о составе семьи',
      link: 'https://example.com/education-dept'
    },
    {
      title: 'Скидка 25% на коммунальные услуги',
      description: 'Льгота по оплате жилищно-коммунальных услуг для инвалидов',
      partnerName: 'Мосэнергосбыт',
      partnerLogo: '/logos/mosenergosbyt.png',
      discount: '25%',
      validFrom: new Date(),
      validTo: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
      terms:
        'Автоматически применяется при начислении платежей при наличии статуса инвалида',
      link: 'https://example.com/mosenergosbyt'
    },
    {
      title: 'Бесплатное посещение музеев',
      description:
        'Бесплатное посещение государственных музеев для пенсионеров и инвалидов',
      partnerName: 'Музейный комплекс',
      partnerLogo: '/logos/museum_complex.png',
      discount: '100%',
      validFrom: new Date(),
      validTo: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
      terms:
        'Предъявите пенсионное удостоверение или удостоверение инвалида при входе',
      link: 'https://example.com/museum-complex'
    },
    {
      title: 'Скидка 40% на абонемент в бассейн',
      description:
        'Специальный абонемент для лиц с ограниченными возможностями здоровья',
      partnerName: 'Спортивный комплекс "Олимп"',
      partnerLogo: '/logos/olymp_sport.png',
      discount: '40%',
      validFrom: new Date(),
      validTo: new Date(new Date().setMonth(new Date().getMonth() + 3)),
      terms: 'Требуется медицинская справка и удостоверение инвалида',
      link: 'https://example.com/olymp-sport'
    },
    {
      title: 'Бесплатные лекции по финансовой грамотности',
      description:
        'Обучающие семинары для пенсионеров по управлению личными финансами',
      partnerName: 'Банк "Надежный"',
      partnerLogo: '/logos/reliable_bank.png',
      discount: '100%',
      validFrom: new Date(),
      validTo: new Date(new Date().setMonth(new Date().getMonth() + 2)),
      terms: 'Предварительная регистрация по телефону обязательна',
      link: 'https://example.com/reliable-bank'
    },
    {
      title: 'Скидка 20% на продукты питания',
      description:
        'Еженедельные скидки на определенные категории товаров для малоимущих семей',
      partnerName: 'Сеть магазинов "Семейный"',
      partnerLogo: '/logos/family_store.png',
      discount: '20%',
      validFrom: new Date(),
      validTo: new Date(new Date().setMonth(new Date().getMonth() + 1)),
      terms:
        'Предоставляется по специальной дисконтной карте, выдаваемой в соцзащите',
      link: 'https://example.com/family-store'
    },
    {
      title: 'Бесплатный абонемент в тренажерный зал',
      description:
        'Специальная программа по поддержанию здоровья для пенсионеров',
      partnerName: 'Фитнес-центр "Здоровье"',
      partnerLogo: '/logos/health_fitness.png',
      discount: '100%',
      validFrom: new Date(),
      validTo: new Date(new Date().setMonth(new Date().getMonth() + 2)),
      terms: 'Обязательна предварительная консультация с врачом',
      link: 'https://example.com/health-fitness'
    },
    {
      title: '35% скидка на детские товары',
      description: 'Специальные цены для многодетных семей на одежду и игрушки',
      partnerName: 'Детский мир',
      partnerLogo: '/logos/kids_world.png',
      discount: '35%',
      validFrom: new Date(),
      validTo: new Date(new Date().setMonth(new Date().getMonth() + 3)),
      terms: 'Предъявите удостоверение многодетной семьи при покупке',
      link: 'https://example.com/kids-world'
    },
    {
      title: 'Бесплатное обучение компьютерной грамотности',
      description: 'Курсы для пенсионеров по работе с компьютером и интернетом',
      partnerName: 'Центр цифрового образования',
      partnerLogo: '/logos/digital_center.png',
      discount: '100%',
      validFrom: new Date(),
      validTo: new Date(new Date().setMonth(new Date().getMonth() + 6)),
      terms: 'Запись на курсы осуществляется по телефону или в центре',
      link: 'https://example.com/digital-center'
    },
    {
      title: 'Скидка 15% на стоматологические услуги',
      description: 'Партнерская программа для льготных категорий граждан',
      partnerName: 'Стоматологическая клиника "Улыбка"',
      partnerLogo: '/logos/smile_clinic.png',
      discount: '15%',
      validFrom: new Date(),
      validTo: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
      terms:
        'Предварительная запись и наличие удостоверения льготника обязательны',
      link: 'https://example.com/smile-clinic'
    },
    {
      title: 'Бесплатная юридическая консультация',
      description:
        'Помощь в оформлении документов и консультирование по правовым вопросам',
      partnerName: 'Юридический центр "Право"',
      partnerLogo: '/logos/law_center.png',
      discount: '100%',
      validFrom: new Date(),
      validTo: new Date(new Date().setMonth(new Date().getMonth() + 4)),
      terms:
        'Запись на консультацию по телефону. При себе иметь паспорт и документы, подтверждающие льготную категорию',
      link: 'https://example.com/law-center'
    },
    {
      title: '50% скидка на абонемент в бассейн для детей-инвалидов',
      description:
        'Терапевтические занятия в бассейне для детей с ограниченными возможностями',
      partnerName: 'Детский реабилитационный центр',
      partnerLogo: '/logos/rehab_center.png',
      discount: '50%',
      validFrom: new Date(),
      validTo: new Date(new Date().setMonth(new Date().getMonth() + 3)),
      terms: 'Требуется направление от лечащего врача и удостоверение инвалида',
      link: 'https://example.com/rehab-center'
    }
  ];

  const offers = [];
  for (const offerData of offersData) {
    const offer = await prisma.offer.create({
      data: {
        ...offerData,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdByStaff: {
          connect: { id: partnerStaff.id }
        }
      }
    });
    offers.push(offer);
  }

  // Вспомогательная функция для получения случайных элементов из массива
  function getRandomElements<T>(array: T[], count: number): T[] {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, array.length));
  }

  // Связываем акции с регионами и категориями
  for (const offer of offers) {
    // Выбираем 1-3 случайных региона для каждой акции
    const randomRegions = getRandomElements(
      regions,
      Math.floor(Math.random() * 3) + 1
    );
    for (const region of randomRegions) {
      await prisma.offerRegion.create({
        data: {
          offerId: offer.id,
          regionId: region.id
        }
      });
    }

    // Выбираем 1-2 случайные категории для каждой акции
    const availableCategories = categories.filter(
      cat =>
        offer.title.toLowerCase().includes(cat.title.toLowerCase()) ||
        Math.random() > 0.3
    );

    const randomCategories = getRandomElements(
      availableCategories.length > 0 ? availableCategories : categories,
      Math.floor(Math.random() * 2) + 1
    );

    for (const category of randomCategories) {
      await prisma.offerBeneficiaryCategory.create({
        data: {
          offerId: offer.id,
          categoryId: category.id
        }
      });
    }
  }

  console.log('✅ Seed completed successfully!');
  console.log(`✅ Created ${offers.length} offers`);
  console.log(`✅ Created ${regions.length} regions`);
  console.log(`✅ Created ${categories.length} beneficiary categories`);
}

main()
  .catch(e => {
    console.error('❌ Error during seed:', e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
