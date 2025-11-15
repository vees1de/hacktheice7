<script setup lang="ts">
import { useAuthStore } from '@entities/auth';
import { type AuthRegisterRequest, authApi } from '@shared/api';
import { createForm } from '@shared/lib/createForm';
import { FieldMetaData } from '@shared/types/formFieldMetaData';
import { Input } from '@shared/ui';
import { useRouter } from 'vue-router';

import { useLangStore } from '../shared/stores/language.store';

export interface AccountForm {
  email: FieldMetaData<string>;
  firstName: FieldMetaData<string>;
  lastName: FieldMetaData<string>;
  patronymic: FieldMetaData<string>;
  phone: FieldMetaData<string>;
  snils: FieldMetaData<string>;
  regionId: FieldMetaData<string>;
  dateOfBirth: FieldMetaData<string>;
  password: FieldMetaData<string>;
  [key: string]: FieldMetaData<string>;
}

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

const { authorize } = useAuthStore();
const router = useRouter();

const langStore = useLangStore();

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
  if (userId) {
    console.log('shop otp input');
  }
  console.log('Registered', res);
};
</script>

<template>
  <div class="auth">
    <Form class="auth__form">
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
    </Form>
    <button @click="handleRegistration()">Зарегистрироваться</button>
  </div>
</template>

<style scoped lang="scss">
.auth {
  display: block;
  justify-content: center;

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
