import { IsArray, IsNotEmpty, IsString } from 'class-validator';
import { BeneficiaryCategoryType } from '@prisma/client';

export class AssignCategoryDto {
  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsArray()
  @IsNotEmpty()
  categories: BeneficiaryCategoryType[];
}
