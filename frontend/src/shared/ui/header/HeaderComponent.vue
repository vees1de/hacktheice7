<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const path = computed(() => router.currentRoute.value.path);

const headers: Record<string, string> = {
  '/auth': 'Вход',
  '/registration': 'Регистрация',
  '/confirm-phone': 'Введите код'
};
</script>

<template>
  <header>
    <div class="back-button">
      <img
        src="@shared/assets/icons/arrow.svg"
        alt="Назад"
      />
    </div>

    <h1>{{ headers[path] }}</h1>
  </header>
</template>

<style lang="scss" scoped>
header {
  display: grid;
  padding-block: 18px;
  place-items: center;
  font-weight: 700;
  width: 100%;
  height: 48px;
  margin-bottom: 24px;
  text-align: center;
  position: relative;

  .back-button {
    position: absolute;
    left: 24px;
    height: 100%;
    display: grid;
    place-items: center;
  }
}
</style>
