<script setup lang="ts">
import { useAuthStore } from '@entities/auth';
import { createForm } from '@shared/lib/createForm';
import { FieldMetaData } from '@shared/types/formFieldMetaData';
import { Input } from '@shared/ui';
import { storeToRefs } from 'pinia';
import { useRouter } from 'vue-router';

import { useLangStore } from '../shared/stores/language.store';

export interface AccountForm {
  [key: string]: FieldMetaData<any>;
}

const { authorize } = useAuthStore();
const router = useRouter();

const langStore = useLangStore();
const { change } = langStore;
const { t } = storeToRefs(langStore);

const { form, watchForm } = createForm<AccountForm>({
  name: { value: '', validators: [] },
  surname: { value: '', validators: [] },
  phone: { value: '', validators: [] },
  snils: { value: '', validators: [] },
  password: { value: '', validators: [] },
  region: { value: '', validators: [] }
});

const login = () => {
  authorize();
  router.push('/account');
};

watchForm(v => console.log(v.name));
</script>

<template>
  <div class="container auth">
    <Form class="auth__form">
      <Input
        v-model="form.name.value"
        label="Имя"
        type="text"
        placeholder="Имя"
      />
      <Input
        v-model="form.surname.value"
        label="Фамилия"
        type="text"
        placeholder="Фамилия"
      />
      <Input
        v-model="form.phone.value"
        label="Номер телефона"
        type="tel"
        inputmode="tel"
        placeholder="Номер телефона"
      />
      <Input
        v-model="form.snils.value"
        label="СНИЛС"
        inputmode="numeric"
        placeholder="СНИЛС"
      />
      <Input
        v-model="form.password.value"
        label="Пароль"
        type="password"
        placeholder="Пароль"
      />
    </Form>
    <button @click="login()">Войти</button>
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
