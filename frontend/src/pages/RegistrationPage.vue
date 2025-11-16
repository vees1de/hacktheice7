<script setup lang="ts">
import { useAuthStore } from '@entities/auth';
import { regionApi } from '@entities/region';
import { createForm } from '@shared/lib/createForm';
import { onlyString, required } from '@shared/lib/validators';
import { Option } from '@shared/types/dropdownOption';
import { FieldMetaData } from '@shared/types/formFieldMetaData';
import { Button, Dropdown, Input } from '@shared/ui';
import { CodeInput } from '@widgets/code-input';
import { onMounted, ref } from 'vue';
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
const regionOptions = ref<Option[]>([]);
const canSubmit = ref(false);

onMounted(async () => {
  const response = await regionApi.getAll();
  const regions: Option[] = response.map(region => ({
    value: region.id,
    text: region.name
  }));

  regionOptions.value = regions;
});

const createdForm = createForm<AccountForm>({
  firstName: { value: '', validators: [required(), onlyString()] },
  lastName: { value: '', validators: [required(), onlyString()] },
  phone: { value: '+', validators: [required()] },
  patronymic: { value: '', validators: [required(), onlyString()] },
  dateOfBirth: { value: '', validators: [required()] },
  email: { value: '', validators: [required()] },
  password: { value: '', validators: [required()] },
  regionId: { value: '', validators: [required()] },
  snils: { value: '', validators: [required()] }
});

const { form, getValue, checkValidation } = createdForm;

const goToStep2 = () => {
  console.log(form, checkValidation());
  const formHasError = checkValidation();
  if (!formHasError) {
    step.value = 2;
  }
};

const handleFinal = async () => {
  useAuthStore().isAuthenticated = true;
  await router.push('/home');
};

const handleCodeInput = () => {
  canSubmit.value = true;
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
        :options="regionOptions"
      ></Dropdown>
    </form>

    <Button
      v-if="step === 1"
      class="submit"
      @click="goToStep2"
    >
      Продолжить
    </Button>

    <form
      v-if="step === 2"
      class="auth__form code-wrapper"
    >
      <CodeInput @success="handleFinal()" />
    </form>

    <!-- <Button
      v-if="step === 2"
      class="submit button__step2"
      :disabled="!canSubmit"
      @click="handleFinal"
    >
      Подтвердить
    </Button> -->
  </div>
</template>

<style scoped lang="scss">
.button__step2 {
  margin-top: 32px;
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
