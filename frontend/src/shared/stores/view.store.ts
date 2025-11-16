import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useViewStore = defineStore('view', () => {
  const isQrSheetVisible = ref(false);
  const toggleQrVisible = () => {
    isQrSheetVisible.value = !isQrSheetVisible.value;
  };
  return { isQrSheetVisible, toggleQrVisible };
});
