<script setup lang="ts">
import { useAuthStore, useBiometricStore } from '@entities/auth';
import { useUserStore } from '@entities/user';
import { ROUTE_NAMES } from '@shared/model/routes.constants';
import { storeToRefs } from 'pinia';
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

const biometricStore = useBiometricStore();
const userStore = useUserStore();
const authStore = useAuthStore();
const router = useRouter();

const { meta, supported, isProcessing } = storeToRefs(biometricStore);
const message = ref('');

const goHome = async () => {
  await router.push(ROUTE_NAMES.HOME);
};

const enableBiometrics = async () => {
  message.value = '';
  try {
    await biometricStore.ensureSupported();
    if (!authStore.isAuthenticated) {
      message.value =
        'Сначала войдите по телефону и паролю, затем включите биометрию.';
      return;
    }
    const user = userStore.user;
    if (!user.phone && authStore.isAuthenticated) {
      await userStore.getUser();
    }
    const displayName = [userStore.user.firstName, userStore.user.lastName]
      .filter(Boolean)
      .join(' ');
    await biometricStore.enroll(userStore.user.phone, displayName);
    message.value =
      'Face ID / отпечаток подключены. Можно использовать быстрый вход.';
  } catch (error: any) {
    message.value = error?.message ?? 'Не удалось подключить биометрию.';
  }
};

const loginWithBiometrics = async () => {
  message.value = '';
  try {
    await biometricStore.loginWithBiometrics();
    await router.push(ROUTE_NAMES.HOME);
  } catch (error: any) {
    message.value = error?.message ?? 'Не получилось войти по биометрии.';
  }
};

onMounted(async () => {
  await biometricStore.ensureSupported();
  await biometricStore.loadFromStorage();
  if (!userStore.user.id && authStore.isAuthenticated) {
    try {
      await userStore.getUser();
    } catch {
      // ignore
    }
  }

  if (!biometricStore.meta?.phone && !authStore.isAuthenticated) {
    router.push(ROUTE_NAMES.WELCOME);
  }
});
</script>

<template>
  <div class="secure">
    <div class="secure__card">
      <h1>Дополнительная защита</h1>
      <p>
        Включите вход по Face ID / отпечатку, чтобы быстро возвращаться в
        приложение.
      </p>

      <div class="secure__actions">
        <button
          v-if="supported !== false"
          class="btn btn--primary"
          type="button"
          :disabled="isProcessing"
          @click="meta?.phone ? loginWithBiometrics() : enableBiometrics()"
        >
          {{
            meta?.phone
              ? isProcessing
                ? 'Проверяем...'
                : 'Войти по биометрии'
              : isProcessing
                ? 'Подключаем...'
                : 'Подключить биометрию'
          }}
        </button>
        <button
          class="btn btn--ghost"
          type="button"
          @click="goHome"
        >
          Продолжить без Face ID
        </button>
      </div>

      <p
        v-if="supported === false"
        class="hint"
      >
        Биометрия недоступна на этом устройстве. Вы можете продолжить без неё.
      </p>
      <p
        v-if="message"
        class="hint"
      >
        {{ message }}
      </p>
    </div>
  </div>
</template>

<style scoped lang="scss">
.secure {
  min-height: calc(100dvh - 106px);
  display: flex;
  align-items: center;
  justify-content: center;
}

.secure__card {
  width: 100%;
  max-width: 440px;
  background: #fff;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 20px 45px rgba(15, 23, 42, 0.12);
  display: grid;
  gap: 12px;

  h1 {
    margin: 0;
    font-size: 1.5rem;
  }

  p {
    margin: 0;
    color: #475467;
  }
}

.secure__actions {
  display: grid;
  gap: 10px;
  margin-top: 8px;
}

.btn {
  border: none;
  border-radius: 12px;
  padding: 12px 14px;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.2s ease;

  &:disabled {
    opacity: 0.6;
    cursor: default;
  }
}

.btn--primary {
  background: linear-gradient(135deg, #0f766e, #0ea5e9);
  color: #fff;
}

.btn--ghost {
  background: #f4f6fb;
  color: #1f2937;
}

.hint {
  margin: 0;
  color: #7f1d1d;
  font-size: 0.95rem;
}
</style>
