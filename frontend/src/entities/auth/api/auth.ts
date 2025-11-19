import { apiRequest } from '@shared/api';
import { setTokens } from '@shared/api/token.service';

import {
  AuthLoginRequest,
  AuthRegisterRequest,
  AuthSuccess,
  VerifyPhoneRequest
} from '../types/auth.types';

export const authApi = {
  async register(payload: AuthRegisterRequest) {
    const { data } = await apiRequest<{
      result: boolean;
      message?: string;
      data: { phone: string };
    }>('/auth/register', {
      method: 'POST',
      data: payload
    });
    return data;
  },

  async verifyPhone(payload: VerifyPhoneRequest) {
    const { data } = await apiRequest<{ message: string }>(
      '/auth/verify-phone',
      {
        method: 'POST',
        data: payload
      }
    );
    return data;
  },

  async login(payload: AuthLoginRequest) {
    const { data } = await apiRequest<AuthSuccess>('/auth/login', {
      method: 'POST',
      data: payload
    });
    setTokens(data.accessToken, data.refreshToken);
    return data;
  },

  async refresh(refreshToken?: string) {
    const { data } = await apiRequest<AuthSuccess>('/auth/refresh', {
      method: 'POST',
      data: { refreshToken }
    });
    setTokens(data.accessToken, data.refreshToken);
    return data;
  }
};
