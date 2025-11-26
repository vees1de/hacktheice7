import { apiRequest } from '@shared/api';
import { AuthSuccess } from '../types/auth.types';
import {
  AuthenticationResponseJSON,
  BiometricLoginOptionsResponse,
  PublicKeyCredentialCreationOptionsJSON,
  RegistrationResponseJSON
} from '../types/webauthn.types';

export const biometricApi = {
  async getRegisterOptions() {
    const { data } = await apiRequest<PublicKeyCredentialCreationOptionsJSON>(
      '/auth/webauthn/register/options',
      {
        method: 'GET'
      }
    );
    return data;
  },

  async verifyRegister(payload: RegistrationResponseJSON) {
    const { data } = await apiRequest<{ verified: boolean }>(
      '/auth/webauthn/register/verify',
      {
        method: 'POST',
        data: { response: payload }
      }
    );
    return data;
  },

  async getLoginOptions(phone: string) {
    const { data } = await apiRequest<BiometricLoginOptionsResponse>(
      '/auth/webauthn/login/options',
      {
        method: 'POST',
        data: { phone }
      }
    );
    return data;
  },

  async verifyLogin(
    phone: string,
    response: AuthenticationResponseJSON
  ): Promise<AuthSuccess> {
    const { data } = await apiRequest<AuthSuccess>(
      '/auth/webauthn/login/verify',
      {
        method: 'POST',
        data: { phone, response }
      }
    );
    return data;
  }
};
