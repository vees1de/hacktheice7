// backend/src/loss/run-loss-test.ts
import { PrismaClient } from '@prisma/client';
import { calculateUserLoss } from './user-loss.logic';

const prisma = new PrismaClient();

async function getUsersWithConfirmedCategories(limit = 5): Promise<string[]> {
  const rows = await prisma.$queryRaw<{ userId: string }[]>`
    SELECT DISTINCT "userId"
    FROM user_beneficiary_category
    WHERE confirmed = true
    LIMIT ${limit}
  `;
  return rows.map((row) => row.userId);
}

async function main() {
  const userIds = await getUsersWithConfirmedCategories(5);

  if (userIds.length === 0) {
    console.log('Нет пользователей с подтверждёнными категориями');
    return;
  }

  for (const userId of userIds) {
    const result = await calculateUserLoss(prisma, userId);
    console.log('\n==============================');
    console.log(`Результат для userId = ${userId}:`);
    console.log(JSON.stringify(result, null, 2));
  }
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });