import {
  ArrayNotEmpty,
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl
} from 'class-validator';

export class CreateBenefitDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  @IsNotEmpty()
  type: string;

  @IsDateString()
  validFrom: string;

  @IsDateString()
  validTo: string;

  @IsString()
  @IsNotEmpty()
  requirements: string;

  @IsString()
  @IsNotEmpty()
  howToGet: string;

  @IsOptional()
  @IsUrl()
  sourceUrl?: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  regionIds: string[];

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  categoryIds: string[];
}
