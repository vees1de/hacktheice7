<script setup lang="ts">
import { Card } from '@shared/types/card';
import { Carousel } from '@shared/ui';

const cards: Card[] = [
  {
    bannerName: '3',
    title: 'Ганза на Кирова',
    subtitle: 'Якутск, ​Улица Кирова, 17/5',
    tags: ['Многодетным', 'Инвалидам 1, 2 группы']
  },
  {
    bannerName: '3',
    title: 'Ганза на Кирова',
    subtitle: 'Якутск, ​Улица Кирова, 17/5',
    tags: ['Многодетным', 'Инвалидам 1, 2 группы']
  },
  {
    bannerName: '3',
    title: 'Ганза на Кирова',
    subtitle: 'Якутск, ​Улица Кирова, 17/5',
    tags: ['Многодетным', 'Инвалидам 1, 2 группы']
  }
];
</script>
<template>
  <Carousel :cards="cards" />
</template>
<style lang="scss" scoped></style>
