<script setup lang="ts">
import { useAuthStore } from '@entities/auth';
import type { AuthLoginRequest } from '@entities/auth';
import { useUserStore } from '@entities/user';
import { ROUTE_NAMES } from '@shared/model/routes.constants';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

import AuthMethodChoice from './AuthPage/AuthMethodChoice.vue';

const router = useRouter();
const authStore = useAuthStore();
const userStore = useUserStore();

const goToSms = () => router.push(ROUTE_NAMES.AUTH);
const goToSber = () => router.push(ROUTE_NAMES.SBER);

const isDemoLoading = ref(false);
const demoCredentials: AuthLoginRequest = {
  phone: '79222222222',
  password: '123456'
};

const loginAsDemo = async () => {
  if (isDemoLoading.value) return;
  isDemoLoading.value = true;
  try {
    await authStore.login(demoCredentials);
    await userStore.getUser();
    await router.push(ROUTE_NAMES.HOME);
  } catch (error) {
    console.error('Не удалось выполнить демо-вход', error);
  } finally {
    isDemoLoading.value = false;
  }
};
</script>

<template>
  <div class="auth">
    <div class="logo">
      <img
        class="logo-img"
        src="/assets/icons/lasso-icon.svg"
      />
      <img src="/assets/icons/lasso-title.svg" />
    </div>

    <AuthMethodChoice
      @select-sms="goToSms"
      @select-sber="goToSber"
    />
    <button
      class="demo-button"
      :disabled="isDemoLoading"
      type="button"
      @click="loginAsDemo"
    >
      {{ isDemoLoading ? 'Входим...' : 'ДЕМО ДОСТУП' }}
    </button>
  </div>
</template>

<style scoped lang="scss">
.logo {
  .logo-img {
    width: 160px;
    height: 160px;
    fill: #1a73e8;
  }

  img {
    width: 160px;
  }
}

.auth {
  height: calc(100dvh - 106px);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding-top: 80px;
  gap: 32px;
}

.logo {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.demo-button {
  border: none;
  border-radius: 16px;
  padding: 14px 18px;
  font-size: 1rem;
  font-weight: 700;
  background: linear-gradient(135deg, #1a73e8, #2563eb);
  color: #fff;
  cursor: pointer;
  transition: opacity 0.2s ease;

  &:disabled {
    opacity: 0.7;
    cursor: default;
  }
}
</style>
