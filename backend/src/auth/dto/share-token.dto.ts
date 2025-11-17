import { IsNotEmpty, IsString } from 'class-validator';

export class ShareTokenDto {
  @IsString()
  @IsNotEmpty()
  token: string;
}
