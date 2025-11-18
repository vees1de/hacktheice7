<script setup lang="ts">
import { AuthLoginRequest, useAuthStore } from '@entities/auth';
import { createForm } from '@shared/lib/createForm';
import { required } from '@shared/lib/validators';
import { useViewStore } from '@shared/stores/view.store';
import { FieldMetaData } from '@shared/types/formFieldMetaData';
import { Button, Input } from '@shared/ui';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

export type AuthForm = {
  [K in keyof AuthLoginRequest]: FieldMetaData<string>;
};

const router = useRouter();
const authStore = useAuthStore();
const viewStore = useViewStore();

const createdForm = createForm<AuthForm>({
  phone: { value: '', validators: [required()] },
  password: { value: '', validators: [required()] }
});
const { form, getValue, checkValidation } = createdForm;

const step = ref(1);

const goToPhoneConfirmationStep = async () => {
  const formHasError = checkValidation();
  if (!formHasError) {
    viewStore.toggleLoader();
    try {
      const body = getValue() as AuthLoginRequest;
      body.phone = '+79' + body.phone;
      await authStore.login(body);
      await router.push('/home');
      step.value = 2;
    } catch (error) {
      console.log(error);
    } finally {
      viewStore.toggleLoader();
    }
  }
};

const redirectToRegisterPage = async () => {
  await router.push('/registration');
};
</script>

<template>
  <div class="auth">
    <div class="logo">
      <img src="@shared/assets/icons/lasso-icon.svg" />
      <img src="@shared/assets/icons/lasso-title.svg" />
    </div>

    <div class="language">
      <span>Русский язык</span>
      <img
        src="@shared/assets/icons/russia-icon.svg"
        alt=""
      />
    </div>

    <!-- ШАГ 1 -->
    <form class="auth__form">
      <Input
        v-model="form.phone.value"
        label="Телефон"
        type="tel"
        inputmode="tel"
        placeholder="+7"
        :error="form.phone.error"
      >
        <template v-slot:error>Заполните телефон верно</template>
      </Input>
      <Input
        v-model="form.password.value"
        label="Пароль"
        type="password"
        :error="form.password.error"
      >
        <template v-slot:error>Обязательное поле</template>
      </Input>
    </form>

    <div class="auth__buttons">
      <Button
        v-if="step === 1"
        class="submit"
        @click="goToPhoneConfirmationStep"
      >
        Продолжить
      </Button>
      <Button
        v-if="step === 1"
        class="submit"
        kind="secondary"
        @click="redirectToRegisterPage()"
      >
        Нет аккаунта
      </Button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.button__step2 {
  margin-top: 32px;
}

.code-wrapper {
  display: flex;
  justify-content: center;
}

.code-inputs {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.code-box {
  width: 56px;
  height: 64px;
  font-size: 2rem;
  font-weight: 600;
  text-align: center;
  border-radius: 12px;
  border: 1.5px solid #d0d5dd;
  outline: none;
  transition: 0.2s border;

  &:focus {
    border-color: #1a73e8;
  }
}

.submit[disabled] {
  opacity: 0.5;
  pointer-events: none;
}

.has-account {
  text-align: center;
  font-size: 1rem;

  a {
    text-decoration: none;
    color: #1a73e8;
  }
}

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

.language {
  display: flex;
  justify-content: center;
  gap: 4px;
  font-size: 1rem;
  font-weight: 500;
  margin-bottom: 32px;
}

.auth {
  position: relative;
  height: 90dvh;

  &__title {
    font-size: 1.5rem;
    font-weight: 600;
    text-align: center;
    margin-bottom: 24px;
  }

  &__buttons {
    width: 100%;
    display: grid;
    gap: 12px;
    position: absolute;
    bottom: 16px;
  }

  &__form {
    // Mobile first (default)
    width: 100%;

    @include tablet {
      width: 70%;
    }

    @include desktop-md {
      width: 50%;
    }

    @include desktop-lg {
      width: 40%;
    }
  }
}
</style>
