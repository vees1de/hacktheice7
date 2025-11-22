// backend/src/loss/user-loss.logic.ts
import { PrismaClient } from '@prisma/client';

export type LossItem = {
  id: string;
  title: string;
  type: string;
  monthlyLoss: number;
  yearlyLoss: number;
};

export type UserLossResult = {
  userId: string;
  categories: string[];
  lossItems: LossItem[];
  totalLossMonthly: number;
  totalLossYearly: number;
};

// Мапа "id льготы → оценка ₽/мес"
const BENEFIT_MONTHLY_MAP: Record<string, number> = {
  // базовая тестовая
  'cmi4juf0m0012xke819qs6ggl': 1500, // Компенсация ЖКХ (общая)

  // ЖКХ / пенсионеры / инвалиды / малоимущие
  'cmi5ql24f0000xkrkp2c4fnr0': 2500, // Скидка 50% ЖКХ для пенсионеров
  'cmi5ql3cw0001xkrk146d4wru': 2000, // Компенсация отопления
  'cmi5ql43z0002xkrkqvuxm752': 1800, // Субсидия на электроэнергию
  'cmi5ql4sp0003xkrkpd2boxts': 2200, // Дрова

  '54b08dd9-6b82-4bc3-a899-3ba7ed5a6d55': 700,  // Капремонт пенсионерам
  '45dd6ae6-9e25-4e77-aa4e-dabe98299936': 3000, // Субсидия ЖКУ > 15% дохода
  '9f87cf32-1d16-4e0d-8023-d391b6f6483b': 5000, // 100% ЖКХ инвалид 1 гр.

  // Соцвыплаты (деньги на руки)
  'db45b175-0230-463a-8998-0cd7d9feb914': 4000, // ЕДВ инвалиды 1 гр.
  '5187477f-0fce-4fad-9fd6-4e295292ee3a': 3500, // Пособие малоимущим
  '10d402e2-3b1e-450b-9d56-0938b169cce5': 2000, // Школьное питание
  'a8f9ee68-0c72-4e99-ab09-fd4fb767448b': 3500, // Доплата родителям детей-инвалидов

  // Дети / образование / кружки
  'abfbc722-4bba-4c1f-a219-d2a07ad404b7': 3000, // Детсад
  '01c6de1c-d36c-44ea-98b0-f656ae873b16': 1500, // Кружки
  '2a696a91-b773-4bb3-b8a9-44aa7afdb86d': 3000, // Стипендия студентам из малоимущих

  // Транспорт / проезд
  '7ba0a242-ebcc-4bcc-8798-96fb051e3476': 2000, // Бесплатный проезд пенсионерам
  '4770098d-b4f2-45a1-8fa7-fcd40d94f3da': 2000, // Бесплатный проезд ветеранам
  'b5514225-c8b8-41be-854b-c88b477d2643': 1000, // Скидка на проезд инвалид 3 гр.
  '2e9b35f0-678a-4cd7-9225-78089adfb2e8': 1200, // Льготный проезд студентов
  'dc21733c-c3f9-45a9-94fa-8a57327e4193': 1000, // Социальное такси

  // Медицина
  '5709d758-6c33-4503-b2a6-cdf99ab4f427': 1500, // Лекарства пенсионерам
  '83e82149-d53a-407d-8795-76240e3eb0a9': 1500, // Лекарства инвалид 3 гр.
  '8f964292-0f6f-41f6-babc-a79b159e574f': 3000, // Санаторий ветеранам
  '2ffc23e8-22c5-4190-9b75-495380cceef3': 2500, // Реабилитация детей-инвалидов

  // Связь / интернет
  'b4c414b3-bfbd-4fd6-9971-d82c00a57a0b': 1000, // Интернет малоимущим
};

// Фоллбек по типу льготы (если не прописали id в мапе)
const BASE_MONTHLY_BY_TYPE: Record<string, number> = {
  'Компенсация ЖКХ': 2000,
  'Компенсация': 1500,
  'ЖКХ': 1500,
  'Транспорт': 800,
  'Налоговая льгота': 1000,
  'Социальная выплата': 1200,
  'Медицина': 1300,
  'Образование': 1000,
  'Связь': 700,
  'Культура и спорт': 600,
};

type BenefitRow = {
  id: string;
  title: string;
  description: string | null;
  type: string;
};

export async function calculateUserLoss(
  prisma: PrismaClient,
  userId: string,
): Promise<UserLossResult> {
  // регион пользователя (берём напрямую из таблицы user)
  const userRegionRows = await prisma.$queryRaw<{ region_id: string | null }[]>`
    SELECT region_id
    FROM "user"
    WHERE id = ${userId}
    LIMIT 1
  `;
  const userRegionId: string | null = userRegionRows[0]?.region_id ?? null;

  // подтверждённые категории пользователя
  const categoryRows = await prisma.$queryRaw<{ categoryId: string }[]>`
    SELECT "categoryId"
    FROM user_beneficiary_category
    WHERE "userId" = ${userId}
      AND confirmed = true
  `;

  const categories = categoryRows.map((row) => row.categoryId);

  if (categories.length === 0) {
    return {
      userId,
      categories: [],
      lossItems: [],
      totalLossMonthly: 0,
      totalLossYearly: 0,
    };
  }

  // льготы по категориям + региону, которых ещё нет у пользователя
  const benefits = await prisma.$queryRaw<BenefitRow[]>`
    SELECT DISTINCT
      b.id,
      b.title,
      b.description,
      b.type
    FROM benefit_beneficiary_category bc
    JOIN benefit b
      ON b.id = bc."benefitId"
    JOIN benefit_region br
      ON br."benefitId" = b.id
    LEFT JOIN user_benefit_status ubs
      ON ubs.benefit_id = b.id
     AND ubs.user_id = ${userId}
    WHERE bc."categoryId" = ANY(${categories}::text[])
      AND (${userRegionId} IS NULL OR br."regionId" = ${userRegionId})
      AND ubs.benefit_id IS NULL
  `;

  // считаем потери по каждой льготе
  const lossItems: LossItem[] = benefits.map((b) => {
    const { monthly, yearly } = estimateLossForBenefit(b);
    return {
      id: b.id,
      title: b.title,
      type: b.type,
      monthlyLoss: monthly,
      yearlyLoss: yearly,
    };
  });

  // сортировка по годовой потере
  lossItems.sort((a, b) => b.yearlyLoss - a.yearlyLoss);

  const totalMonthly = lossItems.reduce((acc, item) => acc + item.monthlyLoss, 0);
  const totalYearly = lossItems.reduce((acc, item) => acc + item.yearlyLoss, 0);

  return {
    userId,
    categories,
    lossItems,
    totalLossMonthly: totalMonthly,
    totalLossYearly: totalYearly,
  };
}

function estimateLossForBenefit(benefit: BenefitRow): { monthly: number; yearly: number } {
  const id = benefit.id;
  const type = benefit.type;

  let monthly: number;

  if (id in BENEFIT_MONTHLY_MAP) {
    monthly = BENEFIT_MONTHLY_MAP[id];
  } else if (type in BASE_MONTHLY_BY_TYPE) {
    monthly = BASE_MONTHLY_BY_TYPE[type];
  } else {
    monthly = 1000;
  }

  const yearly = monthly * 12;
  return { monthly, yearly };
}