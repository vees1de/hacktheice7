<script setup lang="ts">
import type { Benefit } from '@entities/benefit';
import { ROUTE_NAMES } from '@shared/model/routes.constants';
import { Card } from '@shared/types/card';
import { Carousel } from '@shared/ui';
import { computed } from 'vue';
import { useRouter } from 'vue-router';

const props = withDefaults(
  defineProps<{
    benefits?: Benefit[];
    loading?: boolean;
  }>(),
  {
    benefits: () => [],
    loading: false
  }
);

const router = useRouter();

const cards = computed<Card[]>(() =>
  (props.benefits ?? []).map(benefit => ({
    id: benefit.id,
    title: benefit.title,
    subtitle: benefit.description ?? 'Без описания',
    bannerName: '1',
    tags:
      benefit.benefitCategories?.map(cat => cat.beneficiaryCategory.title).slice(0, 3) ??
      []
  }))
);

const openDetail = (card: Card) => {
  const slug = card.id ?? 'benefit';
  const path = ROUTE_NAMES.BENEFIT_DETAIL.replace(':benefitId', slug);
  router.push(path);
};
</script>
<template>
  <div>
    <p
      v-if="loading"
      class="placeholder"
    >
      Загружаем льготы...
    </p>
    <p
      v-else-if="!cards.length"
      class="placeholder"
    >
      Льготы отсутствуют
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
