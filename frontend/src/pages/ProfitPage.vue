<script setup lang="ts">
import { computed, ref } from 'vue';

type Category = {
  name: string;
  value: number;
  operations: number;
  icon: string;
  color: string;
};

const activeTab = ref<'planned' | 'actual'>('planned');
const month = ref('Ноябрь');

const tabData: Record<'planned' | 'actual', Category[]> = {
  planned: [
    {
      name: 'Льгота ЖКХ',
      value: 4200,
      operations: 1,
      icon: '🏠',
      color: '#2563eb'
    },
    {
      name: 'Медицина',
      value: 2800,
      operations: 2,
      icon: '💊',
      color: '#7c3aed'
    },
    {
      name: 'Продукты (Ганза)',
      value: 1900,
      operations: 3,
      icon: '🛒',
      color: '#f97316'
    },
    {
      name: 'Сладкие мечты',
      value: 1250,
      operations: 2,
      icon: '🍭',
      color: '#ec4899'
    },
    {
      name: 'ХозМаркет',
      value: 900,
      operations: 1,
      icon: '🧹',
      color: '#0ea5e9'
    }
  ],
  actual: [
    {
      name: 'Льгота ЖКХ',
      value: 3600,
      operations: 1,
      icon: '🏠',
      color: '#2563eb'
    },
    {
      name: 'Медицина',
      value: 1500,
      operations: 1,
      icon: '💊',
      color: '#7c3aed'
    },
    {
      name: 'Продукты (Ганза)',
      value: 2100,
      operations: 4,
      icon: '🛒',
      color: '#f97316'
    },
    {
      name: 'Сладкие мечты',
      value: 700,
      operations: 1,
      icon: '🍭',
      color: '#ec4899'
    },
    {
      name: 'ХозМаркет',
      value: 450,
      operations: 1,
      icon: '🧹',
      color: '#0ea5e9'
    }
  ]
};

const currentCategories = computed(() => tabData[activeTab.value]);
const totalValue = computed(() =>
  currentCategories.value.reduce((acc, item) => acc + item.value, 0)
);

const formatter = new Intl.NumberFormat('ru-RU');
const currentMonth = computed(() => `${month.value}`);
const formattedTotal = computed(() => formatCurrency(totalValue.value));

function formatCurrency(value: number) {
  return `${formatter.format(value)} ₽`;
}

const chartSegments = computed(() => {
  const denominator = totalValue.value || 1;
  let cumulative = 0;

  return currentCategories.value.map(item => {
    const percent = Number(((item.value / denominator) * 100).toFixed(2));
    const dashArray = `${percent} ${100 - percent}`;
    const dashOffset = 25 - cumulative;
    cumulative += percent;

    return {
      ...item,
      dashArray,
      dashOffset
    };
  });
});

const pluralizeOperation = (count: number) => {
  if (count % 10 === 1 && count % 100 !== 11) return 'операция';
  if ([2, 3, 4].includes(count % 10) && ![12, 13, 14].includes(count % 100))
    return 'операции';
  return 'операций';
};
</script>

<template>
  <div class="profit">
    <div class="header-tabs">
      <button
        class="tab-button"
        :class="{ active: activeTab === 'planned' }"
        type="button"
        @click="activeTab = 'planned'"
      >
        Упущенная выгода
      </button>
      <button
        class="tab-button"
        :class="{ active: activeTab === 'actual' }"
        type="button"
        @click="activeTab = 'actual'"
      >
        Фактическая выгода
      </button>
    </div>

    <section class="summary">
      <p class="summary__label">За {{ currentMonth }}</p>
      <p class="summary__value">{{ formattedTotal }}</p>
    </section>

    <section class="chart-card">
      <div class="month-selector">
        <button
          class="month-selector__button"
          type="button"
        >
          ‹
        </button>
        <span class="month-selector__label">{{ currentMonth }}</span>
        <button
          class="month-selector__button"
          type="button"
        >
          ›
        </button>
      </div>

      <div class="chart-container">
        <svg
          class="donut"
          viewBox="0 0 36 36"
        >
          <circle
            class="donut__track"
            cx="18"
            cy="18"
            r="15.915"
          />
          <circle
            v-for="segment in chartSegments"
            :key="segment.name"
            class="donut__segment"
            cx="18"
            cy="18"
            r="15.915"
            :stroke="segment.color"
            :stroke-dasharray="segment.dashArray"
            :stroke-dashoffset="segment.dashOffset"
          />
        </svg>

        <div class="chart-center">
          <p>Всего</p>
          <strong>{{ formattedTotal }}</strong>
        </div>
      </div>

      <ul class="chart-legend">
        <li
          v-for="segment in chartSegments"
          :key="segment.name"
        >
          <span
            class="dot"
            :style="{ backgroundColor: segment.color }"
          />
          <span class="legend-label">{{ segment.name }}</span>
          <span class="legend-value">{{ formatCurrency(segment.value) }}</span>
        </li>
      </ul>
    </section>

    <section class="categories-section">
      <h2>Категории</h2>
      <div class="categories-list">
        <article
          v-for="item in currentCategories"
          :key="item.name"
          class="category-card"
        >
          <div
            class="category-card__icon"
            :style="{ backgroundColor: item.color }"
          >
            {{ item.icon }}
          </div>
          <div class="category-card__body">
            <div class="category-card__row">
              <p class="category-card__name">{{ item.name }}</p>
              <strong>{{ formatCurrency(item.value) }}</strong>
            </div>
            <p class="category-card__muted">
              {{ item.operations }} {{ pluralizeOperation(item.operations) }}
            </p>
          </div>
        </article>
      </div>
    </section>
  </div>
</template>

<style scoped lang="scss">
.profit {
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.header-tabs {
  display: flex;
  gap: 10px;

  .tab-button {
    flex: 1;
    border-radius: 999px;
    padding: 10px 14px;
    border: 1px solid #d0d5dd;
    background: #f8f9ff;
    color: #475467;
    font-weight: 600;
    transition: all 0.2s ease;
    cursor: pointer;

    &.active {
      background: #1a73e8;
      color: #fff;
      border-color: #1a73e8;
      box-shadow: 0 4px 12px rgba(26, 115, 232, 0.25);
    }
  }
}

.summary {
  background: linear-gradient(135deg, #1a73e8, #2563eb);
  color: #fff;
  border-radius: 20px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 4px;

  &__label {
    margin: 0;
    opacity: 0.8;
  }

  &__value {
    margin: 0;
    font-size: 32px;
    font-weight: 700;
  }
}

.chart-card {
  border: 1px solid #e4e7ec;
  border-radius: 24px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  background: #fff;
}

.month-selector {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;

  &__button {
    background: #f2f4f7;
    border: none;
    border-radius: 999px;
    width: 32px;
    height: 32px;
    font-size: 18px;
    cursor: pointer;
  }

  &__label {
    font-weight: 600;
  }
}

.chart-container {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 220px;
}

.donut {
  width: 200px;
  height: 200px;
  transform: rotate(-90deg);

  &__track {
    fill: transparent;
    stroke: #f2f4f7;
    stroke-width: 3;
  }

  &__segment {
    fill: transparent;
    stroke-width: 3;
    stroke-linecap: round;
    transition: stroke-dasharray 0.3s ease;
  }
}

.chart-center {
  position: absolute;
  text-align: center;

  p {
    margin: 0;
    color: #475467;
  }

  strong {
    font-size: 1.4rem;
  }
}

.chart-legend {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;

  li {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 0.95rem;
  }

  .dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
  }

  .legend-label {
    flex: 1;
  }

  .legend-value {
    font-weight: 600;
  }
}

.categories-section {
  display: flex;
  flex-direction: column;
  gap: 16px;

  h2 {
    margin: 0;
    font-size: 1.2rem;
  }
}

.categories-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.category-card {
  border: 1px solid #e4e7ec;
  border-radius: 18px;
  padding: 14px;
  display: flex;
  gap: 12px;
  background: #fff;

  &__icon {
    width: 48px;
    height: 48px;
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.3rem;
  }

  &__body {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  &__row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
  }

  &__name {
    margin: 0;
    font-weight: 600;
  }

  &__muted {
    margin: 0;
    color: #98a2b3;
    font-size: 0.9rem;
  }
}
</style>
