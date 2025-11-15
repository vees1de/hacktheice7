<script setup lang="ts">
import { AuthRegisterRequest, authApi } from '@entities/auth';
import { createForm } from '@shared/lib/createForm';
import { FieldMetaData } from '@shared/types/formFieldMetaData';
import { Input } from '@shared/ui';

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

const { form, watchForm, getValue } = createForm<AccountForm>({
  firstName: { value: 'фыв', validators: [] },
  lastName: { value: 'фыв', validators: [] },
  phone: { value: '+79248617535', validators: [] },
  patronymic: { value: 'фыв', validators: [] },
  dateOfBirth: { value: '', validators: [] },
  email: { value: 'ASD@MA.teST', validators: [] },
  password: { value: '123123', validators: [] },
  regionId: { value: '12323', validators: [] },
  snils: { value: '08336732477', validators: [] }
});

const handleRegistration = async () => {
  const body = getValue() as AuthRegisterRequest;
  body.dateOfBirth = new Date(body.dateOfBirth).toISOString();
  const res = await authApi.register(body);
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

    <div class="auth__title">Регистрация</div>
    <form class="auth__form">
      <Input
        v-model="form.firstName.value"
        label="Имя"
        type="text"
        placeholder="Имя"
      />
      <Input
        v-model="form.lastName.value"
        label="Фамилия"
        type="text"
        placeholder="Фамилия"
      />
      <Input
        v-model="form.patronymic.value"
        label="Отчество"
        type="text"
        placeholder="Отчество"
      />
      <Input
        v-model="form.snils.value"
        label="СНИЛС"
        type="text"
        placeholder="снилс"
      />
      <Input
        v-model="form.phone.value"
        label="Телефон"
        inputmode="tel"
        type="text"
        placeholder="Телефон"
      />
      <Input
        v-model="form.email.value"
        label="Эл. почта"
        type="email"
        placeholder="Эл. почта"
      />
      <Input
        v-model="form.dateOfBirth.value"
        label="День рождения"
        type="date"
        placeholder="День рождения"
      />
      <Input
        v-model="form.password.value"
        label="Пароль"
        type="password"
        placeholder="Пароль"
      />
      <Input
        v-model="form.regionId.value"
        label="Регион"
        type="text"
        placeholder="Регион"
      />
    </form>
    <button @click="handleRegistration()">Зарегистрироваться</button>
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
