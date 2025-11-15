import { apiRequest } from '../http.client';
import {
  AuthLoginRequest,
  AuthRegisterRequest,
  AuthSuccess
} from '../types';
import { setTokens } from '../token.service';

export const authApi = {
  async register(payload: AuthRegisterRequest) {
    const { data } = await apiRequest<{ userId: string; message?: string }>(
      '/auth/register',
      { method: 'POST', data: payload }
    );
    return data;
  },

  async verifyPhone(payload: { phone: string; code: string }) {
    const { data } = await apiRequest<{ message: string }>('/auth/verify-phone', {
      method: 'POST',
      data: payload
    });
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
