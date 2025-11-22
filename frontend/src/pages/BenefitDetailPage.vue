<script setup lang="ts">
import type { Benefit } from '@entities/benefit';
import type { Offer } from '@entities/offer';
import { ROUTE_NAMES } from '@shared/model/routes.constants';
import { useCatalogStore } from '@shared/stores/catalog.store';
import { storeToRefs } from 'pinia';
import { computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const catalogStore = useCatalogStore();
const { benefits, offers, benefitsLoading, offersLoading } =
  storeToRefs(catalogStore);

const detailType = computed<'benefit' | 'offer'>(() =>
  route.query.type === 'offer' ? 'offer' : 'benefit'
);
const isOffer = computed(() => detailType.value === 'offer');

watch(
  () => detailType.value,
  async value => {
    if (value === 'offer') {
      await catalogStore.fetchOffers();
    } else {
      await catalogStore.fetchBenefits();
    }
  },
  { immediate: true }
);

const currentId = computed(() => route.params.benefitId as string | undefined);

const currentBenefit = computed(() =>
  !isOffer.value
    ? benefits.value.find(benefit => benefit.id === currentId.value)
    : undefined
);
const currentOffer = computed(() =>
  isOffer.value
    ? offers.value.find(offer => offer.id === currentId.value)
    : undefined
);
type DetailItem = Benefit | Offer;
const currentItem = computed<DetailItem | undefined>(() =>
  isOffer.value ? currentOffer.value : currentBenefit.value
);

const isLoading = computed(() =>
  isOffer.value ? offersLoading.value : benefitsLoading.value
);

const formatDate = (value?: string | null) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  }).format(date);
};

const validityText = computed(() => {
  const item = currentItem.value;
  if (!item) return '';
  const from = formatDate(item.validFrom);
  const to = formatDate(item.validTo);
  if (from && to) return `${from} — ${to}`;
  return from || (to ? `до ${to}` : '');
});

const pageTitle = computed(() =>
  currentItem.value?.title || (isOffer.value ? 'Акция' : 'Льгота')
);

const heroTitle = computed(() => {
  if (!currentItem.value) return '';
  if (isOffer.value) {
    const offer = currentOffer.value!;
    if (offer.discount && offer.partnerName) {
      return `${offer.discount} — ${offer.partnerName}`;
    }
    return offer.discount || offer.partnerName || offer.title;
  }
  const benefit = currentBenefit.value!;
  return benefit.type || benefit.title;
});

const regionsList = computed(() => {
  const regions = isOffer.value
    ? currentOffer.value?.offerRegions?.map(
        region => region.region?.name || ''
      )
    : currentBenefit.value?.benefitRegions?.map(
        region => region.region?.name || ''
      );
  return (regions ?? []).filter(Boolean);
});

const audienceList = computed(() => {
  const categories = isOffer.value
    ? currentOffer.value?.offerCategories?.map(
        category => category.beneficiaryCategory?.title || ''
      )
    : currentBenefit.value?.benefitCategories?.map(
        category => category.beneficiaryCategory?.title || ''
      );
  return (categories ?? []).filter(Boolean);
});

const splitText = (text?: string | null) =>
  text
    ?.split(/[\n\r;,]+/)
    .map(item => item.trim())
    .filter(Boolean) ?? [];

const documentsTitle = computed(() =>
  isOffer.value ? 'Как воспользоваться' : 'Необходимые документы'
);
const documentsList = computed(() => {
  const text = isOffer.value
    ? currentOffer.value?.terms ?? currentOffer.value?.description
    : currentBenefit.value?.requirements;
  return splitText(text);
});

const howToTitle = computed(() =>
  isOffer.value ? 'Дополнительная информация' : 'Как получить льготу'
);
const howToText = computed(() => {
  if (isOffer.value) {
    if (currentOffer.value?.link) {
      return '';
    }
    return currentOffer.value?.description ?? '';
  }
  return currentBenefit.value?.howToGet ?? '';
});
const offerLink = computed(() =>
  isOffer.value ? currentOffer.value?.link : undefined
);

const heroBadges = computed(() => {
  const badges: string[] = [];
  if (isOffer.value) {
    const offer = currentOffer.value;
    if (offer?.discount) badges.push(offer.discount);
    if (offer?.partnerName) badges.push(offer.partnerName);
  } else {
    const benefit = currentBenefit.value;
    if (benefit?.type) badges.push(benefit.type);
  }
  if (audienceList.value[0]) badges.push(audienceList.value[0]);
  if (regionsList.value[0]) badges.push(regionsList.value[0]);
  if (validityText.value) badges.push(`Действует: ${validityText.value}`);
  return [...new Set(badges)].slice(0, 3);
});

const relatedTitle = computed(() =>
  isOffer.value ? 'Другие акции' : 'Другие льготы'
);
const relatedItems = computed<DetailItem[]>(() => {
  const items = (isOffer.value ? offers.value : benefits.value) as DetailItem[];
  return items.filter(item => item.id !== currentId.value).slice(0, 4);
});

const goBack = () => {
  router.back();
};

const openRelated = (id: string) => {
  const path = ROUTE_NAMES.BENEFIT_DETAIL.replace(':benefitId', id);
  if (detailType.value === 'offer') {
    router.push({ path, query: { type: 'offer' } });
  } else {
    router.push(path);
  }
};
</script>

<template>
  <div class="benefit-page">
    <header class="benefit-page__header">
      <button
        class="back-button"
        type="button"
        @click="goBack"
      >
        Назад
      </button>
      <h1>{{ pageTitle }}</h1>
    </header>

    <div
      v-if="isLoading"
      class="state"
    >
      Загружаем данные...
    </div>

    <div
      v-else-if="!currentItem"
      class="state"
    >
      <p>Не удалось найти подробности. Попробуйте выбрать другую запись.</p>
      <button
        class="back-button back-button--outline"
        type="button"
        @click="goBack"
      >
        Вернуться назад
      </button>
    </div>

    <template v-else>
      <section class="hero">
        <div class="hero__title">{{ heroTitle }}</div>
        <div
          v-if="validityText"
          class="hero__period"
        >
          {{ validityText }}
        </div>
        <div
          v-if="heroBadges.length"
          class="badges"
        >
          <span
            v-for="badge in heroBadges"
            :key="badge"
            class="badge"
          >
            {{ badge }}
          </span>
        </div>
      </section>

      <section
        v-if="currentItem.description"
        class="section"
      >
        <h2>Описание</h2>
        <p>{{ currentItem.description }}</p>
      </section>

      <section
        v-if="audienceList.length"
        class="section"
      >
        <h2>Кому доступно</h2>
        <div class="audience">
          <span
            v-for="audience in audienceList"
            :key="audience"
            class="audience__pill"
          >
            {{ audience }}
          </span>
        </div>
      </section>

      <section
        v-if="regionsList.length"
        class="section"
      >
        <h2>Где действует</h2>
        <div class="audience">
          <span
            v-for="region in regionsList"
            :key="region"
            class="audience__pill audience__pill--light"
          >
            {{ region }}
          </span>
        </div>
      </section>

      <section
        v-if="documentsList.length"
        class="section"
      >
        <h2>{{ documentsTitle }}</h2>
        <ul class="list">
          <li
            v-for="item in documentsList"
            :key="item"
          >
            {{ item }}
          </li>
        </ul>
      </section>

      <section
        v-if="howToText || offerLink"
        class="section"
      >
        <h2>{{ howToTitle }}</h2>
        <p v-if="howToText">{{ howToText }}</p>
        <a
          v-if="offerLink"
          :href="offerLink"
          class="link"
          target="_blank"
          rel="noopener noreferrer"
        >
          Перейти на сайт партнёра
        </a>
      </section>

      <section
        v-if="relatedItems.length"
        class="section"
      >
        <h2>{{ relatedTitle }}</h2>
        <div class="other-benefits">
          <button
            v-for="item in relatedItems"
            :key="item.id"
            class="other-benefits__item"
            type="button"
            @click="openRelated(item.id)"
          >
            {{ item.title }}
          </button>
        </div>
      </section>
    </template>
  </div>
</template>

<style scoped lang="scss">
.benefit-page {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.benefit-page__header {
  display: flex;
  align-items: center;
  gap: 16px;
  justify-content: space-between;

  h1 {
    font-size: 1.2rem;
    font-weight: 600;
  }
}

.back-button {
  border: none;
  background: #f2f7fe;
  padding: 8px 14px;
  border-radius: 999px;
  color: #1a73e8;
  font-weight: 600;
  cursor: pointer;

  &--outline {
    background: transparent;
    border: 1px solid #1a73e8;
  }
}

.hero {
  background-color: #e5f0ff;
  border-radius: 16px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;

  &__title {
    font-weight: 700;
    font-size: 1.2rem;
  }

  &__period {
    font-size: 0.9rem;
    color: #1a73e8;
    font-weight: 600;
  }
}

.badges {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.badge {
  background-color: #fff;
  border-radius: 999px;
  padding: 6px 12px;
  font-size: 0.8rem;
  font-weight: 600;
}

.section {
  display: flex;
  flex-direction: column;
  gap: 8px;

  h2 {
    font-size: 1rem;
    font-weight: 700;
  }

  p {
    line-height: 1.4;
  }
}

.audience {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;

  &__pill {
    background-color: #1a73e8;
    color: #fff;
    border-radius: 999px;
    padding: 6px 12px;
    font-weight: 600;
    font-size: 0.85rem;

    &--light {
      background-color: #e5f0ff;
      color: #1a73e8;
    }
  }
}

.list {
  padding-left: 18px;
  margin: 0;
  line-height: 1.4;
}

.other-benefits {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;

  &__item {
    flex: 1 1 calc(50% - 8px);
    background-color: #e5f0ff;
    border-radius: 16px;
    padding: 12px;
    text-align: center;
    font-weight: 600;
    color: #1a73e8;
    border: none;
    cursor: pointer;
  }
}

.state {
  padding: 32px 16px;
  text-align: center;
  color: #475467;
  background: #f8fafc;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.link {
  margin-top: 8px;
  display: inline-flex;
  color: #1a73e8;
  font-weight: 600;
  text-decoration: underline;
}
</style>
