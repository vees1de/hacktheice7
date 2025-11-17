import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useViewStore = defineStore('view', () => {
  const isQrSheetVisible = ref(false);
  const toggleQrVisible = () => {
    isQrSheetVisible.value = !isQrSheetVisible.value;
  };

  const isLoading = ref(false);
  const toggleLoader = () => (isLoading.value = !isLoading.value);
  return { isQrSheetVisible, toggleQrVisible, isLoading, toggleLoader };
});
