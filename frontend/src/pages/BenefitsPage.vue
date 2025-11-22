<script setup lang="ts">
import { BenefitsCarousel } from '@widgets/benefits-carousel';
import { CategoriesComponent } from '@widgets/categories';
import { DocumentsCarousel } from '@widgets/documents-carousel';
</script>
<template>
  <div class="benefits">
    <div class="section-heading">
      <h3>Категории</h3>
      <img src="/assets/icons/arrow.svg" />
    </div>
    <CategoriesComponent />
    <div class="section-heading">
      <h3>Где подать документы</h3>
      <img src="/assets/icons/arrow.svg" />
    </div>
    <DocumentsCarousel />
    <div class="section-heading">
      <h3>Самые популярные льготы</h3>
      <img src="/assets/icons/arrow.svg" />
    </div>
    <BenefitsCarousel />
  </div>
</template>
<style lang="scss" scoped>
.benefits {
  display: grid;
  gap: 32px;
  margin-bottom: 36px;
}
</style>
