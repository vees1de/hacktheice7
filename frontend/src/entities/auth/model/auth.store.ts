import { useUserStore } from '@entities/user';
import { userApi } from '@entities/user/api/user';
import { clearTokens, setTokens } from '@shared/api/token.service';
import { ROUTE_NAMES } from '@shared/model/routes.constants';
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

import { useBiometricStore } from './biometric.store';
import { authApi } from '../api/auth';
import {
  AuthLoginRequest,
  AuthRegisterRequest,
  AuthSuccess,
  VerifyPhoneRequest
} from '../types/auth.types';

export const useAuthStore = defineStore('auth', () => {
  const isAuthenticated = ref(false);
  const router = useRouter();
  const userStore = useUserStore();
  const biometricStore = useBiometricStore();

  const setAuth = async (data: AuthSuccess | null) => {
    isAuthenticated.value = Boolean(data);
    if (data) {
      await setTokens(data.accessToken, data.refreshToken);
    }
  };

  const checkToken = async () => {
    if (!isAuthenticated.value) {
      const response = await userApi.getProfile();
      userStore.setUser(response.data);
      if (response.status === 200) {
        isAuthenticated.value = true;
      }
    }
  };

  const register = async (payload: AuthRegisterRequest) => {
    return authApi.register(payload);
  };

  const login = async (payload: AuthLoginRequest) => {
    const auth = await authApi.login(payload);
    setAuth(auth);
    return auth;
  };

  const logout = async () => {
    await clearTokens();
    await biometricStore.clearAll();
    isAuthenticated.value = false;
    router.push(ROUTE_NAMES.WELCOME);
  };

  const mobileConfirm = async (verifyBody: VerifyPhoneRequest) => {
    const auth = await authApi.verifyPhone(verifyBody);
    setAuth(auth);
    return auth;
  };

  return {
    isAuthenticated,
    register,
    login,
    logout,
    setAuth,
    checkToken,
    mobileConfirm
  };
});
