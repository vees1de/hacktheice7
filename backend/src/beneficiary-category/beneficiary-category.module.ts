import { Module } from '@nestjs/common';
import { BeneficiaryCategoryController } from './beneficiary-category.controller';
import { BeneficiaryCategoryService } from './beneficiary-category.service';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [BeneficiaryCategoryController],
  providers: [BeneficiaryCategoryService, PrismaService],
  exports: [BeneficiaryCategoryService]
})
export class BeneficiaryCategoryModule {}
