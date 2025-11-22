<script setup lang="ts">
import { ROUTE_NAMES } from '@shared/model/routes.constants';
import { useRouter } from 'vue-router';

import AuthMethodChoice from './AuthPage/AuthMethodChoice.vue';

const router = useRouter();

const goToSms = () => router.push(ROUTE_NAMES.AUTH);
const goToSber = () => router.push(ROUTE_NAMES.SBER);
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
}

.logo {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}
</style>
