<script setup lang="ts">
import { type UserLossResult, lossApi } from '@entities/loss';
import { computed, onMounted, ref } from 'vue';

const { type = 'both' } = defineProps<{
  type?: 'both' | 'sales' | 'benefits';
}>();

const lossData = ref<UserLossResult | null>(null);
const isLossLoading = ref(false);

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
</script>
<template>
  <div
    v-if="type === 'sales' || type === 'both'"
    class="economy sales"
  >
    <div class="money">
      <div class="money__sum">13.000₽</div>
      <div class="money__date">11.02.2024-10.01.2025</div>
    </div>
    <div class="shops">
      <div class="shops__count">В 24 магазинах</div>
      <div class="shops__images">
        <img
          src="/assets/images/shops.png"
          alt=""
        />
        <div>...</div>
      </div>
    </div>
  </div>

  <div
    v-if="type === 'benefits' || type === 'both'"
    class="economy"
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
</template>
<style lang="scss" scoped>
.economy {
  display: flex;
  justify-content: space-around;
  gap: 36px;
  padding-inline: 14px;
  margin-bottom: 24px;
}

.sales {
  margin-bottom: 0;
}

.money {
  width: 160px;
  min-height: 100px;
  background-color: #e5f0ff;
  border: 2px solid #c6ddfd;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  &__sum {
    font-weight: 600;
    font-size: 1.5rem;
    line-height: 17px;
    margin-bottom: 6px;
  }

  &__date {
    text-decoration: underline;
    color: #a2a2a2;
    font-size: 0.75rem;
  }

  &__secondary {
    font-size: 0.75rem;
    color: #475467;
    margin-top: 4px;
  }
}

.shops {
  text-align: center;
  display: grid;
  place-items: center;
  width: 200px;

  &__count {
    font-size: 0.875rem;
    font-weight: 600;
  }

  &__images {
    display: flex;
    gap: 6px;

    align-items: center;

    img {
      width: auto;
      height: 32px;
    }
  }
}

.loss-list {
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 0.85rem;
  max-width: 80px;
  color: #475467;
  list-style: none;
  padding: 0;
}

.loss-empty {
  margin-top: 12px;
  font-size: 0.85rem;
  color: #98a2b3;
  text-align: center;
}
</style>
