import { IsString } from 'class-validator';
import { AuthDto } from './auth.dto';

export class RegisterDto extends AuthDto {
  @IsString()
  regionId: string;
}
