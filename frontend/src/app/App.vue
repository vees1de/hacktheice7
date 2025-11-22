<script setup lang="ts">
import { useViewStore } from '@shared/stores/view.store';
import { Header, Loader } from '@shared/ui';
import { Menu } from '@widgets/menu';
import { ProfileHeader } from '@widgets/profile-header';
import { storeToRefs } from 'pinia';
import { onMounted, ref } from 'vue';

const appIsMounted = ref(false);

const { isLoading, showMenu, showHeader, showProfile } =
  storeToRefs(useViewStore());

onMounted(() => (appIsMounted.value = true));
</script>

<template>
  <div
    v-if="appIsMounted"
    class="wrapper"
  >
    <Header v-if="showHeader" />
    <ProfileHeader v-if="showProfile" />
    <main>
      <RouterView />
    </main>
    <Menu v-if="showMenu" />
  </div>
  <Loader v-if="isLoading" />
</template>

<style scoped lang="scss">
main {
  padding: 0 16px var(--menu-height);
}
</style>
