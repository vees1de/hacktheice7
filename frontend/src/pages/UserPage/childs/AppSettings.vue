<script setup lang="ts">
import { useThemeStore } from '@shared/stores/theme.store';
import { storeToRefs } from 'pinia';

const themeStore = useThemeStore();
const { theme } = storeToRefs(themeStore);

const themeOptions = [
  {
    id: 'default',
    label: 'Стандартная тема',
    description: 'Базовая цветовая схема приложения'
  },
  {
    id: 'accessible',
    label: 'Высокая контрастность',
    description:
      'Фон #2455CC, белый текст, увеличенный шрифт и серые бордеры для элементов управления'
  }
];

const selectTheme = (value: string) => {
  themeStore.setTheme(value as 'default' | 'accessible');
};
</script>

<template>
  <section class="settings">
    <header>
      <h1>Настройки приложения</h1>
      <p>Выберите тему отображения, которая будет удобна именно вам.</p>
    </header>

    <fieldset class="theme-options">
      <legend>Тема интерфейса</legend>
      <label
        v-for="option in themeOptions"
        :key="option.id"
        class="theme-card"
        :class="{ active: theme === option.id }"
      >
        <input
          type="radio"
          :value="option.id"
          :checked="theme === option.id"
          name="theme"
          @change="selectTheme(option.id)"
        />
        <div class="theme-card__body">
          <p class="theme-card__title">{{ option.label }}</p>
          <p class="theme-card__description">{{ option.description }}</p>
        </div>
      </label>
    </fieldset>
  </section>
</template>

<style scoped lang="scss">
.settings {
  padding: 24px 16px;
  display: flex;
  flex-direction: column;
  gap: 20px;

  header {
    h1 {
      margin: 0 0 6px;
      font-size: 1.4rem;
    }

    p {
      margin: 0;
      color: #475467;
    }
  }
}

.theme-options {
  border: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 12px;

  legend {
    font-weight: 600;
    margin-bottom: 8px;
  }
}

.theme-card {
  display: flex;
  gap: 12px;
  border: 1px solid #d0d5dd;
  border-radius: 16px;
  padding: 12px 14px;
  cursor: pointer;
  background: #fff;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;

  &.active {
    border-color: #2455cc;
    box-shadow: 0 4px 12px rgba(36, 85, 204, 0.2);
  }

  input {
    margin-top: 6px;
  }

  &__body {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  &__title {
    margin: 0;
    font-weight: 600;
  }

  &__description {
    margin: 0;
    color: #475467;
    font-size: 0.9rem;
  }
}
</style>
