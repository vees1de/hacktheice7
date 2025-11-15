import { IsString, IsOptional, MinLength, MaxLength } from 'class-validator';

export class UpdateRegionDto {
  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(100)
  name?: string;

  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(10)
  code?: string;

  @IsString()
  @IsOptional()
  @MinLength(3)
  @MaxLength(20)
  type?: string;
}
