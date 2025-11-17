<script setup lang="ts">
import { useAuthStore } from '@entities/auth';
import { useViewStore } from '@shared/stores/view.store';
import { Loader } from '@shared/ui';
import { Menu } from '@widgets/menu';
import { storeToRefs } from 'pinia';
import { onMounted, ref } from 'vue';

const { isAuthenticated } = storeToRefs(useAuthStore());
const appIsMounted = ref(false);

const { isLoading } = storeToRefs(useViewStore());

onMounted(() => (appIsMounted.value = true));
</script>

<template>
  <div
    v-if="appIsMounted"
    class="wrapper"
  >
    <main>
      <RouterView />
    </main>
    <Menu v-if="isAuthenticated" />
  </div>
  <Loader v-if="isLoading" />
</template>

<style scoped lang="scss">
main {
  padding: 16px 16px var(--menu-height);
}
</style>
