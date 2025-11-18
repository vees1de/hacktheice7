<script setup lang="ts">
import { effect, ref } from 'vue';
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

const onMenuItem = async (index: number) => {
  activeMenuItem.value = index;
  await router.push(items[index].link);
};

effect(() => {
  const path = router.currentRoute.value.path;

  if (path) {
    items.forEach(({ link }, index) => {
      if (path === link) {
        activeMenuItem.value = index;
      }
    });
  }
});
</script>
<template>
  <div class="menu">
    <template
      v-for="(item, index) in items"
      :key="index"
    >
      <div
        class="item"
        :class="{ chat_item: !item.title }"
        @click="onMenuItem(index)"
      >
        <template v-if="item.title">
          <img
            class="item__icon"
            :class="{ item__icon_active: index === activeMenuItem }"
            :src="`/src/shared/assets/icons/${item.icon}-icon.svg`"
          />
          <div
            v-if="item.title"
            class="item__title"
          >
            {{ item.title }}
          </div>
        </template>
        <template v-else>
          <img
            class="item__icon"
            :class="{ item__icon_active: index === activeMenuItem }"
            :src="`/src/shared/assets/icons/${item.icon}-icon.svg`"
          />
        </template>
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
  font-size: 0.625rem;

  &__icon_active {
    filter: brightness(0) saturate(100%) invert(37%) sepia(60%) saturate(3622%)
      hue-rotate(202deg) brightness(93%) contrast(95%);
  }
}
.chat_item {
  display: grid;
  place-items: center;
  transform: translateY(-20px);
  border-radius: 100%;
  background-color: #1a73e8;
  width: 58px;
  height: 58px;

  img {
    width: 28px;
    height: 28px;
    filter: brightness(0) saturate(100%) invert(100%) sepia(0%) saturate(700%)
      hue-rotate(188deg) brightness(108%) contrast(101%);
  }
}
</style>
