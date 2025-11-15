// prisma/seed.ts
import { PrismaClient, Prisma } from '@prisma/client';
import { hash } from 'argon2'; // Используем ту же библиотеку, что и в приложении

const prisma = new PrismaClient();

async function main() {
  // Пример: создание региона, если он не существует
  const region = await prisma.region.upsert({
    where: { code: '00' }, // Используем уникальное поле
    update: {},
    create: {
      id: 'test_region_admin', // Уникальный ID
      name: 'Test Admin Region',
      code: '00',
      type: 'federal'
    }
  });

  // Хэшируем пароль для админа
  const adminPasswordHash = await hash('adminPassword123'); // Используйте надежный пароль для тестов

  // Создаем или обновляем администринского пользователя
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@admin.ru' }, // Используем email, который соответствует критериям админа
    update: {},
    create: {
      email: 'admin@example.com',
      passwordHash: adminPasswordHash,
      firstName: 'Admin',
      lastName: 'User',
      patronymic: 'Testovich',
      dateOfBirth: new Date('1980-01-01'),
      phone: '+79999999999', // Уникальный телефон
      snils: '11111111111', // Уникальный СНИЛС
      regionId: region.id, // Связываем с созданным регионом
      authProvider: 'email',
      isVerified: true, // Можно сразу подтвердить
      consentGiven: true,
      consentDate: new Date(),
      status: 'ACTIVE' // Устанавливаем статус сразу активным
      // Другие поля по необходимости
    }
  });

  console.log('Admin user created/updated:', adminUser);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async e => {
    console.error(e);
    await prisma.$disconnect();
  });
