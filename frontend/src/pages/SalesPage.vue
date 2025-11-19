<script setup lang="ts">
import { Economy } from '@widgets/possible-economy';
</script>
<template>
  <div class="sales">
    <div class="section-heading">
      <h3>Льготы для тебя</h3>
      <img src="@shared/assets/icons/arrow.svg" />
    </div>
    <Economy type="sales" />
  </div>
</template>
<style lang="scss" scoped>
.sales {
  display: grid;
  gap: 32px;
}
</style>
