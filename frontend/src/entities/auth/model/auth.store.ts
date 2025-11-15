import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { authApi } from '@shared/api';
import { clearTokens, setTokens } from '@shared/api/token.service';
import type { AuthLoginRequest, AuthRegisterRequest, AuthSuccess } from '@shared/api';

export const useAuthStore = defineStore('auth', () => {
  const isAuthenticated = ref(false);
  const router = useRouter();

  const setAuth = (data: AuthSuccess | null) => {
    isAuthenticated.value = Boolean(data);
    if (data) {
      setTokens(data.accessToken, data.refreshToken);
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

  const logout = () => {
    clearTokens();
    isAuthenticated.value = false;
    router.push('/auth');
  };

  const authorize = () => {
    isAuthenticated.value = true;
  };

  return { isAuthenticated, authorize, register, login, logout, setAuth };
});
