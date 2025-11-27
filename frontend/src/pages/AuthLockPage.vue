<script setup lang="ts">
import { useBiometricStore } from '@entities/auth';
import { ROUTE_NAMES } from '@shared/model/routes.constants';
import { storeToRefs } from 'pinia';
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

const biometricStore = useBiometricStore();
const { meta, supported, isPinSet } = storeToRefs(biometricStore);
const router = useRouter();

const pin = ref(''); // max 4 digits
const message = ref('');

const canUseBiometric = computed(
  () => supported.value !== false && Boolean(meta.value?.phone)
);

const unlockWithBiometric = async () => {
  message.value = '';
  try {
    await biometricStore.loginWithBiometrics();
    await router.push(ROUTE_NAMES.HOME);
  } catch (err: any) {
    message.value = err?.message ?? 'Ошибка биометрии';
  }
};

const handleDigit = (d: string) => {
  if (pin.value.length >= 4) return;
  pin.value += d;

  if (pin.value.length === 4) {
    unlockWithPin();
  }
};

const handleDelete = () => {
  pin.value = pin.value.slice(0, -1);
};

const unlockWithPin = async () => {
  message.value = '';
  if (!biometricStore.verifyPin(pin.value)) {
    message.value = 'Неверный ПИН';
    pin.value = '';
    return;
  }
  await router.push(ROUTE_NAMES.HOME);
};

onMounted(async () => {
  await biometricStore.ensureSupported();
  await biometricStore.loadFromStorage();

  // if (!meta.value?.phone && !isPinSet.value) {
  //   router.push(ROUTE_NAMES.SECURE);
  // }
});
</script>

<template>
  <div class="lock">
    <div class="lock__top">
      <p class="title">Введите код</p>

      <!-- ПИН точки -->
      <div class="pin-dots">
        <div
          v-for="i in 4"
          :key="i"
          :class="['dot', { filled: i <= pin.length }]"
        ></div>
      </div>

      <p
        class="hint"
        v-if="message"
      >
        {{ message }}
      </p>
    </div>

    <!-- Цифровая клавиатура -->
    <div class="numpad">
      <button
        v-for="n in ['1', '2', '3', '4', '5', '6', '7', '8', '9']"
        :key="n"
        @click="handleDigit(n)"
      >
        {{ n }}
      </button>

      <!-- Биометрия -->
      <button
        v-if="canUseBiometric"
        class="biometric"
        @click="unlockWithBiometric"
      >
        🔒
      </button>
      <div
        v-else
        class="empty"
      ></div>

      <button @click="handleDigit('0')">0</button>

      <!-- Delete -->
      <button
        class="delete"
        @click="handleDelete"
      >
        ⌫
      </button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.lock {
  height: calc(100dvh - 108px);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 32px 20px;
}

.lock__top {
  text-align: center;
  margin-top: 20px;

  .title {
    margin: 0;
    font-size: 22px;
    font-weight: 700;
    color: #1e293b;
  }

  .hint {
    margin-top: 12px;
    color: #b91c1c;
    font-size: 15px;
  }
}

.pin-dots {
  margin: 24px auto 0;
  display: flex;
  gap: 16px;
  justify-content: center;

  .dot {
    width: 16px;
    height: 16px;
    border-radius: 100px;
    border: 2px solid #cbd5e1;
    background: transparent;

    &.filled {
      background: #0f172a;
      border-color: #0f172a;
    }
  }
}

.numpad {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 18px;
  padding-bottom: 40px;

  button {
    background: #f1f5f9;
    border: none;
    border-radius: 999px;
    height: 70px;
    font-size: 28px;
    font-weight: 600;
    color: #0f172a;
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: 0;
    cursor: pointer;
    transition: 0.15s;

    &:active {
      background: #e2e8f0;
      transform: scale(0.95);
    }
  }

  .biometric {
    font-size: 34px;
    background: #10b981;
    color: #fff !important;

    &:active {
      background: #059669;
    }
  }

  .delete {
    font-size: 26px;
  }

  .empty {
    visibility: hidden;
  }
}
</style>
