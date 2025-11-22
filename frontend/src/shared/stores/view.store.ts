import { useAuthStore } from '@entities/auth';
import { ROUTE_NAMES } from '@shared/model/routes.constants';
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

  const hideGlobalChrome = computed(() => false);

  const showMenu = computed(() => {
    const isOkRoute =
      !router.currentRoute.value.path.includes('user') &&
      !router.currentRoute.value.path.startsWith('/auth');

    return isOkRoute && isAuthenticated.value && !hideGlobalChrome.value;
  });

  const showHeader = computed(() => !hideGlobalChrome.value);
  return {
    isQrSheetVisible,
    toggleQrVisible,
    isLoading,
    toggleLoader,
    showMenu,
    showHeader
  };
});
