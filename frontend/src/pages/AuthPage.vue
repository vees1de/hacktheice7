<script setup lang="ts">
import { AuthLoginRequest, useAuthStore } from '@entities/auth';
import { createForm } from '@shared/lib/createForm';
import { required } from '@shared/lib/validators';
import { FieldMetaData } from '@shared/types/formFieldMetaData';
import { Button, Input } from '@shared/ui';
import { CodeInput } from '@widgets/code-input';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

export type AuthForm = {
  [K in keyof AuthLoginRequest]: FieldMetaData<string>;
};

const router = useRouter();

const createdForm = createForm<AuthForm>({
  phone: { value: '', validators: [required()] },
  password: { value: '', validators: [required()] }
});
const { form, getValue, checkValidation } = createdForm;

const step = ref(1);

const goToPhoneConfirmationStep = () => {
  const formHasError = checkValidation();
  if (!formHasError) {
    step.value = 2;
  }
};

const handleFinal = async () => {
  useAuthStore().isAuthenticated = true;
  await router.push('/home');
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

    <div class="auth__title">
      {{ step === 1 ? 'Регистрация' : 'Подтвердить регистрацию по СМС' }}
    </div>

    <!-- ШАГ 1 -->
    <form
      v-if="step === 1"
      class="auth__form"
    >
      <Input
        v-model="form.phone.value"
        label="Телефон"
        type="tel"
        inputmode="tel"
        placeholder="+7"
      />
      <Input
        v-model="form.password.value"
        label="Пароль"
        type="password"
      />
    </form>

    <Button
      v-if="step === 1"
      class="submit"
      @click="goToPhoneConfirmationStep"
    >
      Продолжить
    </Button>

    <form
      v-if="step === 2"
      class="auth__form code-wrapper"
    >
      <CodeInput @success="handleFinal" />
    </form>
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

.submit {
  margin-bottom: 12px;
}

.logo {
  display: flex;
  width: 100%;
  justify-content: center;
  align-items: center;
  gap: 10px;
  margin-bottom: 32px;

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
  display: block;
  justify-content: center;
  margin-bottom: 80px;

  &__title {
    font-size: 1.5rem;
    font-weight: 600;
    text-align: center;
    margin-bottom: 24px;
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
