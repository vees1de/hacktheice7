<script setup lang="ts">
import { AuthLoginRequest, useAuthStore } from '@entities/auth';
import { useUserStore } from '@entities/user';
import { createForm } from '@shared/lib/createForm';
import { required } from '@shared/lib/validators';
import { ROUTE_NAMES } from '@shared/model/routes.constants';
import { useViewStore } from '@shared/stores/view.store';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

import SmsAuthForm from './AuthPage/SmsAuthForm.vue';
import type { AuthForm } from './AuthPage/types';

const router = useRouter();
const authStore = useAuthStore();
const viewStore = useViewStore();
const userStore = useUserStore();

const createdForm = createForm<AuthForm>({
  phone: { value: '', validators: [required()] },
  password: { value: '', validators: [required()] }
});
const { form, getValue, checkValidation } = createdForm;

const step = ref(1);
const goBackToWelcome = () => {
  router.push(ROUTE_NAMES.WELCOME);
};

const goToPhoneConfirmationStep = async () => {
  const formHasError = checkValidation();
  if (!formHasError) {
    viewStore.toggleLoader();
    try {
      const body = getValue() as AuthLoginRequest;
      body.phone = '79' + body.phone;
      await authStore.login(body);
      await userStore.getUser();
      await router.push(ROUTE_NAMES.HOME);
      step.value = 2;
    } catch (error) {
      console.log(error);
    } finally {
      viewStore.toggleLoader();
    }
  }
};

const redirectToRegisterPage = async () => {
  await router.push(ROUTE_NAMES.REGISTRATION);
};
</script>

<template>
  <div class="auth">
    <div class="logo">
      <img src="/assets/icons/lasso-icon.svg" />
      <img src="/assets/icons/lasso-title.svg" />
    </div>
    <SmsAuthForm
      :form="form"
      :step="step"
      @submit="goToPhoneConfirmationStep"
      @register="redirectToRegisterPage"
      @back="goBackToWelcome"
    />
  </div>
</template>

<style scoped lang="scss">
.logo {
  display: flex;

  width: 100%;
  justify-content: center;
  align-items: center;
  gap: 10px;
  margin-bottom: 32px;

  img {
    filter: brightness(0) saturate(100%) invert(30%) sepia(84%) saturate(1600%)
      hue-rotate(197deg) brightness(101%) contrast(90%);
  }

  img:first-child {
    width: 55px;
    height: 55px;
  }

  h1 {
    font-size: 1.875;
    font-weight: 700;
  }
}

.auth {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 24px;
}
</style>
