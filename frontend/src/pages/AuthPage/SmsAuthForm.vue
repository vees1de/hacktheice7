<script setup lang="ts">
import { Button, Input } from '@shared/ui';

import type { AuthForm } from './types';

defineProps<{
  form: AuthForm;
  step: number;
}>();

const emit = defineEmits<{
  (e: 'submit'): void;
  (e: 'register'): void;
  (e: 'back'): void;
}>();
</script>

<template>
  <div class="sms-wrapper">
    <form class="auth__form">
      <Input
        v-model="form.phone.value"
        label="Телефон"
        type="tel"
        inputmode="tel"
        placeholder="79XXXXXXXXX"
        :error="form.phone.error"
      >
        <template #error>Заполните телефон верно</template>
      </Input>
      <Input
        v-model="form.password.value"
        label="Пароль"
        type="password"
        :error="form.password.error"
      >
        <template #error>Обязательное поле</template>
      </Input>
    </form>

    <div class="auth__buttons">
      <Button
        v-if="step === 1"
        class="submit"
        @click="emit('submit')"
      >
        Вход
      </Button>
      <Button
        v-if="step === 1"
        class="submit"
        kind="secondary"
        @click="emit('register')"
      >
        Нет аккаунта
      </Button>
      <Button
        class="submit link"
        kind="secondary"
        @click="emit('back')"
      >
        Выбрать другой способ
      </Button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.sms-wrapper {
  display: flex;
  flex-direction: column;
  height: calc(100dvh - 214px);
  justify-content: space-between;
  width: 100%;
}

.auth__form {
  width: 100%;
  max-width: 420px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.auth__buttons {
  width: 100%;
  max-width: 420px;
  display: grid;
  gap: 12px;
}

.submit[disabled] {
  opacity: 0.5;
  pointer-events: none;
}

.link {
  background: transparent;
  color: #1a73e8;
  border: none;
}
</style>
