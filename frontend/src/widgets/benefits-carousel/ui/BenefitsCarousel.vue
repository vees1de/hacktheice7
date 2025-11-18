<script setup lang="ts">
import { Card } from '@shared/types/card';
import { Carousel } from '@shared/ui';

const cards: Card[] = [
  {
    bannerName: '1',
    title: 'ЖКХ скидка - 50%',
    subtitle: 'Инвалидам и семьям, имеющим детей инвалидов',
    tags: ['Многодетным', 'Инвалидам 1, 2 группы']
  },
  {
    bannerName: '1',
    title: 'ЖКХ скидка - 50%',
    subtitle: 'Инвалидам и семьям, имеющим детей инвалидов',
    tags: ['Многодетным', 'Инвалидам 1, 2 группы']
  },
  {
    bannerName: '1',
    title: 'ЖКХ скидка - 50%',
    subtitle: 'Инвалидам и семьям, имеющим детей инвалидов',
    tags: ['Многодетным', 'Инвалидам 1, 2 группы']
  }
];
</script>
<template>
  <Carousel :cards="cards" />
</template>
<style lang="scss" scoped></style>
