<script setup lang="ts">
import { useAuthStore } from '@entities/auth';
import { Menu } from '@widgets/menu';
import { storeToRefs } from 'pinia';

const { isAuthenticated } = storeToRefs(useAuthStore());
</script>

<template>
  <div class="wrapper">
    <main>
      <RouterView />
    </main>
    <Menu v-if="isAuthenticated" />
  </div>
</template>

<style scoped lang="scss">
main {
  padding: 16px 16px var(--menu-height);
}
</style>
