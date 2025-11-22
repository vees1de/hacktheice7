import { Module } from '@nestjs/common';
import { LossController } from './loss.controller';
import { LossService } from './loss.service';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [LossController],
  providers: [LossService, PrismaService],
  exports: [LossService]
})
export class LossModule {}
