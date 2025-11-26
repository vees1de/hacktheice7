import { toAuthRegisterDto } from './lib/mapper.ts';
import { useAuthStore } from './model/auth.store';
import { useBiometricStore } from './model/biometric.store';
import {
  AuthLoginRequest,
  AuthRegisterRequest,
  VerifyPhoneRequest
} from './types/auth.types';
import {
  BiometricLoginOptionsResponse,
  BiometricMeta
} from './types/webauthn.types';

export { authApi } from './api/auth.ts';
export { biometricApi } from './api/biometric.ts';

export { toAuthRegisterDto, useAuthStore, useBiometricStore };
export type {
  AuthLoginRequest,
  AuthRegisterRequest,
  VerifyPhoneRequest,
  BiometricLoginOptionsResponse,
  BiometricMeta
};
