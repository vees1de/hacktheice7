<script setup lang="ts">
import { useBiometricStore } from '@entities/auth';
import { useUserStore } from '@entities/user';
import { useThemeStore } from '@shared/stores/theme.store';
import { storeToRefs } from 'pinia';
import { computed, onMounted, ref } from 'vue';

const themeStore = useThemeStore();
const biometricStore = useBiometricStore();
const userStore = useUserStore();

const { theme } = storeToRefs(themeStore);
const { meta, supported, isProcessing, lastError } = storeToRefs(biometricStore);
const { user } = storeToRefs(userStore);

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

const biometricMessage = ref('');

const selectTheme = (value: string) => {
  themeStore.setTheme(value as 'default' | 'accessible');
};

const biometricLabel = computed(() => {
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent || '' : '';
  const isiOS = /iPad|iPhone|iPod/.test(ua);
  if (isiOS) return 'Face ID';
  if (/Android/i.test(ua)) return 'сканер отпечатка';
  return 'биометрию';
});

const biometricEnabled = computed(() => Boolean(meta.value?.phone));
const biometricAvailable = computed(() => supported.value !== false);

const toggleBiometrics = async () => {
  biometricMessage.value = '';
  if (!biometricAvailable.value) {
    biometricMessage.value = 'Биометрия на устройстве недоступна.';
    return;
  }

  if (!user.value?.phone) {
    biometricMessage.value = 'Нет данных профиля для подключения биометрии.';
    return;
  }

  try {
    if (biometricEnabled.value) {
      await biometricStore.disable();
      biometricMessage.value = 'Вход по биометрии отключен.';
    } else {
      const displayName = [user.value.firstName, user.value.lastName]
        .filter(Boolean)
        .join(' ');
      await biometricStore.enroll(user.value.phone, displayName);
      biometricMessage.value = 'Вход по биометрии включен. В следующий раз можно не вводить пароль.';
    }
  } catch (error: any) {
    biometricMessage.value =
      error?.message ??
      'Не удалось обновить настройки биометрии. Попробуйте еще раз.';
  }
};

onMounted(async () => {
  await biometricStore.ensureSupported();
  await biometricStore.loadFromStorage();
});

const removeBiometrics = async () => {
  biometricMessage.value = '';
  try {
    await biometricStore.disable();
    biometricMessage.value = 'Face ID / отпечаток удалены с этого устройства.';
  } catch (error: any) {
    biometricMessage.value = error?.message ?? 'Не удалось удалить биометрию.';
  }
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

    <section class="security">
      <div class="security__header">
        <div>
          <p class="security__title">Быстрый вход по биометрии</p>
          <p class="security__subtitle">
            Открывайте приложение по {{ biometricLabel }} без ввода телефона и пароля.
            {{ meta?.phone ? 'Аккаунт сохранен.' : '' }}
          </p>
        </div>
        <button
          type="button"
          class="security__action"
          :disabled="isProcessing"
          @click="toggleBiometrics"
        >
          {{ biometricEnabled ? 'Отключить' : 'Включить' }}
        </button>
      </div>
      <button
        v-if="biometricEnabled"
        class="security__clear"
        type="button"
        :disabled="isProcessing"
        @click="removeBiometrics"
      >
        Удалить Face ID с этого устройства
      </button>
      <p
        v-if="!biometricAvailable"
        class="security__hint"
      >
        Биометрия на этом устройстве недоступна. Попробуйте с телефона с Face ID или сканером отпечатка.
      </p>
      <p
        v-if="lastError"
        class="security__hint error"
      >
        {{ lastError }}
      </p>
      <p
        v-if="biometricMessage"
        class="security__hint"
      >
        {{ biometricMessage }}
      </p>
    </section>
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

.security {
  border: 1px solid #d0d5dd;
  border-radius: 16px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: #fff;

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
  }

  &__title {
    margin: 0 0 4px;
    font-weight: 700;
  }

  &__subtitle {
    margin: 0;
    color: #475467;
  }

  &__action {
    border: none;
    background: linear-gradient(135deg, #0f766e, #0ea5e9);
    color: #fff;
    padding: 10px 14px;
    border-radius: 12px;
    font-weight: 700;
    cursor: pointer;
    transition: opacity 0.2s ease;

    &:disabled {
      opacity: 0.7;
      cursor: default;
    }
  }

  &__hint {
    margin: 0;
    color: #475467;
    font-size: 0.95rem;

    &.error {
      color: #ef4444;
    }
  }

  &__clear {
    border: 1px dashed #ef4444;
    background: #fff5f5;
    color: #b91c1c;
    padding: 8px 12px;
    border-radius: 10px;
    font-weight: 700;
    cursor: pointer;
    transition: opacity 0.2s ease;

    &:disabled {
      opacity: 0.6;
      cursor: default;
    }
  }
}
</style>
