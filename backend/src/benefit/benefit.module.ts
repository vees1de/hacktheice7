import { Module } from '@nestjs/common';
import { BenefitController } from './benefit.controller';
import { BenefitService } from './benefit.service';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [BenefitController],
  providers: [BenefitService, PrismaService]
})
export class BenefitModule {}
