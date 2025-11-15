<script setup lang="ts">
import { Header } from '@shared/ui';
import { Menu } from '@widgets/menu';
</script>

<template>
  <div class="wrapper">
    <Header />
    <main>
      <RouterView />
    </main>
    <Menu />
  </div>
</template>

<style scoped lang="scss">
.wrapper {
  // height: 1000px;
}
</style>
