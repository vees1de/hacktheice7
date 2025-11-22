import { defineStore } from 'pinia';
import { ref, watch } from 'vue';

type ThemeMode = 'default' | 'accessible';

const STORAGE_KEY = 'lasso-ui-theme';

const readInitialTheme = (): ThemeMode => {
  if (typeof window === 'undefined') return 'default';
  const saved = window.localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
  return saved === 'accessible' ? 'accessible' : 'default';
};

const applyThemeToDocument = (mode: ThemeMode) => {
  if (typeof document === 'undefined') return;
  document.documentElement.setAttribute('data-theme', mode);
  document.body.setAttribute('data-theme', mode);
};

export const useThemeStore = defineStore('theme', () => {
  const theme = ref<ThemeMode>(readInitialTheme());

  const setTheme = (mode: ThemeMode) => {
    theme.value = mode;
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, mode);
    }
  };

  const init = () => {
    applyThemeToDocument(theme.value);
  };

  watch(
    theme,
    mode => {
      applyThemeToDocument(mode);
    },
    { immediate: true }
  );

  return {
    theme,
    setTheme,
    init
  };
});
