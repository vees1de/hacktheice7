import {
  IsNotEmpty,
  IsNotEmptyObject,
  IsObject,
  IsString
} from 'class-validator';
import {
  AuthenticationResponseJSON,
  RegistrationResponseJSON
} from '@simplewebauthn/types';

export class WebauthnLoginOptionsDto {
  @IsString()
  @IsNotEmpty()
  phone: string;
}

export class WebauthnLoginVerifyDto {
  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsObject()
  @IsNotEmptyObject()
  response: AuthenticationResponseJSON;
}

export class WebauthnRegisterVerifyDto {
  @IsObject()
  @IsNotEmptyObject()
  response: RegistrationResponseJSON;
}
