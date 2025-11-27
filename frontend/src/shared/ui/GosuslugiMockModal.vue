<script setup lang="ts">
import { reactive, ref, watch } from 'vue';

defineProps<{
  open: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'submit'): void;
}>();

const form = reactive({
  login: '',
  password: ''
});

const isLoading = ref(false);
const isSuccess = ref(false);
let loadingTimer: number | null = null;

const startLoading = () => {
  if (loadingTimer) {
    clearTimeout(loadingTimer);
  }
  isLoading.value = true;
  isSuccess.value = false;
  loadingTimer = window.setTimeout(() => {
    isLoading.value = false;
    isSuccess.value = true;
  }, 3000);
};

const handleSubmit = () => {
  startLoading();
};

// const handleClose = () => {
//   if (loadingTimer) {
//     clearTimeout(loadingTimer);
//   }
//   isLoading.value = false;
//   isSuccess.value = false;
//   emit('close');
// };

watch(
  () => open,
  val => {
    if (!val && loadingTimer) {
      clearTimeout(loadingTimer);
    }
    if (val()) {
      isLoading.value = false;
      isSuccess.value = false;
    }
  }
);
</script>

<template>
  <teleport to="body">
    <div
      v-if="open"
      class="esia-fullscreen"
    >
      <div class="esia-wrapper">
        <div
          v-if="!isSuccess"
          class="esia-card"
        >
          <div class="esia-card__head">
            <div class="esia-card__logo">
              гос<span class="logo-accent">услуги</span>
            </div>
          </div>
          <div class="esia-card__head">
            <div class="esia-card__lang">
              Русский
              <span class="esia-flag"></span>
            </div>
          </div>

          <div class="esia-card__field">
            <label>Телефон / Эл. почта / СНИЛС</label>
            <input
              v-model="form.login"
              type="text"
              placeholder="ivanov@mail.ru"
              :disabled="isLoading"
            />
          </div>

          <div class="esia-card__field">
            <label>Пароль</label>
            <input
              v-model="form.password"
              type="password"
              placeholder="Введите пароль"
              :disabled="isLoading"
            />
            <button
              class="esia-link"
              type="button"
              :disabled="isLoading"
            >
              Восстановить
            </button>
          </div>

          <button
            class="esia-primary"
            type="button"
            :disabled="isLoading"
            @click="handleSubmit"
          >
            <span v-if="isLoading">Проверяем…</span>
            <span v-else>Войти</span>
          </button>

          <button
            class="esia-link esia-link--center"
            type="button"
            :disabled="isLoading"
          >
            Не удаётся войти
          </button>

          <div class="esia-divider"></div>

          <p class="esia-alt-title">
            Войти другим способом. <span class="esia-link">Подробнее</span>
          </p>

          <div class="esia-alt">
            <button
              class="esia-alt__btn"
              type="button"
              :disabled="isLoading"
            >
              QR-код
            </button>
            <button
              class="esia-alt__btn"
              type="button"
              :disabled="isLoading"
            >
              Эл. подпись
            </button>
          </div>
        </div>

        <div
          v-else
          class="esia-card esia-card--success"
        >
          <div class="esia-card__head">
            <div class="esia-card__logo">
              гос<span class="logo-accent">услуги</span>
            </div>
          </div>
          <div class="esia-success">
            <div class="esia-success__icon">
              <img
                src="/assets/icons/account-found.svg"
                alt=""
              />
            </div>
            <h3>Льготы подтверждены!</h3>
            <p>Авторизация прошла, можно продолжать.</p>
            <button
              class="esia-primary"
              type="button"
              @click="emit('submit')"
            >
              Продолжить
            </button>
          </div>
        </div>
      </div>
    </div>
  </teleport>
</template>

<style scoped lang="scss">
.esia-fullscreen {
  position: fixed;
  inset: 0;
  z-index: 2200;
  background: #e8efff;
  display: grid;
  place-items: center;
  padding: 16px;
}

.esia-wrapper {
  width: min(500px, 100%);
}

.esia-card {
  background: #fff;
  border-radius: 22px;
  box-shadow: 0 24px 64px rgba(17, 38, 97, 0.25);
  padding: 28px 28px 26px;
  display: grid;
  gap: 14px;
  border: 1px solid #e4ebff;
}

.esia-card__head {
  display: flex;
  align-items: center;
  justify-content: center;
  padding-bottom: 10px;
}

.esia-card__logo {
  font-weight: 700;
  font-size: 35px;
  color: #1969d2;
  display: flex;
}

.logo-accent {
  color: #e21a59;
}

.esia-card__close {
  border: none;
  position: absolute;
  right: -20px;

  background: #f1f4ff;
  border-radius: 50%;
  width: 34px;
  height: 34px;
  font-size: 18px;
  font-weight: 400;
  cursor: pointer;
}

.esia-card__lang {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  font-weight: 400;
  color: #1f3b68;
  padding: 8px 12px;
  width: fit-content;
}

.esia-flag {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: linear-gradient(#fff 0 33%, #1f56d9 33% 66%, #e7352a 66% 100%);
  border: 1px solid #d8e2ff;
}

.esia-card__field {
  display: grid;
  gap: 6px;
  color: #1f3b68;
  font-weight: 400;
}

.esia-card__field input {
  border: 1px solid #e2e7f5;
  background: #f9fafe;
  border-radius: 12px;
  padding: 12px;
  font-size: 15px;
  color: #1f3b68;
}

.esia-link {
  border: none;
  background: transparent;
  color: #1969d2;
  font-weight: 400;
  cursor: pointer;
  padding: 0;
  text-align: left;
}

.esia-link--center {
  text-align: center;
}

.esia-primary {
  width: 100%;
  background: #0c57d6;
  color: #fff;
  border: none;
  border-radius: 12px;
  padding: 14px;
  font-weight: 400;
  font-size: 15px;
  cursor: pointer;
  box-shadow: 0 12px 28px rgba(12, 87, 214, 0.35);
}

.esia-primary:active {
  transform: translateY(1px);
}

.esia-primary:disabled,
.esia-link:disabled,
.esia-alt__btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.esia-divider {
  height: 1px;
  background: #e4ebff;
  margin-top: 6px;
}

.esia-alt-title {
  margin: 0;
  color: #1f3b68;
  font-weight: 300;
}

.esia-alt {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.esia-alt__btn {
  border: 2px solid #0c57d6;
  color: #0c57d6;
  border-radius: 12px;
  padding: 12px;
  font-weight: 400;
  background: #f9fbff;
  cursor: pointer;
}

.esia-card--success {
  padding: 32px;
}

.esia-success {
  display: grid;
  gap: 12px;
  justify-items: center;
  text-align: center;
  padding: 12px 0 6px;

  h3 {
    font-size: 24px;
    font-weight: 500;
  }
}

.esia-success__icon {
  img {
    width: 100px;
    height: 100px;
  }
}

@media (max-width: 540px) {
  .esia-wrapper {
    width: 100%;
  }

  .esia-card {
    border-radius: 14px;
  }
}
</style>
