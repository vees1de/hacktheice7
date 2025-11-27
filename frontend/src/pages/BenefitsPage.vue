<script setup lang="ts">
import { useCatalogStore } from '@shared/stores/catalog.store';
import { BenefitsCarousel } from '@widgets/benefits-carousel';
import { CategoriesComponent } from '@widgets/categories';
import { DocumentsCarousel } from '@widgets/documents-carousel';
import { storeToRefs } from 'pinia';
import { onMounted } from 'vue';

const catalogStore = useCatalogStore();
const { benefits, benefitsLoading } = storeToRefs(catalogStore);

onMounted(() => {
  catalogStore.fetchBenefits();
});
</script>
<template>
  <div class="benefits">
    <div class="section-heading">
      <h3>Категории</h3>
      <img
        src="/assets/icons/arrow.svg"
        alt="''"
      />
    </div>
    <CategoriesComponent />
    <div class="section-heading">
      <h3>Где подать документы</h3>
      <img
        src="/assets/icons/arrow.svg"
        alt="''"
      />
    </div>
    <DocumentsCarousel />
    <div class="section-heading">
      <h3>Самые популярные льготы</h3>
      <img
        src="/assets/icons/arrow.svg"
        alt="''"
      />
    </div>
    <BenefitsCarousel
      :benefits="benefits"
      :loading="benefitsLoading"
    />
  </div>
</template>
<style lang="scss" scoped>
.benefits {
  display: grid;
  gap: 32px;
  margin-bottom: 36px;
}
</style>
