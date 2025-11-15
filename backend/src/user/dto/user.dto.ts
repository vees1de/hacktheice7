import {
  IsOptional,
  IsString,
  IsEmail,
  IsPhoneNumber,
  IsDate,
  IsEnum,
  IsBoolean,
  IsArray,
  ValidateNested,
  IsIn
} from 'class-validator';
import { Type } from 'class-transformer';
import { BeneficiaryCategoryType } from '@prisma/client';

export class UpdateBeneficiaryCategoryDto {
  @IsEnum(BeneficiaryCategoryType)
  name: BeneficiaryCategoryType;

  @IsBoolean()
  confirmed: boolean;
}

export class UserDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  patronymic?: string;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  dateOfBirth?: Date;

  @IsOptional()
  @IsPhoneNumber('RU') // Валидация для российского формата телефона
  phone?: string;

  @IsOptional()
  @IsString()
  snils?: string;

  @IsOptional()
  @IsString()
  regionId?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateBeneficiaryCategoryDto)
  userBeneficiaryCategories?: UpdateBeneficiaryCategoryDto[];

  @IsOptional()
  @IsString()
  password?: string; // Поле для обновления пароля

  // Поля, которые, вероятно, не должны быть обновляемы напрямую через этот DTO,
  // но могут быть включены в зависимости от бизнес-логики
  // @IsOptional()
  // @IsEnum(UserStatus)
  // status?: UserStatus;
  //
  // @IsOptional()
  // @IsEnum(OnboardingStep)
  // onboardingStep?: OnboardingStep;
  //
  // @IsOptional()
  // @IsBoolean()
  // isVerified?: boolean;
  //
  // @IsOptional()
  // @IsBoolean()
  // isEsiaVerified?: boolean;
  //
  // @IsOptional()
  // @IsBoolean()
  // consentGiven?: boolean;
}
