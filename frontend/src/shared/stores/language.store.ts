import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

import { ru } from '../locales/ru';
import { sk } from '../locales/sk';

const availableLangs = ['ru', 'sk'] as const;

type keys = keyof typeof ru;

export type AvailableLang = (typeof availableLangs)[number];

export const useLangStore = defineStore('lang', () => {
  const locale = ref<AvailableLang>('ru');

  const langs = { ru, sk };

  const t = computed(() => {
    console.log(langs[locale.value]);
    return langs[locale.value];
  });

  const change = () => {
    locale.value = locale.value === 'ru' ? 'sk' : 'ru';
  };

  return {
    t,
    change
  };
});
