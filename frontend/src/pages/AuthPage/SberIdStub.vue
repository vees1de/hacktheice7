<script setup lang="ts">
import { Button } from '@shared/ui';

const emit = defineEmits<{
  (e: 'back'): void;
}>();
</script>

<template>
  <div class="sber">
    <h2>Вход через Сбер ID</h2>
    <p>Мы перенаправим вас на страницу Сбер ID для подтверждения личности.</p>
    <div class="auth__buttons">
      <Button class="submit" kind="secondary" @click="emit('back')">
        Назад
      </Button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.sber {
  text-align: center;
  width: 100%;

  h2 {
    font-size: 1.5rem;
    margin-bottom: 12px;
  }

  p {
    color: #6b7280;
    margin-bottom: 24px;
  }
}

.auth__buttons {
  display: flex;
  justify-content: center;
}

.submit[disabled] {
  opacity: 0.5;
  pointer-events: none;
}
</style>
