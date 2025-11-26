<script setup lang="ts">
import { useAuthStore, useBiometricStore } from '@entities/auth';
import { useUserStore } from '@entities/user';
import { ROUTE_NAMES } from '@shared/model/routes.constants';
import { storeToRefs } from 'pinia';
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

const biometricStore = useBiometricStore();
const userStore = useUserStore();
const authStore = useAuthStore();
const router = useRouter();

const { meta, supported, isProcessing, isPinSet } = storeToRefs(biometricStore);
const message = ref('');
const pin = ref('');
const pinRepeat = ref('');

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

const savePin = async () => {
  message.value = '';
  try {
    if (pin.value !== pinRepeat.value) {
      message.value = 'ПИНы не совпадают.';
      return;
    }
    if (pin.value.length !== 4) {
      message.value = 'ПИНы не равен 4.';
      return;
    }
    await biometricStore.setPin(pin.value.trim());
    message.value = 'ПИН сохранен. Теперь можно входить без пароля.';
  } catch (error: any) {
    message.value = error?.message ?? 'Не удалось сохранить ПИН.';
  }
};

const goToLock = async () => {
  await router.push(ROUTE_NAMES.LOCK);
};

const readyToContinue = computed(() => isPinSet.value || meta.value?.phone);

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

  if (meta.value?.phone || isPinSet.value) {
    router.push(ROUTE_NAMES.LOCK);
    return;
  }

  if (!authStore.isAuthenticated) {
    router.push(ROUTE_NAMES.WELCOME);
  }
});
</script>

<template>
  <div class="secure">
    <div class="secure__card">
      <div class="secure__header">
        <p class="secure__eyebrow">Шаг защиты</p>
        <h1>Создайте ПИН и включите Face ID</h1>
        <p>Нужно хотя бы одно: ПИН или биометрия.</p>
      </div>

      <div class="secure__grid">
        <div class="secure__panel">
          <div class="panel__header">
            <p class="panel__title">ПИН-код</p>
            <p class="panel__subtitle">4–6 цифр для быстрого входа.</p>
          </div>
          <div class="pin-fields">
            <input
              v-model="pin"
              type="password"
              inputmode="numeric"
              pattern="[0-9]*"
              maxlength="6"
              placeholder="Придумайте ПИН"
            />
            <input
              v-model="pinRepeat"
              type="password"
              inputmode="numeric"
              pattern="[0-9]*"
              maxlength="4"
              placeholder="Повторите ПИН"
            />
            <button
              class="btn btn--ghost"
              type="button"
              :disabled="isPinSet || pin.length < 4 || pin !== pinRepeat"
              @click="savePin"
            >
              {{ isPinSet ? 'ПИН сохранен' : 'Сохранить ПИН' }}
            </button>
          </div>
        </div>

        <div class="secure__panel">
          <div class="panel__header">
            <p class="panel__title">Face ID / отпечаток</p>
            <p class="panel__subtitle">
              Подключите биометрию для мгновенного входа.
            </p>
          </div>
          <button
            v-if="supported !== false"
            class="btn btn--primary"
            type="button"
            :disabled="isProcessing"
            @click="enableBiometrics"
          >
            {{ isProcessing ? 'Подключаем...' : 'Включить биометрию' }}
          </button>
          <p
            v-if="supported === false"
            class="hint"
          >
            Биометрия на этом устройстве недоступна.
          </p>
        </div>
      </div>

      <button
        class="btn btn--success"
        type="button"
        :disabled="!readyToContinue"
        @click="goToLock"
      >
        Продолжить
      </button>

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
  display: flex;
  align-items: center;
  justify-content: center;
}

.secure__card {
  width: 100%;
  max-width: 520px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 20px 45px rgba(15, 23, 42, 0.4);
  display: grid;
  gap: 16px;
  backdrop-filter: blur(12px);

  h1 {
    margin: 0;
    font-size: 1.5rem;
  }

  p {
    margin: 0;
    color: #475467;
  }
  .secure__header {
    .secure__eyebrow {
      margin: 0;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      font-weight: 700;
      color: #0ea5e9;
    }
    h1 {
      margin: 4px 0 8px;
    }
    p {
      margin: 0;
    }
  }

  .secure__grid {
    display: grid;
    gap: 12px;
    grid-template-columns: 1fr;
  }

  .secure__panel {
    border: 1px solid #e2e8f0;
    border-radius: 16px;
    padding: 14px;
    background: #f8fafc;
    display: grid;
    gap: 10px;
  }

  .panel__header {
    display: grid;
    gap: 4px;
  }

  .panel__title {
    margin: 0;
    font-weight: 700;
  }

  .panel__subtitle {
    margin: 0;
    color: #475467;
  }

  .pin-fields {
    display: grid;
    gap: 8px;

    input {
      border: 1px solid #cbd5e1;
      border-radius: 10px;
      padding: 10px 12px;
      font-size: 1rem;
    }
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
    background: linear-gradient(135deg, #0ea5e9, #2563eb);
    color: #fff;
  }

  .btn--ghost {
    background: #e0ecff;
    color: #1f2937;
  }

  .btn--success {
    background: linear-gradient(135deg, #10b981, #22c55e);
    color: #fff;
  }

  .hint {
    margin: 0;
    color: #7f1d1d;
    font-size: 0.95rem;
  }
}
</style>
