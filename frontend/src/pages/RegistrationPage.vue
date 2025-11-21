<script setup lang="ts">
import {
  AuthRegisterRequest,
  VerifyPhoneRequest,
  authApi,
  toAuthRegisterDto
} from '@entities/auth';
import { regionApi } from '@entities/region';
import { createForm } from '@shared/lib/createForm';
import { date, minSymbols, onlyString, required } from '@shared/lib/validators';
import { ROUTE_NAMES } from '@shared/model/routes.constants';
import { useViewStore } from '@shared/stores/view.store';
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
  firstName: string;
  lastName: string;
  patronymic: string;
  phone: string;
  regionId: string;
  dateOfBirth: string;
  password: string;
  passwordSecond: string;
};

const router = useRouter();
const { toggleLoader } = useViewStore();
const step = ref(1);
const regionOptions = ref<Option[]>([]);

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
  phone: { value: '', validators: [required()] },
  patronymic: { value: '', validators: [required(), onlyString()] },
  dateOfBirth: { value: '', validators: [required(), date()] },
  password: { value: '', validators: [required(), minSymbols(6)] },
  passwordSecond: { value: '', validators: [required(), minSymbols(6)] },
  regionId: { value: '', validators: [required()] }
});

const { form, getValue, checkValidation } = createdForm;

const goToStep2 = async () => {
  console.log(getValue());
  toggleLoader();
  const formHasError = checkValidation();
  if (form.password.value !== form.passwordSecond.value) {
    form.passwordSecond.error = true;
    toggleLoader();
    return;
  }

  if (!formHasError) {
    const formValue = getValue() as Account;
    let body: AuthRegisterRequest = {
      dateOfBirth: formValue.dateOfBirth,
      firstName: formValue.firstName,
      lastName: formValue.lastName,
      patronymic: formValue.patronymic,
      password: formValue.password,
      regionId: formValue.regionId,
      phone: formValue.phone
    };
    body = toAuthRegisterDto(body);
    try {
      await authApi.register(body);
      step.value = 2;
    } catch (error) {
      console.log(error);
    }
  }
  toggleLoader();
};

const handleFinal = async (code: string) => {
  toggleLoader();
  const phone = '79' + form.phone.value;
  const payload: VerifyPhoneRequest = { code, phone };
  try {
    await authApi.verifyPhone(payload);
    await router.push('/home');
  } catch (error) {
    console.log(error);
  } finally {
    toggleLoader();
  }
};

const redirectToAuthPage = async () => {
  await router.push(ROUTE_NAMES.WELCOME);
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
    <form
      v-if="step === 1"
      class="auth__form"
    >
      <Input
        v-model="form.lastName.value"
        label="Фамилия"
        type="text"
        :error="form.lastName.error"
        ><template v-slot:error>Неверно заполнено</template>
      </Input>
      <Input
        v-model="form.firstName.value"
        label="Имя"
        type="text"
        :error="form.firstName.error"
      >
        <template v-slot:error>Неверно заполнено</template>
      </Input>
      <Input
        v-model="form.patronymic.value"
        label="Отчество"
        type="text"
        :error="form.patronymic.error"
      >
        <template v-slot:error>Неверно заполнено</template>
      </Input>
      <Input
        v-model="form.phone.value"
        label="Телефон"
        inputmode="tel"
        type="tel"
        placeholder="79XXXXXXXXX"
        :error="form.phone.error"
        ><template v-slot:error>Неверно заполнено</template></Input
      >
      <Input
        v-model="form.dateOfBirth.value"
        label="День рождения"
        type="date"
        inputmode="tel"
        :error="form.dateOfBirth.error"
      >
        <template v-slot:error>Неверная дата</template>
      </Input>
      <Input
        v-model="form.password.value"
        label="Пароль"
        type="password"
        :error="form.password.error"
      >
        <template v-slot:error>Пароль не может быть меньше 6 символов</template>
      </Input>
      <Input
        v-model="form.passwordSecond.value"
        label="Подтверждение пароля"
        type="password"
        :error="form.passwordSecond.error"
      >
        <template v-slot:error>Пароли не совпадают</template>
      </Input>
      <Dropdown
        label="Регион"
        v-model="form.regionId.value"
        :options="regionOptions"
        :error="form.regionId.error"
      ></Dropdown>
    </form>

    <div class="auth__buttons">
      <Button
        v-if="step === 1"
        class="submit"
        @click="goToStep2"
      >
        Продолжить
      </Button>
      <Button
        v-if="step === 1"
        class="submit"
        kind="secondary"
        @click="redirectToAuthPage"
      >
        Уже есть аккаунт
      </Button>
    </div>

    <form
      v-if="step === 2"
      class="auth__form code-wrapper"
    >
      <CodeInput @success="handleFinal" />
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
  height: fit-content;

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
    margin-block: 36px 24px;
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
