import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateRegionDto } from './dto/create-region.dto';
import { UpdateRegionDto } from './dto/update-region.dto';

@Injectable()
export class RegionService {
  constructor(private prisma: PrismaService) {}

  async getAllRegions() {
    return this.prisma.region.findMany({
      select: {
        id: true,
        name: true,
        code: true,
        type: true,
        _count: {
          select: {
            users: true,
            benefitRegions: true,
            offerRegions: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });
  }

  async getRegionById(id: string) {
    const region = await this.prisma.region.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        code: true,
        type: true,
        _count: {
          select: {
            users: true,
            benefitRegions: true,
            offerRegions: true
          }
        }
      }
    });

    if (!region) {
      throw new NotFoundException('Region not found');
    }

    return region;
  }

  async createRegion(dto: CreateRegionDto) {
    // Проверяем, не существует ли уже региона с таким именем или кодом
    const existingRegionByName = await this.prisma.region.findFirst({
      where: { name: dto.name }
    });

    if (existingRegionByName) {
      throw new BadRequestException('Region with this name already exists');
    }

    const existingRegionByCode = await this.prisma.region.findFirst({
      where: { code: dto.code }
    });

    if (existingRegionByCode) {
      throw new BadRequestException('Region with this code already exists');
    }

    return this.prisma.region.create({
      data: {
        name: dto.name,
        code: dto.code,
        type: dto.type
      },
      select: {
        id: true,
        name: true,
        code: true,
        type: true
      }
    });
  }

  async updateRegion(id: string, dto: UpdateRegionDto) {
    // Проверяем, существует ли регион
    const existingRegion = await this.prisma.region.findUnique({
      where: { id }
    });

    if (!existingRegion) {
      throw new NotFoundException('Region not found');
    }

    // Проверяем на конфликты уникальности
    if (dto.name && dto.name !== existingRegion.name) {
      const regionWithNameExists = await this.prisma.region.findFirst({
        where: { name: dto.name }
      });

      if (regionWithNameExists) {
        throw new BadRequestException('Region with this name already exists');
      }
    }

    if (dto.code && dto.code !== existingRegion.code) {
      const regionWithCodeExists = await this.prisma.region.findFirst({
        where: { code: dto.code }
      });

      if (regionWithCodeExists) {
        throw new BadRequestException('Region with this code already exists');
      }
    }

    return this.prisma.region.update({
      where: { id },
      data: {
        name: dto.name,
        code: dto.code,
        type: dto.type
      },
      select: {
        id: true,
        name: true,
        code: true,
        type: true
      }
    });
  }

  async deleteRegion(id: string) {
    // Проверяем, существует ли регион
    const region = await this.prisma.region.findUnique({
      where: { id },
      include: {
        users: true,
        benefitRegions: true,
        offerRegions: true
      }
    });

    if (!region) {
      throw new NotFoundException('Region not found');
    }

    // Проверяем, есть ли связанные данные
    if (
      region.users.length > 0 ||
      region.benefitRegions.length > 0 ||
      region.offerRegions.length > 0
    ) {
      throw new ForbiddenException(
        'Cannot delete region with associated data. Please remove associated users, benefits, and offers first.'
      );
    }

    return this.prisma.region.delete({
      where: { id },
      select: {
        id: true,
        name: true,
        code: true,
        type: true
      }
    });
  }
}
