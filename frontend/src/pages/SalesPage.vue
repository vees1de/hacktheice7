<script setup lang="ts">
import { Calendar } from '@widgets/calendar';
import { Economy } from '@widgets/possible-economy';
import { SalesCarousel } from '@widgets/sales-carousel';
</script>
<template>
  <div class="sales">
    <div class="section-heading">
      <h3>Льготы для тебя</h3>
      <img src="@shared/assets/icons/arrow.svg" />
    </div>
    <Economy type="sales" />
    <div class="section-heading">
      <h3>Календарь скидок</h3>
      <img src="@shared/assets/icons/arrow.svg" />
    </div>
    <Calendar />
    <div class="section-heading">
      <h3>Самые популярные магазины</h3>
      <img src="@shared/assets/icons/arrow.svg" />
    </div>
    <SalesCarousel />
  </div>
</template>
<style lang="scss" scoped>
.sales {
  display: grid;
  gap: 32px;
}
</style>
