import localForage from 'localforage';
import { defineStore } from 'pinia';
import { ref } from 'vue';

export type Theme = 'default' | 'accessible';

const body = document.body;
const KEY = 'lasso-theme';
export const useThemeStore = defineStore('theme', () => {
  const theme = ref<Theme>('default');

  async function setTheme(newTheme: Theme) {
    const next = newTheme || 'default';
    body.classList.remove(theme.value);
    body.classList.add(next);
    theme.value = next;

    await localForage.setItem(KEY, next);
  }

  async function init() {
    const savedTheme = (await localForage.getItem(KEY)) as Theme | null;
    await setTheme(savedTheme || 'default');
  }

  return { setTheme, theme, init };
});
