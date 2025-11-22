import { benefitApi } from '@entities/benefit';
import { offerApi } from '@entities/offer';
import { Benefit } from '@entities/benefit/types/benefit.types';
import { Offer } from '@entities/offer/types/offer.types';
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useCatalogStore = defineStore('catalog', () => {
  const benefits = ref<Benefit[]>([]);
  const offers = ref<Offer[]>([]);
  const benefitsLoading = ref(false);
  const offersLoading = ref(false);
  const benefitsLoaded = ref(false);
  const offersLoaded = ref(false);
  const benefitsError = ref('');
  const offersError = ref('');

const fetchBenefits = async (force = false) => {
  if (benefitsLoading.value || (benefitsLoaded.value && !force)) return;
  benefitsLoading.value = true;
  benefitsError.value = '';
  try {
    benefits.value = await benefitApi.getAvailableForUser();
    benefitsLoaded.value = true;
  } catch (error) {
    benefitsError.value = 'Не удалось загрузить льготы';
    console.error(error);
  } finally {
      benefitsLoading.value = false;
    }
  };

  const fetchOffers = async (force = false) => {
    if (offersLoading.value || (offersLoaded.value && !force)) return;
    offersLoading.value = true;
    offersError.value = '';
    try {
      offers.value = await offerApi.getPublic();
      offersLoaded.value = true;
    } catch (error) {
      offersError.value = 'Не удалось загрузить акции';
      console.error(error);
    } finally {
      offersLoading.value = false;
    }
  };

  return {
    benefits,
    offers,
    benefitsLoading,
    offersLoading,
    benefitsError,
    offersError,
    fetchBenefits,
    fetchOffers
  };
});
