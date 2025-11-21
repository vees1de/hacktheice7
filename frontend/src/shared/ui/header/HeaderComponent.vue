<script setup lang="ts">
import { ROUTE_NAMES } from '@shared/model/routes.constants';
import { computed } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const path = computed(() => {
  console.log(router.currentRoute.value.path);
  console.log(headers[router.currentRoute.value.path]);
  return router.currentRoute.value.path;
});

const headers: Record<string, string> = {
  [ROUTE_NAMES.AUTH]: 'Вход',
  [ROUTE_NAMES.REGISTRATION]: 'Регистрация',
  [ROUTE_NAMES.HOME]: 'Главная',
  [ROUTE_NAMES.USER]: 'Профиль',
  [ROUTE_NAMES.CHAT]: 'Чат',
  [ROUTE_NAMES.SALES]: 'Продажи',
  [ROUTE_NAMES.BENEFITS]: 'Преимущества',
  [ROUTE_NAMES.ADMIN]: 'Админка',
  [ROUTE_NAMES.ROOT]: 'Главная',
  [ROUTE_NAMES.EDIT_BENEFITS]: 'Выбрать льготы'
};
</script>

<template>
  <header>
    <div
      class="back-button"
      @click="router.back()"
    >
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
