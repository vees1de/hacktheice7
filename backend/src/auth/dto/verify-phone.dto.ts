import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class VerifyPhoneDto {
  @IsNotEmpty()
  @IsString()
  @Matches(/^79\d{9}$/, { message: 'Phone must be in format 79XXXXXXXXX' })
  phone: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^\d{4}$/, { message: 'Verification code must be 4 digits' })
  code: string;
}
