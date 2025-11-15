import {
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsString,
  ValidateNested
} from 'class-validator';
import { BeneficiaryCategoryType } from '@prisma/client';
import { Type } from 'class-transformer';

export class ApproveUserDto {
  @IsString()
  userId: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true }) // Явно указываем, что каждый элемент массива должен быть строкой
  categories: string[];
}
