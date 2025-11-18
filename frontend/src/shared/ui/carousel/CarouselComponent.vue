<script setup lang="ts">
import { Card } from '@shared/types/card';

import CardComponent from '../card/CardComponent.vue';

defineProps<{ cards: Card[] }>();
</script>
<template>
  <div class="carousel">
    <div class="carousel__line">
      <CardComponent
        v-for="(card, index) in cards"
        :banner-name="card.bannerName"
        :subtitle="card.subtitle"
        :tags="card.tags"
        :title="card.title"
        :key="index"
      />
    </div>
  </div>
</template>
<style lang="scss" scoped>
.carousel {
  overflow-y: hidden;
  overflow-x: scroll;
  height: fit-content;

  &__line {
    display: flex;
    gap: 17px;
    width: fit-content;
  }
}
</style>
