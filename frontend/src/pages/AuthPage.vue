<script setup lang="ts">
import { useAuthStore } from '@entities/auth';
import { createForm } from '@shared/lib/createForm';
import { FieldMetaData } from '@shared/types/formFieldMetaData';
import { Button, Dropdown, Input } from '@shared/ui';
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';

export type AccountForm = {
  [K in keyof Account]: FieldMetaData<string>;
};

export type Account = {
  email: string;
  firstName: string;
  lastName: string;
  patronymic: string;
  phone: string;
  snils: string;
  regionId: string;
  dateOfBirth: string;
  password: string;
};

const router = useRouter();
const step = ref(1);

const { form, watchForm, getValue } = createForm<AccountForm>({
  firstName: { value: '', validators: [] },
  lastName: { value: '', validators: [] },
  phone: { value: '+', validators: [] },
  patronymic: { value: '', validators: [] },
  dateOfBirth: { value: '', validators: [] },
  email: { value: '', validators: [] },
  password: { value: '', validators: [] },
  regionId: { value: '', validators: [] },
  snils: { value: '', validators: [] }
});

// код подтверждения
const code = ref('');

const goToStep2 = () => {
  step.value = 2;
};

const handleFinal = async () => {
  useAuthStore().isAuthenticated = true;
  await router.push('/home');
};

const codeDigits = ref(['', '', '', '']);
const canSubmit = computed(() => codeDigits.value.every(d => d.length === 1));

const handleDigitInput = (index: number, e: Event) => {
  const target = e.target as HTMLInputElement;
  let value = target.value.replace(/\D/g, ''); // только цифры

  if (value.length > 1) value = value[0];
  codeDigits.value[index] = value;

  // переход вперёд
  if (value && index < 3) {
    const next = document.getElementById(`digit-${index + 1}`);
    next?.focus();
  }
};

const con = () => console.log(getValue());

const handleBackspace = (index: number, e: KeyboardEvent) => {
  if (e.key === 'Backspace' && !codeDigits.value[index] && index > 0) {
    const prev = document.getElementById(`digit-${index - 1}`);
    codeDigits.value[index - 1] = '';
    prev?.focus();
  }
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
        v-model="form.firstName.value"
        label="Имя"
        type="text"
      />
      <Input
        v-model="form.lastName.value"
        label="Фамилия"
        type="text"
      />
      <Input
        v-model="form.patronymic.value"
        label="Отчество"
        type="text"
      />
      <Input
        v-model="form.snils.value"
        label="СНИЛС"
        type="text"
      />
      <Input
        v-model="form.phone.value"
        label="Телефон"
        inputmode="tel"
      />
      <Input
        v-model="form.email.value"
        label="Эл. почта"
        type="email"
      />
      <Input
        v-model="form.dateOfBirth.value"
        label="День рождения"
        type="date"
      />
      <Input
        v-model="form.password.value"
        label="Пароль"
        type="password"
      />
      <Dropdown
        label="Регион"
        v-model="form.regionId.value"
        :options="[
          { value: '1', text: '14' },
          { value: '2', text: '20' },
          { value: '3', text: '34' }
        ]"
      ></Dropdown>
    </form>

    <Button
      v-if="step === 1"
      class="submit"
      @click="con"
    >
      Продолжить
    </Button>

    <form
      v-if="step === 2"
      class="auth__form code-wrapper"
    >
      <div class="code-inputs">
        <input
          v-for="(digit, i) in codeDigits"
          :key="i"
          :id="`digit-${i}`"
          class="code-box"
          type="text"
          inputmode="numeric"
          maxlength="1"
          v-model="codeDigits[i]"
          @input="e => handleDigitInput(i, e)"
          @keydown="e => handleBackspace(i, e)"
        />
      </div>
    </form>

    <Button
      v-if="step === 2"
      class="submit button__step2"
      :disabled="!canSubmit"
      @click="handleFinal"
    >
      Подтвердить
    </Button>
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
