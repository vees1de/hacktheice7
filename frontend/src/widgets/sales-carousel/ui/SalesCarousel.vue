<script setup lang="ts">
import type { Offer } from '@entities/offer';
import { Card } from '@shared/types/card';
import { Carousel } from '@shared/ui';
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    offers?: Offer[];
    loading?: boolean;
  }>(),
  {
    offers: () => [],
    loading: false
  }
);

const cards = computed<Card[]>(() =>
  (props.offers ?? []).map(offer => ({
    id: offer.id,
    title: `${offer.partnerName} — ${offer.title}`,
    subtitle: offer.description ?? offer.terms ?? '',
    bannerName: '3',
    tags: [offer.discount, offer.offerRegions?.[0]?.region.name || '']
      .filter(Boolean)
      .slice(0, 3)
  }))
);
</script>
<template>
  <div>
    <p
      v-if="loading"
      class="placeholder"
    >
      Загружаем акции...
    </p>
    <p
      v-else-if="!cards.length"
      class="placeholder"
    >
      Акции отсутствуют
    </p>
    <Carousel
      v-else
      :cards="cards"
    />
  </div>
</template>
<style lang="scss" scoped>
.placeholder {
  padding: 12px 0;
  color: #98a2b3;
  font-size: 0.9rem;
}
</style>
