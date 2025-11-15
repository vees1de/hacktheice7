import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateOfferDto } from './dto/create-offer.dto';
import { UpdateOfferDto } from './dto/update-offer.dto';

@Injectable()
export class OfferService {
  private readonly offerInclude = {
    offerRegions: {
      include: {
        region: true
      }
    },
    offerCategories: {
      include: {
        beneficiaryCategory: true
      }
    },
    createdByStaff: {
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        }
      }
    }
  } as const;

  constructor(private readonly prisma: PrismaService) {}

  async getAll() {
    return this.prisma.offer.findMany({
      include: this.offerInclude,
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  async getById(id: string) {
    const offer = await this.prisma.offer.findUnique({
      where: { id },
      include: this.offerInclude
    });

    if (!offer) {
      throw new NotFoundException('Offer not found');
    }

    return offer;
  }

  async create(dto: CreateOfferDto, staffId: string) {
    return this.prisma.offer.create({
      data: {
        title: dto.title,
        description: dto.description ?? null,
        partnerName: dto.partnerName,
        partnerLogo: dto.partnerLogo ?? null,
        discount: dto.discount,
        validFrom: new Date(dto.validFrom),
        validTo: new Date(dto.validTo),
        terms: dto.terms,
        link: dto.link ?? null,
        createdByStaff: {
          connect: { id: staffId }
        },
        offerRegions: {
          create: dto.regionIds.map(regionId => ({
            region: {
              connect: { id: regionId }
            }
          }))
        },
        offerCategories: {
          create: dto.categoryIds.map(categoryId => ({
            beneficiaryCategory: {
              connect: { id: categoryId }
            }
          }))
        }
      },
      include: this.offerInclude
    });
  }

  async update(id: string, dto: UpdateOfferDto) {
    await this.ensureExists(id);

    return this.prisma.offer.update({
      where: { id },
      data: {
        title: dto.title,
        description:
          dto.description !== undefined ? dto.description : undefined,
        partnerName: dto.partnerName,
        partnerLogo:
          dto.partnerLogo !== undefined ? dto.partnerLogo : undefined,
        discount: dto.discount,
        validFrom: dto.validFrom ? new Date(dto.validFrom) : undefined,
        validTo: dto.validTo ? new Date(dto.validTo) : undefined,
        terms: dto.terms,
        link: dto.link !== undefined ? dto.link : undefined,
        offerRegions: dto.regionIds
          ? {
              deleteMany: {},
              create: dto.regionIds.map(regionId => ({
                region: {
                  connect: { id: regionId }
                }
              }))
            }
          : undefined,
        offerCategories: dto.categoryIds
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
      include: this.offerInclude
    });
  }

  async remove(id: string) {
    await this.ensureExists(id);
    await this.prisma.offer.delete({
      where: { id }
    });

    return { id };
  }

  private async ensureExists(id: string) {
    const exists = await this.prisma.offer.findUnique({
      where: { id },
      select: { id: true }
    });

    if (!exists) {
      throw new NotFoundException('Offer not found');
    }
  }
}
