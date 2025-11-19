import { IsNotEmpty, IsString } from 'class-validator';

export class SmartSearchDto {
  @IsString()
  @IsNotEmpty()
  query: string;
}
