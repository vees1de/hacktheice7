<script setup lang="ts">
import { useBiometricStore } from '@entities/auth';
import { ROUTE_NAMES } from '@shared/model/routes.constants';
import { storeToRefs } from 'pinia';
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

const biometricStore = useBiometricStore();
const { meta, supported, isProcessing, isPinSet } = storeToRefs(biometricStore);
const router = useRouter();

const pin = ref('');
const message = ref('');

const canUseBiometric = computed(
  () => supported.value !== false && Boolean(meta.value?.phone)
);

const unlockWithBiometric = async () => {
  message.value = '';
  try {
    await biometricStore.loginWithBiometrics();
    await router.push(ROUTE_NAMES.HOME);
  } catch (error: any) {
    message.value =
      error?.message ?? 'Не получилось войти. Попробуйте ещё раз или введите ПИН.';
  }
};

const unlockWithPin = async () => {
  message.value = '';
  if (!biometricStore.verifyPin(pin.value.trim())) {
    message.value = 'Неверный ПИН. Попробуйте снова.';
    return;
  }
  await router.push(ROUTE_NAMES.HOME);
};

const goToSetup = async () => {
  await router.push(ROUTE_NAMES.SECURE);
};

onMounted(async () => {
  await biometricStore.ensureSupported();
  await biometricStore.loadFromStorage();
  if (!meta.value?.phone && !isPinSet.value) {
    goToSetup();
  }
});
</script>

<template>
  <div class="lock">
    <div class="lock__card">
      <div class="lock__header">
        <h1>Разблокировка</h1>
        <p>Защитили вас: нужен Face ID / отпечаток или ПИН.</p>
      </div>

      <div class="lock__actions">
        <button
          v-if="canUseBiometric"
          class="btn btn--primary"
          type="button"
          :disabled="isProcessing"
          @click="unlockWithBiometric"
        >
          {{ isProcessing ? 'Сканируем...' : 'Войти по биометрии' }}
        </button>

        <div
          v-if="isPinSet"
          class="pin-box"
        >
          <label>Введите ПИН</label>
          <input
            v-model="pin"
            type="password"
            inputmode="numeric"
            pattern="[0-9]*"
            maxlength="6"
            placeholder="••••"
          />
          <button
            class="btn btn--ghost"
            type="button"
            :disabled="pin.length < 4"
            @click="unlockWithPin"
          >
            Войти по ПИН
          </button>
        </div>

        <button
          v-if="!canUseBiometric && !isPinSet"
          class="btn btn--primary"
          type="button"
          @click="goToSetup"
        >
          Настроить защиту
        </button>
      </div>

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
.lock {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: linear-gradient(135deg, #0ea5e9 0%, #312e81 100%);
}

.lock__card {
  width: 100%;
  max-width: 460px;
  background: rgba(255, 255, 255, 0.92);
  border-radius: 20px;
  padding: 24px;
  backdrop-filter: blur(12px);
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.2);
  display: grid;
  gap: 16px;
}

.lock__header {
  h1 {
    margin: 0 0 6px;
  }
  p {
    margin: 0;
    color: #475467;
  }
}

.lock__actions {
  display: grid;
  gap: 12px;
}

.pin-box {
  display: grid;
  gap: 8px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  padding: 12px;
  border-radius: 12px;

  label {
    font-weight: 600;
  }

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
  background: linear-gradient(135deg, #10b981, #14b8a6);
  color: #fff;
}

.btn--ghost {
  background: #f4f6fb;
  color: #1f2937;
}

.hint {
  margin: 0;
  color: #7f1d1d;
}
</style>
