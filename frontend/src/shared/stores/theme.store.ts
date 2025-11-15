import { defineStore } from 'pinia';
import { ref } from 'vue';

type Theme = 'light' | 'dark';

const body = document.body;

export const useThemeStore = defineStore('theme', () => {
  const currentTheme = ref<Theme>('light');

  function setDefaultTheme() {
    body.classList.add('app', currentTheme.value);
  }

  function setTheme(newTheme: Theme) {
    body.classList.replace(currentTheme.value, newTheme);
  }

  return { setTheme, currentTheme, setDefaultTheme };
});
