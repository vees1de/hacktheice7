<script setup lang="ts">
import { ROUTE_NAMES } from '@shared/model/routes.constants';
import { useRouter } from 'vue-router';

import SberIdStub from './AuthPage/SberIdStub.vue';

const router = useRouter();
const goBack = () => router.push(ROUTE_NAMES.WELCOME);
</script>

<template>
  <div class="auth">
    <div class="logo">
      <img
        src="/assets/icons/lasso-icon.svg"
        alt="''"
      />
      <img
        src="/assets/icons/lasso-title.svg"
        alt="''"
      />
    </div>

    <SberIdStub @back="goBack" />
  </div>
</template>

<style scoped lang="scss">
.auth {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 64px;
}

.logo {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  margin-bottom: 32px;
}
</style>
