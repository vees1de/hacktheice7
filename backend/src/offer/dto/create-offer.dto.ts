import {
  ArrayNotEmpty,
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl
} from 'class-validator';

export class CreateOfferDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  @IsNotEmpty()
  partnerName: string;

  @IsOptional()
  @IsString()
  partnerLogo?: string;

  @IsString()
  @IsNotEmpty()
  discount: string;

  @IsDateString()
  validFrom: string;

  @IsDateString()
  validTo: string;

  @IsString()
  @IsNotEmpty()
  terms: string;

  @IsOptional()
  @IsUrl()
  link?: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  regionIds: string[];

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  categoryIds: string[];
}
