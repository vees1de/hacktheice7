import { toAuthRegisterDto } from './lib/mapper.ts';
import { useAuthStore } from './model/auth.store';
import {
  AuthLoginRequest,
  AuthRegisterRequest,
  VerifyPhoneRequest
} from './types/auth.types';

export { authApi } from './api/auth.ts';

export { toAuthRegisterDto, useAuthStore };
export type { AuthLoginRequest, AuthRegisterRequest, VerifyPhoneRequest };
