// register.dto.ts
import {
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MinLength
} from 'class-validator';

export class RegisterDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsNotEmpty()
  @IsString()
  firstName: string;

  @IsNotEmpty()
  @IsString()
  lastName: string;

  @IsOptional()
  @IsString()
  patronymic?: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^79\d{9}$/, { message: 'Phone must be in format 79XXXXXXXXX' })
  phone: string;

  @IsOptional()
  @IsString()
  snils?: string;

  @IsNotEmpty()
  @IsString()
  regionId: string;

  @IsNotEmpty()
  @IsDateString()
  dateOfBirth: Date;

  @MinLength(6, {
    message: 'Password must be at least 6 characters long'
  })
  @IsString()
  password: string;
}
