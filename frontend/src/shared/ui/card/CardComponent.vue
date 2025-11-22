<script setup lang="ts">
import { Card } from '@shared/types/card';

defineProps<Card>();
</script>
<template>
  <div class="card">
    <div
      class="card__banner"
      :style="{
        backgroundImage: `url(/assets/images/card-banner${bannerName}.png)`
      }"
    ></div>
    <div class="card__info">
      <h6 class="title">{{ title }}</h6>
      <p class="subtitle">{{ subtitle }}</p>
      <div class="tags">
        <div
          v-for="tag of tags"
          v-key="tag"
          class="tag"
        >
          {{ tag }}
        </div>
      </div>
    </div>
  </div>
</template>
<style lang="scss" scoped>
.card {
  height: 250px;
  width: 280px;
  border-radius: 16px;
  background-color: #e5f0ff;
  border: 1px solid #c6ddfd;
  display: grid;
  grid-template-rows: 7fr 5fr;

  &__banner {
    background-size: cover;
    background-repeat: no-repeat;
    background-position: center;
    border-radius: 16px;
  }

  &__info {
    padding: 16px;
    .title {
      font-weight: 600;
      color: #000;
      margin-bottom: 8px;
    }

    .subtitle {
      color: #a2a2a2;
      font-size: 0.875rem;
      width: 250px;
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
      margin-bottom: 12px;
    }

    .tags {
      display: flex;
      gap: 4px;
      overflow: hidden;

      .tag {
        padding: 3px 8px;
        color: #1a73e8;
        border: 1px solid #1a73e8;
        font-size: 0.75rem;
        border-radius: 24px;
        width: fit-content;
      }
    }
  }
}
</style>
