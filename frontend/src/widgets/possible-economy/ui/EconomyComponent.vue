<script setup lang="ts">
import { type UserLossResult, lossApi } from '@entities/loss';
import { ROUTE_NAMES } from '@shared/model/routes.constants';
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';

const { type = 'both' } = defineProps<{
  type?: 'both' | 'sales' | 'benefits';
}>();

const router = useRouter();
const lossData = ref<UserLossResult | null>(null);
const isLossLoading = ref(false);
const selectedSection = ref<'sales' | 'benefits' | null>(null);

const currencyFormatter = new Intl.NumberFormat('ru-RU');
const formatCurrency = (value: number) =>
  `${currencyFormatter.format(Math.round(value))}₽`;

const monthlyLoss = computed(() => lossData.value?.totalLossMonthly ?? 0);
const yearlyLoss = computed(() => lossData.value?.totalLossYearly ?? 0);
const benefitsCount = computed(() => lossData.value?.lossItems.length ?? 0);
const lossPreview = computed(() => lossData.value?.lossItems.slice(0, 1) ?? []);

const benefitsCountText = computed(() => {
  const count = benefitsCount.value;
  if (count === 0) return 'Нет доступных льгот';
  if (count % 10 === 1 && count % 100 !== 11) return `В ${count} льготе`;
  if ([2, 3, 4].includes(count % 10) && ![12, 13, 14].includes(count % 100)) {
    return `В ${count} льготах`;
  }
  return `В ${count} льготах`;
});

const loadLoss = async () => {
  if (type === 'sales') return;
  try {
    isLossLoading.value = true;
    lossData.value = await lossApi.getUserLoss();
  } catch (error) {
    console.error('Failed to load user loss', error);
  } finally {
    isLossLoading.value = false;
  }
};

onMounted(() => {
  if (type === 'benefits' || type === 'both') {
    loadLoss();
  }
});

const modalLossItems = computed(() => lossData.value?.lossItems ?? []);
const isModalOpen = computed(() => selectedSection.value !== null);
const modalTitle = computed(() =>
  selectedSection.value === 'sales'
    ? 'Экономия в магазинах'
    : 'Потенциальная экономия по льготам'
);
const modalSubtitle = computed(() => {
  if (selectedSection.value === 'sales') {
    return 'Подборка магазинов и акций, в которых вы можете сэкономить.';
  }
  if (isLossLoading.value) return 'Считаем недополученные выплаты...';
  if (!modalLossItems.value.length)
    return 'Заполните профиль, чтобы мы могли подсказать подходящие льготы.';
  return `Мы нашли ${benefitsCountText.value.toLowerCase()}.`;
});

const openModal = (section: 'sales' | 'benefits') => {
  selectedSection.value = section;
};

const closeModal = () => {
  selectedSection.value = null;
};

const openBenefitDetail = async (benefitId: string) => {
  if (!benefitId) return;
  const path = ROUTE_NAMES.BENEFIT_DETAIL.replace(':benefitId', benefitId);
  closeModal();
  await router.push(path);
};

watch(isModalOpen, value => {
  const body = document.body;
  if (!body) return;
  if (value) {
    body.setAttribute('data-scroll-lock', 'true');
    body.style.overflow = 'hidden';
  } else if (body.dataset.scrollLock) {
    body.removeAttribute('data-scroll-lock');
    body.style.overflow = '';
  }
});

onBeforeUnmount(() => {
  const body = document.body;
  if (body?.dataset.scrollLock) {
    body.removeAttribute('data-scroll-lock');
    body.style.overflow = '';
  }
});

const handleWidgetKey = (
  event: KeyboardEvent,
  section: 'sales' | 'benefits'
) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    openModal(section);
  }
};

const handleBenefitKey = (event: KeyboardEvent, benefitId: string) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    openBenefitDetail(benefitId);
  }
};
</script>

<template>
  <div
    v-if="type === 'sales' || type === 'both'"
    class="economy sales"
    role="button"
    tabindex="0"
    @click="openModal('sales')"
    @keydown="handleWidgetKey($event, 'sales')"
  >
    <div class="money">
      <div class="money__sum">11.050₽</div>
      <div class="money__date">01.10.2025-01.11.2025</div>
    </div>
    <div class="shops">
      <div class="shops__count">В 24 магазинах</div>
      <div class="shops__images">
        <img
          src="/assets/images/shops.png"
          alt="''"
        />
        <div>...</div>
      </div>
    </div>
  </div>

  <div
    v-if="type === 'benefits' || type === 'both'"
    class="economy"
    role="button"
    tabindex="0"
    @click="openModal('benefits')"
    @keydown="handleWidgetKey($event, 'benefits')"
  >
    <div class="money">
      <div class="money__sum">
        {{ isLossLoading ? '...' : formatCurrency(monthlyLoss) }}
      </div>
      <div class="money__date">
        {{ isLossLoading ? 'Загрузка' : 'в месяц' }}
      </div>
      <div class="money__secondary">
        {{ isLossLoading ? '' : `≈ ${formatCurrency(yearlyLoss)} в год` }}
      </div>
    </div>
    <div class="shops">
      <div class="shops__count">
        {{ isLossLoading ? 'Считаем льготы...' : benefitsCountText }}
      </div>
      <ul
        v-if="!isLossLoading && lossPreview.length"
        class="loss-list"
      >
        <li
          v-for="item in lossPreview"
          :key="item.id"
        >
          {{ item.title }}
        </li>
        <li v-if="benefitsCount > lossPreview.length">
          + ещё {{ benefitsCount - lossPreview.length }}
        </li>
      </ul>
      <p
        v-else-if="!isLossLoading"
        class="loss-empty"
      >
        Заполните профиль, чтобы увидеть недополученные выплаты.
      </p>
    </div>
  </div>

  <teleport to="body">
    <transition name="fade">
      <div
        v-if="isModalOpen"
        class="economy-modal"
        role="dialog"
        aria-modal="true"
      >
        <div
          class="economy-modal__backdrop"
          @click="closeModal"
        />
        <div class="economy-modal__content">
          <button
            class="economy-modal__close"
            type="button"
            @click="closeModal"
          >
            ✕
          </button>
          <h3>{{ modalTitle }}</h3>
          <p class="economy-modal__subtitle">
            {{ modalSubtitle }}
          </p>

          <template v-if="selectedSection === 'benefits'">
            <div class="economy-modal__summary">
              <div>
                <span>В месяц</span>
                <strong>{{ formatCurrency(monthlyLoss) }}</strong>
              </div>
              <div>
                <span>В год</span>
                <strong>{{ formatCurrency(yearlyLoss) }}</strong>
              </div>
            </div>
            <ul
              v-if="modalLossItems.length"
              class="economy-modal__list"
            >
              <li
                v-for="item in modalLossItems"
                :key="item.id"
                role="button"
                tabindex="0"
                @click="openBenefitDetail(item.id)"
                @keydown="handleBenefitKey($event, item.id)"
              >
                <div>
                  <p class="economy-modal__list-title">{{ item.title }}</p>
                  <p class="economy-modal__list-type">{{ item.type }}</p>
                </div>
                <div class="economy-modal__list-sum">
                  <span>{{ formatCurrency(item.monthlyLoss) }}/мес</span>
                  <small>≈ {{ formatCurrency(item.yearlyLoss) }}/год</small>
                </div>
              </li>
            </ul>
          </template>

          <template v-else-if="selectedSection === 'sales'">
            <div class="economy-modal__sales">
              <p>Вы можете сэкономить до <strong>13 000₽</strong> на акциях.</p>
              <p>Сейчас доступно 24 магазина с персональными скидками.</p>
              <p class="economy-modal__hint">
                Откройте раздел «Акции» и используйте цифровое удостоверение,
                чтобы подтвердить льготы при покупке.
              </p>
            </div>
          </template>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<style lang="scss" scoped>
.economy {
  display: flex;
  flex-wrap: wrap; // ← позволяет переноситься на малых экранах
  justify-content: space-around;
  gap: 16px; // ← уменьшено для компактности
  padding-inline: 14px;
  margin-bottom: 24px;
  box-sizing: border-box;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;

  &:hover,
  &:focus-visible {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(15, 23, 42, 0.08);
    outline: none;
  }
}

.sales {
  margin-bottom: 0;
}

.money {
  min-width: 0;
  flex: 1 1 140px; // ← гибкая ширина, но не сжимается слишком сильно
  min-height: 100px;
  background-color: var(--money-bg);
  color: var(--money-text);
  border: 2px solid #c6ddfd;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 8px;

  &__sum {
    font-weight: 600;
    font-size: 1.5rem;
    line-height: 1.2; // ← исправлено: было 17px, что слишком мало
    margin-bottom: 6px;
    word-break: break-word;
  }

  &__date {
    text-decoration: underline;
    color: #000;
    font-size: 0.75rem;
    white-space: nowrap;
  }

  &__secondary {
    font-size: 0.75rem;
    color: #475467;
    margin-top: 4px;
  }
}

.shops {
  min-width: 0;
  flex: 1 1 160px; // ← гибкая ширина
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  &__count {
    font-size: 0.875rem;
    font-weight: 600;
    padding: 0 4px;
  }

  &__images {
    display: flex;
    gap: 6px;
    align-items: center;
    margin-top: 8px;

    img {
      max-width: 100%;
      height: auto;
      max-height: 32px;
    }
  }
}

.loss-list {
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 0.85rem;
  max-width: 180px; // ← увеличено, чтобы не обрезалось
  color: #475467;
  list-style: none;
  padding: 0;
  text-align: center;
}

.loss-empty {
  margin-top: 12px;
  font-size: 0.85rem;
  color: #98a2b3;
  text-align: center;
  padding: 0 8px;
}

.economy-modal {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;

  &__backdrop {
    position: absolute;
    inset: 0;
    background: rgba(15, 23, 42, 0.45);
    backdrop-filter: blur(2px);
  }

  &__content {
    position: relative;
    width: min(480px, calc(100% - 32px));
    max-height: 90vh;
    overflow-y: auto;
    background: #fff;
    border-radius: 20px;
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    z-index: 1001;
  }

  &__subtitle {
    margin: 0;
    color: #475467;
  }

  &__close {
    position: absolute;
    top: 12px;
    right: 12px;
    border: none;
    background: transparent;
    font-size: 1.1rem;
    cursor: pointer;
  }

  &__summary {
    display: flex;
    gap: 16px;

    > div {
      flex: 1;
      background: #f5f6ff;
      border-radius: 12px;
      padding: 12px;
      text-align: center;

      span {
        display: block;
        font-size: 0.85rem;
        color: #475467;
      }

      strong {
        display: block;
        margin-top: 4px;
        font-size: 1.2rem;
      }
    }
  }

  &__list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 12px;

    li {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      padding: 12px;
      border-radius: 12px;
      background: #f8fafc;
      border: 1px solid #e5e7eb;
      cursor: pointer;
      transition:
        border-color 0.2s ease,
        transform 0.2s ease;

      &:hover,
      &:focus-visible {
        border-color: #1a73e8;
        transform: translateY(-1px);
        outline: none;
      }
    }
  }

  &__list-title {
    margin: 0;
    font-weight: 600;
  }

  &__list-type {
    margin: 2px 0 0;
    font-size: 0.85rem;
    color: #667085;
  }

  &__list-sum {
    text-align: right;
    font-size: 0.9rem;
    min-width: 120px;

    small {
      display: block;
      color: #98a2b3;
    }
  }

  &__sales {
    background: #f5f6ff;
    border-radius: 12px;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 8px;

    strong {
      color: #1d4ed8;
    }
  }

  &__hint {
    margin-top: 12px;
    padding: 12px;
    border-radius: 12px;
    background: #e5f0ff;
    color: #1d4ed8;
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
