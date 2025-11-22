<script setup lang="ts">
import type { Offer } from '@entities/offer';
import { ROUTE_NAMES } from '@shared/model/routes.constants';
import { Card } from '@shared/types/card';
import { Carousel } from '@shared/ui';
import { computed } from 'vue';
import { useRouter } from 'vue-router';

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

const router = useRouter();

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

const openDetail = (card: Card) => {
  if (!card.id) return;
  const path = ROUTE_NAMES.BENEFIT_DETAIL.replace(':benefitId', card.id);
  router.push({ path, query: { type: 'offer' } });
};
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
      @select="openDetail"
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
