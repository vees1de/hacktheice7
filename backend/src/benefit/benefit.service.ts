import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateBenefitDto } from './dto/create-benefit.dto';
import { UpdateBenefitDto } from './dto/update-benefit.dto';

@Injectable()
export class BenefitService {
  private readonly benefitInclude = {
    benefitRegions: {
      include: {
        region: true
      }
    },
    benefitCategories: {
      include: {
        beneficiaryCategory: true
      }
    }
  } as const;

  constructor(private readonly prisma: PrismaService) {}

  async getAll() {
    return this.prisma.benefit.findMany({
      include: this.benefitInclude,
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  async getById(id: string) {
    const benefit = await this.prisma.benefit.findUnique({
      where: { id },
      include: this.benefitInclude
    });

    if (!benefit) {
      throw new NotFoundException('Benefit not found');
    }

    return benefit;
  }

  async create(dto: CreateBenefitDto) {
    return this.prisma.benefit.create({
      data: {
        title: dto.title,
        description: dto.description ?? null,
        type: dto.type,
        validFrom: new Date(dto.validFrom),
        validTo: new Date(dto.validTo),
        requirements: dto.requirements,
        howToGet: dto.howToGet,
        sourceUrl: dto.sourceUrl ?? null,
        benefitRegions: {
          create: dto.regionIds.map(regionId => ({
            region: {
              connect: { id: regionId }
            }
          }))
        },
        benefitCategories: {
          create: dto.categoryIds.map(categoryId => ({
            beneficiaryCategory: {
              connect: { id: categoryId }
            }
          }))
        }
      },
      include: this.benefitInclude
    });
  }

  async update(id: string, dto: UpdateBenefitDto) {
    await this.ensureExists(id);

    return this.prisma.benefit.update({
      where: { id },
      data: {
        title: dto.title,
        description:
          dto.description !== undefined ? dto.description : undefined,
        type: dto.type,
        validFrom: dto.validFrom ? new Date(dto.validFrom) : undefined,
        validTo: dto.validTo ? new Date(dto.validTo) : undefined,
        requirements: dto.requirements,
        howToGet: dto.howToGet,
        sourceUrl: dto.sourceUrl !== undefined ? dto.sourceUrl : undefined,
        benefitRegions: dto.regionIds
          ? {
              deleteMany: {},
              create: dto.regionIds.map(regionId => ({
                region: {
                  connect: { id: regionId }
                }
              }))
            }
          : undefined,
        benefitCategories: dto.categoryIds
          ? {
              deleteMany: {},
              create: dto.categoryIds.map(categoryId => ({
                beneficiaryCategory: {
                  connect: { id: categoryId }
                }
              }))
            }
          : undefined
      },
      include: this.benefitInclude
    });
  }

  async remove(id: string) {
    await this.ensureExists(id);

    await this.prisma.benefit.delete({
      where: { id }
    });

    return { id };
  }

  private async ensureExists(id: string) {
    const exists = await this.prisma.benefit.findUnique({
      where: { id },
      select: { id: true }
    });

    if (!exists) {
      throw new NotFoundException('Benefit not found');
    }
  }
}
