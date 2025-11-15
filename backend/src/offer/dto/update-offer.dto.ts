import {
  IsArray,
  IsDateString,
  IsOptional,
  IsString,
  IsUrl
} from 'class-validator';

export class UpdateOfferDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  partnerName?: string;

  @IsOptional()
  @IsString()
  partnerLogo?: string;

  @IsOptional()
  @IsString()
  discount?: string;

  @IsOptional()
  @IsDateString()
  validFrom?: string;

  @IsOptional()
  @IsDateString()
  validTo?: string;

  @IsOptional()
  @IsString()
  terms?: string;

  @IsOptional()
  @IsUrl()
  link?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  regionIds?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  categoryIds?: string[];
}
