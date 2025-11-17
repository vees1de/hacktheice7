import { UserProfile } from '@entities/user';

export interface IAuthForm {
  email: string;
  password: string;
}

export interface IRegisterForm extends IAuthForm {
  confirmPassword: string;
}

export interface IUser {
  id: number;
  name?: string;
  email: string;

  workInterval?: number;
  breakInterval?: number;
  intervalsCount?: number;
}

export interface IAuthResponse {
  accessToken: string;
  user: IUser;
}

export type TypeUserForm = Omit<IUser, 'id'> & { password?: string };

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthSuccess {
  user: UserProfile;
  accessToken: string;
  refreshToken: string;
}

export interface AuthRegisterRequest {
  email?: string;
  password: string;
  firstName: string;
  lastName: string;
  patronymic?: string;
  dateOfBirth: string;
  phone: string;
  snils?: string;
  regionId: string;
}

export interface VerifyPhoneRequest {
  phone: string;
  code: string;
}

export interface AuthLoginRequest {
  phone: string;
  password: string;
}
