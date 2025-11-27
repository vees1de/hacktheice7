<script setup lang="ts">
import { reactive } from 'vue';

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

const handleSubmit = () => emit('submit');
const handleClose = () => emit('close');
</script>

<template>
  <teleport to="body">
    <div
      v-if="open"
      class="esia-fullscreen"
    >
      <div class="esia-wrapper">
        <div class="esia-card">
          <div class="esia-card__head">
            <div class="esia-card__logo">
              гос<span class="logo-accent">услуги</span>
            </div>
            <button
              class="esia-card__close"
              type="button"
              @click="handleClose"
            >
              ×
            </button>
          </div>
          <div class="esia-card__lang">
            Русский
            <span class="esia-flag"></span>
          </div>

          <div class="esia-card__field">
            <label>Телефон / Эл. почта / СНИЛС</label>
            <input
              v-model="form.login"
              type="text"
              placeholder="example@domain.ru"
            />
          </div>

          <div class="esia-card__field">
            <label>Пароль</label>
            <input
              v-model="form.password"
              type="password"
              placeholder="Введите пароль"
            />
            <button
              class="esia-link"
              type="button"
            >
              Восстановить
            </button>
          </div>

          <button
            class="esia-primary"
            type="button"
            @click="handleSubmit"
          >
            Войти
          </button>

          <button
            class="esia-link esia-link--center"
            type="button"
          >
            Не удаётся войти
          </button>

          <div class="esia-divider"></div>

          <p class="esia-alt-title">Войти другим способом. <span class="esia-link">Подробнее</span></p>

          <div class="esia-alt">
            <button
              class="esia-alt__btn"
              type="button"
            >
              QR-код
            </button>
            <button
              class="esia-alt__btn"
              type="button"
            >
              Эл. подпись
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
  padding: 22px 22px 20px;
  display: grid;
  gap: 14px;
  border: 1px solid #e4ebff;
}

.esia-card__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.esia-card__logo {
  font-weight: 900;
  font-size: 24px;
  color: #1969d2;
}

.logo-accent {
  color: #e21a59;
}

.esia-card__close {
  border: none;
  background: #f1f4ff;
  border-radius: 12px;
  width: 34px;
  height: 34px;
  font-size: 18px;
  font-weight: 700;
  cursor: pointer;
}

.esia-card__lang {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-weight: 700;
  color: #1f3b68;
  border: 1px solid #e4ebff;
  border-radius: 999px;
  padding: 8px 12px;
  width: fit-content;
}

.esia-flag {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: linear-gradient(#1f56d9 0 33%, #fff 33% 66%, #e7352a 66% 100%);
  border: 1px solid #d8e2ff;
}

.esia-card__field {
  display: grid;
  gap: 6px;
  color: #1f3b68;
  font-weight: 700;
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
  font-weight: 700;
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
  font-weight: 800;
  font-size: 15px;
  cursor: pointer;
  box-shadow: 0 12px 28px rgba(12, 87, 214, 0.35);
}

.esia-primary:active {
  transform: translateY(1px);
}

.esia-divider {
  height: 1px;
  background: #e4ebff;
  margin-top: 6px;
}

.esia-alt-title {
  margin: 0;
  color: #1f3b68;
  font-weight: 700;
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
  font-weight: 800;
  background: #f9fbff;
  cursor: pointer;
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
