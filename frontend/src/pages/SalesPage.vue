<script setup lang="ts">
import { useUserStore } from '@entities/user';
import { useCatalogStore } from '@shared/stores/catalog.store';
import { Calendar } from '@widgets/calendar';
import { Economy } from '@widgets/possible-economy';
import { SalesCarousel } from '@widgets/sales-carousel';
import { storeToRefs } from 'pinia';
import { computed, onMounted } from 'vue';

const catalogStore = useCatalogStore();
const userStore = useUserStore();
const { offers, offersLoading } = storeToRefs(catalogStore);
const { user } = storeToRefs(userStore);

onMounted(() => {
  catalogStore.fetchOffers();
});

const confirmedUserCategories = computed(
  () =>
    user.value.userBeneficiaryCategories
      ?.filter(category => category.confirmed)
      .map(category => category.categoryId) ?? []
);

const filteredOffers = computed(() => {
  if (!confirmedUserCategories.value.length) return offers.value;
  return offers.value.filter(offer =>
    offer.offerCategories?.some(cat =>
      confirmedUserCategories.value.includes(cat.beneficiaryCategory.id)
    )
  );
});
</script>
<template>
  <div class="sales">
    <div class="section-heading">
      <h3>Льготы для тебя</h3>
      <img
        src="/assets/icons/arrow.svg"
        alt="''"
      />
    </div>
    <Economy type="sales" />
    <div class="section-heading">
      <h3>Календарь скидок</h3>
      <img
        src="/assets/icons/arrow.svg"
        alt="''"
      />
    </div>
    <Calendar />
    <div class="section-heading">
      <h3>Самые популярные магазины</h3>
      <img
        src="/assets/icons/arrow.svg"
        alt="''"
      />
    </div>
    <SalesCarousel
      :offers="filteredOffers"
      :loading="offersLoading"
    />
  </div>
</template>
<style lang="scss" scoped>
.sales {
  display: grid;
  gap: 32px;
}
</style>
