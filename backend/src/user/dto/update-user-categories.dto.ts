import { BeneficiaryCategoryType } from '@prisma/client';
import { IsArray, IsEnum } from 'class-validator';

export class UpdateUserCategoriesDto {
  @IsArray()
  @IsEnum(BeneficiaryCategoryType, { each: true })
  categories: BeneficiaryCategoryType[];
}
