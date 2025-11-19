import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma.module';
import { RegionModule } from './region/regios.module';
import { AdminModule } from './admin/admin.module';
import { OfferModule } from './offer/offer.module';
import { BenefitModule } from './benefit/benefit.module';
import { BeneficiaryCategoryModule } from './beneficiary-category/beneficiary-category.module';
import { SmartSearchModule } from './smart-search/smart-search.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    AuthModule,
    UserModule,
    PrismaModule,
    RegionModule,
    AdminModule,
    OfferModule,
    BenefitModule,
    BeneficiaryCategoryModule,
    SmartSearchModule
  ]
})
export class AppModule {}
