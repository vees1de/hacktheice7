import { IsNotEmpty, IsString } from 'class-validator';

export class HideBenefitDto {
  @IsNotEmpty()
  @IsString()
  benefitId: string;
}
