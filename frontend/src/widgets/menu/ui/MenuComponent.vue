<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const activeMenuItem = ref(0);

const items = [
  { title: 'главная', icon: 'home', link: '/home' },
  { title: 'льготы', icon: 'shield', link: '/benefits' },
  { icon: 'lasso', link: '/chat' },
  { title: 'акции', icon: 'sale', link: '/sales' },
  { title: 'профиль', icon: 'user', link: '/user' }
];

const onMenuItem = (index: number) => {
  activeMenuItem.value = index;
  router.push(items[index].link);
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
          v-if="item.title"
          class="item__icon"
          :src="`/src/shared/assets/icons/${index === activeMenuItem ? 'bold-' : ''}${item.icon}-icon.svg`"
        />
        <img
          v-else
          class="item__icon"
          :src="`/src/shared/assets/icons/${item.icon}-icon.svg`"
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
  height: var(--menu-height);
  display: flex;
  justify-content: space-between;
  background-color: #fff;
  width: 100%;
  position: fixed;
  border-top: 1px #c8cdd0 solid;
  bottom: 0;
  left: 0;
  padding: 6px 25px;
}

.item {
  text-align: center;
  line-height: 17px;
  font-size: 10px;
}
</style>
