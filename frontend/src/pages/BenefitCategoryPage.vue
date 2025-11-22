<script setup lang="ts">
import type { Benefit } from '@entities/benefit';
import { BENEFIT_CATEGORY_LIST } from '@shared/constants/benefitCategories';
import { ROUTE_NAMES } from '@shared/model/routes.constants';
import { useCatalogStore } from '@shared/stores/catalog.store';
import { storeToRefs } from 'pinia';
import { computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const catalogStore = useCatalogStore();
const { benefits, benefitsLoading } = storeToRefs(catalogStore);

const mockedZhkuBenefits: Benefit[] = [
  {
    id: '54b08dd9-6b82-4bc3-a899-3ba7ed5a6d55',
    title: 'Компенсация взноса за капитальный ремонт для пенсионеров',
    description:
      'Частичная компенсация взноса за капитальный ремонт для неработающих пенсионеров.',
    type: 'ЖКХ',
    validFrom: '2025-11-22T02:20:38.254Z',
    validTo: '2027-11-22T02:20:38.254Z',
    requirements: 'Статус неработающего пенсионера, отсутствие долгов по ЖКХ.',
    howToGet: 'Заявление в МФЦ или фонд капитального ремонта.',
    sourceUrl: null,
    benefitRegions: [
      {
        region: {
          id: 'cmi4ju8s90004xke8vm0tx2vn',
          name: 'Республика Саха (Якутия)',
          code: '14',
          type: 'республика'
        }
      }
    ],
    benefitCategories: [
      {
        beneficiaryCategory: {
          id: 'cmi4ju9go0005xke8cig2hiw8',
          name: 'PENSIONER',
          title: 'Пенсионер',
          icon: '/icons/pensioner.svg'
        }
      }
    ]
  },
  {
    id: '7ba0a242-ebcc-4bcc-8798-96fb051e3476',
    title: 'Бесплатный проезд в городском транспорте для пенсионеров',
    description:
      'Право бесплатного проезда в городском общественном транспорте (кроме такси).',
    type: 'Транспорт',
    validFrom: '2025-11-22T02:20:38.254Z',
    validTo: '2027-11-22T02:20:38.254Z',
    requirements: 'Пенсионное удостоверение.',
    howToGet: 'Оформить льготную транспортную карту через МФЦ.',
    sourceUrl: null,
    benefitRegions: [
      {
        region: {
          id: 'cmi4ju8s90004xke8vm0tx2vn',
          name: 'Республика Саха (Якутия)',
          code: '14',
          type: 'республика'
        }
      }
    ],
    benefitCategories: [
      {
        beneficiaryCategory: {
          id: 'cmi4ju9go0005xke8cig2hiw8',
          name: 'PENSIONER',
          title: 'Пенсионер',
          icon: '/icons/pensioner.svg'
        }
      }
    ]
  },
  {
    id: '5709d758-6c33-4503-b2a6-cdf99ab4f427',
    title: 'Скидка на лекарства для пенсионеров',
    description:
      'Скидка до 50% на жизненно важные лекарственные препараты для пенсионеров.',
    type: 'Медицина',
    validFrom: '2025-11-22T02:20:38.254Z',
    validTo: '2027-11-22T02:20:38.254Z',
    requirements: 'Пенсионное удостоверение, рецепт врача при необходимости.',
    howToGet: 'Предъявить удостоверение в аптеках-участниках программы.',
    sourceUrl: null,
    benefitRegions: [
      {
        region: {
          id: 'cmi4ju8s90004xke8vm0tx2vn',
          name: 'Республика Саха (Якутия)',
          code: '14',
          type: 'республика'
        }
      }
    ],
    benefitCategories: [
      {
        beneficiaryCategory: {
          id: 'cmi4ju9go0005xke8cig2hiw8',
          name: 'PENSIONER',
          title: 'Пенсионер',
          icon: '/icons/pensioner.svg'
        }
      }
    ]
  },
  {
    id: 'cmi5ql24f0000xkrkp2c4fnr0',
    title: 'Скидка 50% на оплату ЖКХ для пенсионеров',
    description:
      'Снижение стоимости коммунальных услуг для граждан пенсионного возраста.',
    type: 'ЖКХ',
    validFrom: '2025-11-19T08:24:33.879Z',
    validTo: '2027-11-19T08:24:33.879Z',
    requirements: 'Пенсионное удостоверение',
    howToGet: 'Обратиться в МФЦ',
    sourceUrl: null,
    benefitRegions: [
      {
        region: {
          id: 'cmi4ju8s90004xke8vm0tx2vn',
          name: 'Республика Саха (Якутия)',
          code: '14',
          type: 'республика'
        }
      }
    ],
    benefitCategories: [
      {
        beneficiaryCategory: {
          id: 'cmi4ju9go0005xke8cig2hiw8',
          name: 'PENSIONER',
          title: 'Пенсионер',
          icon: '/icons/pensioner.svg'
        }
      }
    ]
  }
];

const slug = computed(() => route.params.categoryType as string);
const categoryInfo = computed(() =>
  BENEFIT_CATEGORY_LIST.find(category => category.slug === slug.value)
);

const zhkuSlug = 'zhku';
const isZhku = computed(() => slug.value === zhkuSlug);

const listTitle = computed(() =>
  categoryInfo.value
    ? `Льготы категории «${categoryInfo.value.name}»`
    : 'Льготы'
);

const categoryName = computed(() => categoryInfo.value?.name ?? 'Льготы');
const categoryDescription = computed(
  () =>
    categoryInfo.value?.description ?? 'Описание категории пока отсутствует.'
);

const loadBenefits = () => {
  if (!benefits.value.length) {
    catalogStore.fetchBenefits();
  }
};

onMounted(loadBenefits);
watch(slug, loadBenefits);

const normalizedBenefits = computed(() => {
  if (isZhku.value) {
    return mockedZhkuBenefits;
  }

  if (!categoryInfo.value) {
    return [];
  }

  const targetType = categoryInfo.value.type.toLowerCase();

  return benefits.value.filter(
    benefit => benefit.type?.toLowerCase() === targetType
  );
});

const isLoading = computed(() => benefitsLoading.value && !isZhku.value);

const openBenefit = (id: string) => {
  const path = ROUTE_NAMES.BENEFIT_DETAIL.replace(':benefitId', id);
  router.push(path);
};
</script>

<template>
  <div class="category-page">
    <header class="category-page__header">
      <div>
        <p class="category-page__eyebrow">Категория</p>
        <h1>{{ categoryName }}</h1>
        <p class="category-page__description">
          {{ categoryDescription }}
        </p>
      </div>
    </header>

    <div
      v-if="isLoading"
      class="category-page__state"
    >
      Загружаем льготы…
    </div>
    <div
      v-else-if="!categoryInfo"
      class="category-page__state"
    >
      Мы пока не знаем такой категории.
    </div>
    <div
      v-else-if="!normalizedBenefits.length"
      class="category-page__state"
    >
      В этой категории пока нет льгот. Загляните позже.
    </div>
    <div
      v-else
      class="category-page__content"
    >
      <h2>{{ listTitle }}</h2>
      <ul class="benefit-list">
        <li
          v-for="benefit in normalizedBenefits"
          :key="benefit.id"
          class="benefit-card"
        >
          <div class="benefit-card__body">
            <p class="benefit-card__type">{{ benefit.type }}</p>
            <h3 class="benefit-card__title">{{ benefit.title }}</h3>
            <p class="benefit-card__description">
              {{ benefit.description ?? 'Описание отсутствует' }}
            </p>
            <p class="benefit-card__hint">
              Действует до
              {{
                benefit.validTo
                  ? new Date(benefit.validTo).toLocaleDateString('ru-RU')
                  : '—'
              }}
            </p>
          </div>
          <button
            class="benefit-card__action"
            type="button"
            @click="openBenefit(benefit.id)"
          >
            Подробнее
          </button>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped lang="scss">
.category-page {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 24px;

  &__header {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  &__eyebrow {
    margin: 0;
    font-size: 0.85rem;
    color: #667085;
  }

  &__description {
    margin: 4px 0 0;
    color: #475467;
  }

  &__state {
    padding: 32px;
    text-align: center;
    color: #475467;
    border-radius: 16px;
    background: #f4f6fb;
  }

  &__content {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
}

.back-button {
  align-self: flex-start;
  border: none;
  background: #f2f7fe;
  padding: 8px 14px;
  border-radius: 999px;
  color: #1a73e8;
  font-weight: 600;
  cursor: pointer;
}

.benefit-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.benefit-card {
  border: 1px solid #e4e7ec;
  border-radius: 16px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: #fff;

  &__type {
    margin: 0;
    font-size: 0.85rem;
    text-transform: uppercase;
    color: #1d4ed8;
    letter-spacing: 0.08em;
  }

  &__title {
    margin: 4px 0;
    font-size: 1.1rem;
  }

  &__description {
    margin: 0;
    color: #475467;
  }

  &__hint {
    margin: 0;
    font-size: 0.85rem;
    color: #667085;
  }

  &__action {
    align-self: flex-start;
    padding: 8px 16px;
    border-radius: 12px;
    border: none;
    background: #1a73e8;
    color: #fff;
    font-weight: 600;
    cursor: pointer;
  }
}
</style>
