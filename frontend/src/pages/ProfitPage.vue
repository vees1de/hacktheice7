<template>
  <div class="app-container">
    <!-- Header with tabs -->
    <div class="header-tabs">
      <button
        class="tab-button active"
        @click="activeTab = 'planned'"
      >
        Упущенная выгода
      </button>
      <button
        class="tab-button"
        @click="activeTab = 'actual'"
      >
        Фактическая выгода
      </button>
    </div>

    <!-- Main content -->
    <div class="main-content">
      <!-- Amount display -->
      <div class="amount-display">
        <h1>12645 ₽</h1>
      </div>

      <!-- Month selector -->
      <div class="month-selector">
        <button class="back-button">‹</button>
        <span class="month-label">Ноябрь</span>
      </div>

      <!-- Donut chart -->
      <!-- <div class="chart-container">
        <div class="donut-chart">
          <div class="chart-ring">
            <div class="chart-segment segment-1"></div>
            <div class="chart-segment segment-2"></div>
            <div class="chart-segment segment-3"></div>
            <div class="chart-segment segment-4"></div>
            <div class="chart-segment segment-5"></div>
          </div>
          <div class="chart-center">
            <div class="center-circle"></div>
          </div>
        </div>
      </div> -->

      <!-- Categories list -->
      <div class="categories-section">
        <h2>Категории</h2>
        <div class="categories-list">
          <div
            class="category-item"
            v-for="(category, index) in categories"
            :key="index"
          >
            <div class="category-icon">
              <div class="icon-placeholder">{{ category.icon }}</div>
            </div>
            <div class="category-info">
              <div class="category-name">{{ category.name }}</div>
              <div class="category-operations">
                {{ category.operations }} операция
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const activeTab = ref('planned');

const categories = ref([
  { name: 'Льгота ЖКУ', operations: 1, icon: '🏠' },
  { name: 'Ганза', operations: 3, icon: '🛒' },
  { name: 'Сладкие мечты', operations: 2, icon: '🍭' },
  { name: 'Аптека', operations: 2, icon: '💊' },
  { name: 'ХозМаркет', operations: 1, icon: '🧹' }
]);
</script>

<style lang="scss" scoped>
.app-container {
  max-width: 400px;

  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.header-tabs {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;

  .tab-button {
    padding: 8px 16px;
    border-radius: 20px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
    border: none;

    &.active {
      background-color: #1e88e5;
      color: white;
    }

    &:not(.active) {
      background-color: #e3f2fd;
      color: #1e88e5;
    }
  }
}

.main-content {
  .amount-display {
    h1 {
      font-size: 2.5rem;
      font-weight: 700;
      color: #333;
      margin-bottom: 15px;
    }
  }

  .month-selector {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    margin-bottom: 20px;

    .back-button {
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      color: #666;

      &:hover {
        color: #1e88e5;
      }
    }

    .month-label {
      font-size: 1.2rem;
      font-weight: 600;
      color: #333;
    }
  }

  .chart-container {
    display: flex;
    justify-content: center;
    margin-bottom: 25px;

    .donut-chart {
      position: relative;
      width: 180px;
      height: 180px;

      .chart-ring {
        position: relative;
        width: 100%;
        height: 100%;

        .chart-segment {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          clip-path: polygon(
            50% 50%,
            50% 0%,
            100% 0%,
            100% 100%,
            0% 100%,
            0% 0%
          );
          transform-origin: 50% 50%;

          &.segment-1 {
            background: linear-gradient(90deg, #1e88e5 0%, #42a5f5 100%);
            transform: rotate(0deg) scale(0.8);
          }

          &.segment-2 {
            background: linear-gradient(90deg, #42a5f5 0%, #64b5f6 100%);
            transform: rotate(72deg) scale(0.8);
          }

          &.segment-3 {
            background: linear-gradient(90deg, #64b5f6 0%, #90caf9 100%);
            transform: rotate(144deg) scale(0.8);
          }

          &.segment-4 {
            background: linear-gradient(90deg, #90caf9 0%, #bbdefb 100%);
            transform: rotate(216deg) scale(0.8);
          }

          &.segment-5 {
            background: linear-gradient(90deg, #bbdefb 0%, #e3f2fd 100%);
            transform: rotate(288deg) scale(0.8);
          }
        }
      }

      .chart-center {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 120px;
        height: 120px;
        background-color: white;
        border-radius: 50%;
        display: flex;
        justify-content: center;
        align-items: center;

        .center-circle {
          width: 80px;
          height: 80px;
          background-color: #f8f9fa;
          border-radius: 50%;
        }
      }
    }
  }

  .categories-section {
    h2 {
      font-size: 1.3rem;
      font-weight: 600;
      color: #333;
      margin-bottom: 15px;
    }

    .categories-list {
      .category-item {
        display: flex;
        align-items: center;
        padding: 15px 0;
        border-bottom: 1px solid #eee;

        &:last-child {
          border-bottom: none;
        }

        .category-icon {
          width: 40px;
          height: 40px;
          background-color: #e3f2fd;
          border-radius: 50%;
          display: flex;
          justify-content: center;
          align-items: center;
          margin-right: 15px;

          .icon-placeholder {
            font-size: 1.2rem;
            color: #1e88e5;
          }
        }

        .category-info {
          flex-grow: 1;

          .category-name {
            font-weight: 600;
            color: #333;
            margin-bottom: 5px;
          }

          .category-operations {
            font-size: 0.9rem;
            color: #666;
          }
        }
      }
    }
  }
}
</style>
