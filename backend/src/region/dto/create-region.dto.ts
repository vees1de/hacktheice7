import { IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateRegionDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  @Length(1, 10, { message: 'Region code must be between 1 and 10 characters' })
  code: string;

  @IsNotEmpty()
  @IsString()
  @IsString()
  type: string; // "federal", "regional", "municipal"
}
