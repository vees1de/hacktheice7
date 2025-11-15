<script setup lang="ts">
import { ref } from 'vue';

const activeMenuItem = ref(0);

const items = [
  { title: 'главная', icon: 'home' },
  { title: 'льготы', icon: 'shield' },
  { icon: 'lasso' },
  { title: 'акции', icon: 'sale' },
  { title: 'профиль', icon: 'user' }
];

const onMenuItem = (index: number) => {
  activeMenuItem.value = index;
};
</script>
<template>
  <div class="menu">
    <template
      v-for="(item, index) in items"
      :key="index"
    >
      <div
        class="item"
        @click="onMenuItem(index)"
      >
        <img
          class="item__icon"
          :src="`/src/shared/assets/icons/${index === activeMenuItem ? 'bold-' : ''}${item.icon}-icon.svg`"
        />
        <div
          v-if="item.title"
          class="item__title"
        >
          {{ item.title }}
        </div>
      </div>
    </template>
  </div>
</template>
<style lang="scss" scoped>
.menu {
  display: flex;
  justify-content: space-between;
  background-color: #fff;
  width: 100%;
  position: fixed;
  border-top: 1px #c8cdd0 solid;
  bottom: 0;
  padding: 6px 25px;
}

.item {
  text-align: center;
  line-height: 17px;
  font-size: 10px;
}
</style>
