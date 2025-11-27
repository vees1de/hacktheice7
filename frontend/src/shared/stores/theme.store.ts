import localForage from 'localforage';
import { defineStore } from 'pinia';
import { ref } from 'vue';

export type Theme = 'default' | 'accessible';

const body = document.body;
const KEY = 'lasso-theme';
export const useThemeStore = defineStore('theme', () => {
  const theme = ref<Theme>('default');

  async function setTheme(newTheme: Theme) {
    body.classList.remove(theme.value);
    body.classList.add(newTheme);
    theme.value = newTheme;

    await localForage.setItem(KEY, newTheme);
  }

  async function init() {
    const theme = (await localForage.getItem(KEY)) as Theme;
    setTheme(theme);
  }

  return { setTheme, theme, init };
});
