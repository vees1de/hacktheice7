<script setup lang="ts">
import { BENEFIT_CATEGORY_LIST } from '@shared/constants/benefitCategories';
import { ROUTE_NAMES } from '@shared/model/routes.constants';
import { useRouter } from 'vue-router';

const router = useRouter();

const openCategory = (slug: string) => {
  const path = ROUTE_NAMES.BENEFITS_CATEGORY.replace(':categoryType', slug);
  router.push(path);
};
</script>
<template>
  <div class="categories">
    <div class="categories__line">
      <button
        v-for="item in BENEFIT_CATEGORY_LIST"
        :key="item.slug"
        class="category"
        type="button"
        @click="openCategory(item.slug)"
      >
        <div class="category__image">
          <img
            :src="`/assets/icons/${item.icon}-icon.svg`"
            alt="''"
          />
        </div>
        <div class="category__name">{{ item.name }}</div>
      </button>
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
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 0;

  &__image {
    width: 58px;
    height: 58px;
    border-radius: 16px;
    background-color: var(--category-bg);
    margin-bottom: 6px;
    display: grid;
    place-items: center;

    img {
      width: 25px;
      height: 25px;
      filter: var(--category-icon);
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
    color: var(--primary-text);
  }
}
</style>
