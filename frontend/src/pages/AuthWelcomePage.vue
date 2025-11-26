<script setup lang="ts">
import type { AuthLoginRequest } from '@entities/auth';
import { useAuthStore } from '@entities/auth';
import { useUserStore } from '@entities/user';
import { ROUTE_NAMES } from '@shared/model/routes.constants';
import { useLangStore } from '@shared/stores/language.store';
import { storeToRefs } from 'pinia';
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

import AuthMethodChoice from './AuthPage/AuthMethodChoice.vue';

const router = useRouter();
const authStore = useAuthStore();
const userStore = useUserStore();
const langStore = useLangStore();
const { locale } = storeToRefs(langStore);
const { change } = langStore;

const goToSms = () => router.push(ROUTE_NAMES.AUTH);

const isDemoLoading = ref(false);
const demoCredentials: AuthLoginRequest = {
  phone: '79222222222',
  password: '123456'
};
onMounted(async () => {
  try {
    await authStore.checkToken();
    if (authStore.isAuthenticated) {
      await router.push(ROUTE_NAMES.SECURE);
    }
  } catch {
    // ignore
  }
});

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
    <div class="change-lang">
      <button
        @click="change"
        type="button"
        class="lang-switcher"
      >
        <img
          :src="
            locale === 'ru'
              ? '/assets/images/russia.png'
              : '/assets/images/sakha.png'
          "
          :alt="locale === 'ru' ? 'Россия' : 'Саха (Якутия)'"
          class="lang-flag"
        />
        <span class="lang-text">{{
          locale === 'ru' ? 'русский' : 'саха'
        }}</span>
      </button>
    </div>

    <AuthMethodChoice
      @select-sms="goToSms"
      @select-demo="loginAsDemo"
    />
  </div>
</template>

<style scoped lang="scss">
.lang-switcher {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background-color: #fff;
  font-size: 14px;
  color: #333;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
  margin: auto;
}

.lang-switcher:hover {
  background-color: #f9f9f9;
  border-color: #bbb;
}

.lang-flag {
  width: 20px;
  height: 14px;
  display: block;
  object-fit: contain;
  border-radius: 2px;
}

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

.error {
  margin: 0;
  color: #ef4444;
  font-size: 0.9rem;
  text-align: center;
}
</style>
