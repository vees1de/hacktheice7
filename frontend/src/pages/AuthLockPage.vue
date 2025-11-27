<script setup lang="ts">
import { useAuthStore, useBiometricStore } from '@entities/auth';
import { useUserStore } from '@entities/user';
import { ROUTE_NAMES } from '@shared/model/routes.constants';
import { storeToRefs } from 'pinia';
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

const biometricStore = useBiometricStore();
const authStore = useAuthStore();
const userStore = useUserStore();
const { meta, supported, isPinSet } = storeToRefs(biometricStore);
const { user } = storeToRefs(userStore);
const router = useRouter();

const pin = ref(''); // max 4 digits
const message = ref('');
const showLogout = ref(false);

const canUseBiometric = computed(
  () => supported.value !== false && Boolean(meta.value?.phone)
);

const accountName = computed(() => {
  if (meta.value?.displayName) {
    return meta.value.displayName;
  }

  const hasUser = Boolean(user.value?.id);
  const userFullName = hasUser
    ? [user.value?.firstName, user.value?.lastName].filter(Boolean).join(' ')
    : '';

  if (userFullName) {
    return userFullName;
  }

  if (meta.value?.phone) {
    return `+${meta.value.phone}`;
  }

  if (hasUser && user.value?.phone) {
    return `+${user.value.phone}`;
  }

  return 'Профиль';
});

const toggleLogout = () => {
  showLogout.value = !showLogout.value;
};

const logout = async () => {
  showLogout.value = false;
  await authStore.logout();
};

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
    <div class="lock__header">
      <div class="account-wrap">
        <div
          class="account"
          type="button"
          @click="toggleLogout"
        >
          <div class="lock__logo">
            <img
              src="/assets/icons/lasso-icon.svg"
              alt="Логотип LASSO"
            />
          </div>
          <span class="account__name">{{ accountName }}</span>
        </div>
        <button
          v-if="showLogout"
          class="logout"
          type="button"
          @click="logout"
        >
          <img
            src="/assets/icons/exit-icon.svg"
            alt=""
          />
          Выйти
        </button>
      </div>
    </div>

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
        v-if="true"
        class="biometric"
        @click="unlockWithBiometric"
      >
        <img
          src="/assets/images/faceid.png"
          alt=""
        />
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
  min-height: calc(100dvh - var(--menu-heigth));
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.lock__header {
  position: relative;
  min-height: 88px;
  padding: 12px 0px;
}

.account-wrap {
  top: 0;
  left: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
}

.account {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border-radius: 14px;
  margin-left: 10px;
  margin-top: 15px;
  color: #0f172a;
  font-weight: 500;

  cursor: pointer;
  transition:
    background 0.15s ease,
    border-color 0.15s ease;

  &:active {
    background: #e2e8f0;
    border-color: #cbd5e1;
  }
}

.account__name {
  max-width: 160px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: left;
}

.account__caret {
  width: 18px;
  height: 18px;
  transform: rotate(90deg);
}

.logout {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #fee2e2;
  color: #b91c1c;
  border: 1px solid #fecdd3;
  border-radius: 12px;
  font-weight: 500;
  cursor: pointer;
  transition:
    background 0.15s ease,
    transform 0.15s ease;

  &:active {
    background: #fecdd3;
    transform: translateY(1px);
  }

  img {
    width: 18px;
    height: 18px;
  }
}

.lock__logo {
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;

  img {
    width: 30px;
    height: 30px;
  }
}

.lock__top {
  text-align: center;
  margin-top: 30px;
  padding-top: 12px;

  .title {
    margin: 0;
    font-size: 16px;
    font-weight: 400;
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
  padding: 0 40px;
  margin-top: 80px;

  button {
    background: #f1f5f9;
    border: none;
    border-radius: 999px;
    height: 70px;
    font-size: 28px;
    font-weight: 500;
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

    background-color: transparent;

    img {
      width: 40px;
      height: 40px;
    }

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
