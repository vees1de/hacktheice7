// src/region/region.service.ts
import {
  Injectable,
  BadRequestException,
  NotFoundException
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateRegionDto } from './dto/create-region.dto';

@Injectable()
export class RegionService {
  constructor(private prisma: PrismaService) {}

  async getAllRegions() {
    return this.prisma.region.findMany({
      select: {
        id: true,
        name: true,
        code: true,
        type: true
      },
      orderBy: {
        name: 'asc'
      }
    });
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
}
