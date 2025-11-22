<script setup lang="ts">
const items: { icon: string; name: string }[] = [
  { icon: 'bus', name: 'Транспорт' },
  { icon: 'heart', name: 'Медицина' },
  { icon: 'house', name: 'ЖКУ' },
  { icon: 'ruble', name: 'Выплаты' },
  { icon: 'bills', name: 'Налоги' },
  { icon: 'users', name: 'Социальные услуги' },
  { icon: 'notebook', name: 'Труд и обучение' },
  { icon: 'cloud', name: 'Региональные льготы' }
];
</script>
<template>
  <div class="categories">
    <div class="categories__line">
      <div
        v-for="item in items"
        class="category"
      >
        <div class="category__image">
          <img :src="`/assets/icons/${item.icon}-icon.svg`" />
        </div>
        <div class="category__name">{{ item.name }}</div>
      </div>
    </div>
  </div>
</template>
<style lang="scss" scoped>
.categories {
  width: 100%;
  overflow-y: hidden;
  overflow-x: scroll;

  &__line {
    width: fit-content;
    display: flex;
    gap: 14px;
  }
}

.category {
  &__image {
    width: 58px;
    height: 58px;
    border-radius: 16px;
    background-color: #1a73e8;
    margin-bottom: 6px;
    display: grid;
    place-items: center;

    img {
      width: 25px;
      height: 25px;
      filter: brightness(0) saturate(100%) invert(99%) sepia(15%) saturate(666%)
        hue-rotate(283deg) brightness(110%) contrast(101%);
    }
  }

  &__name {
    width: 60px;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    font-size: 0.75rem;
    font-weight: 500;
    text-align: center;
  }
}
</style>
