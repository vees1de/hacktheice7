import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { RegisterDto } from 'src/auth/dto/register.dto';
import { hash } from 'argon2';
import { UserDto } from './user.dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async create(dto: RegisterDto) {
    const hashedPassword = await hash(dto.password);

    // Убедитесь, что все ОБЯЗАТЕЛЬНЫЕ поля из схемы Prisma здесь
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash: hashedPassword,
        regionId: dto.regionId,
        authProvider: 'email' // Явно указываем, т.к. это регистрация по email
      }
    });

    return user;
  }

  async getByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: {
        email
      }
    });
  }

  async getById(id: string) {
    return this.prisma.user.findUnique({
      where: {
        id
      }
    });
  }

  async getProfile(id: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        id
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        snils: true,
        isVerified: true,
        authProvider: true,
        consentGiven: true,
        createdAt: true,
        region: {
          select: {
            id: true,
            name: true,
            code: true
          }
        }
      }
    });
    return user;
  }

  // --- ХЕНДЛЕР 2: Обновление профиля (updateProfile) ---
  async update(id: string, dto: UserDto) {
    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: {
        ...dto
      },
      // Возвращаем обновленный профиль
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        snils: true,
        isVerified: true,
        authProvider: true,
        consentGiven: true,
        createdAt: true
      }
    });
    return updatedUser;
  }
}
