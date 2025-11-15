import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class VerifyPhoneDto {
  @IsNotEmpty()
  @IsString()
  @Matches(/^\+7\d{10}$/, { message: 'Phone must be in format +7XXXXXXXXXX' })
  phone: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^\d{4}$/, { message: 'Verification code must be 4 digits' })
  code: string;
}
