import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { PrismaService } from '../prisma.service';
import { UserService } from 'src/user/user.service';
import { BeneficiaryCategoryService } from 'src/beneficiary-category/beneficiary-category.service';

@Module({
  controllers: [AdminController],
  providers: [PrismaService, UserService, BeneficiaryCategoryService]
})
export class AdminModule {}
