import { BeneficiaryCategoryType } from '@prisma/client';
import { IsEnum, IsString } from 'class-validator';

export class UpdateUserCategoryDto {
  @IsString()
  userId: string;

  @IsEnum(BeneficiaryCategoryType)
  category: BeneficiaryCategoryType;
}
