import { useAuthStore } from '@entities/auth';
import { defineStore, storeToRefs } from 'pinia';
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';

export const useViewStore = defineStore('view', () => {
  const router = useRouter();
  const { isAuthenticated } = storeToRefs(useAuthStore());
  const isQrSheetVisible = ref(false);
  const toggleQrVisible = () => {
    const isShow = isQrSheetVisible.value;
    if (isShow) {
      document.body.style.overflow = 'auto';
    } else {
      document.body.style.overflow = 'hidden';
    }

    isQrSheetVisible.value = !isQrSheetVisible.value;
  };

  const isLoading = ref(false);
  const toggleLoader = () => (isLoading.value = !isLoading.value);

  const showMenu = computed(() => {
    const isOkRoute = !router.currentRoute.value.path.includes('user');

    return isOkRoute && isAuthenticated;
  });
  return {
    isQrSheetVisible,
    toggleQrVisible,
    isLoading,
    toggleLoader,
    showMenu
  };
});
