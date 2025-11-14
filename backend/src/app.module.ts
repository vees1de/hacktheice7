import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma.module';

@Module({
  imports: [ConfigModule.forRoot(), AuthModule, UserModule, PrismaModule]
})
export class AppModule {}
