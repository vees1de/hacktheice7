<script setup lang="ts">
import { Card } from '@shared/types/card';

import CardComponent from '../card/CardComponent.vue';

defineProps<{ cards: Card[] }>();
const emit = defineEmits<{
  (e: 'select', card: Card): void;
}>();
</script>
<template>
  <div class="carousel">
    <div class="carousel__line">
      <button
        v-for="(card, index) in cards"
        :key="index"
        class="carousel__card"
        type="button"
        @click="emit('select', card)"
      >
        <CardComponent
          :banner-name="card.bannerName"
          :subtitle="card.subtitle"
          :tags="card.tags"
          :title="card.title"
        />
      </button>
    </div>
  </div>
</template>
<style lang="scss" scoped>
.carousel {
  overflow-y: hidden;
  overflow-x: auto;
  height: fit-content;
  width: calc(100dvw - 32px);
  padding-bottom: 8px;

  &__line {
    display: flex;
    gap: 17px;
    width: fit-content;
  }

  &__card {
    background: transparent;
    border: none;
    padding: 0;
    cursor: pointer;
  }
}
</style>
