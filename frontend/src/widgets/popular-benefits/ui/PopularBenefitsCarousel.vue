<script setup lang="ts">
import { Card } from '@shared/types/card';
import { Carousel } from '@shared/ui';

const cards: Card[] = [
  {
    bannerName: '2',
    title: 'МФЦ - Мои документы',
    subtitle: 'Якутск, ​улица Аммосова, 18',
    tags: ['Пн-Сб', 'с 08:00 до 20:00']
  },
  {
    bannerName: '2',
    title: 'МФЦ - Мои документы',
    subtitle: 'Якутск, ​улица Аммосова, 18',
    tags: ['Пн-Сб', 'с 08:00 до 20:00']
  },
  {
    bannerName: '2',
    title: 'МФЦ - Мои документы',
    subtitle: 'Якутск, ​улица Аммосова, 18',
    tags: ['Пн-Сб', 'с 08:00 до 20:00']
  }
];
</script>
<template>
  <Carousel :cards="cards" />
</template>
<style lang="scss" scoped></style>
