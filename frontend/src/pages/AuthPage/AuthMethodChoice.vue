<script setup lang="ts">
const emit = defineEmits<{
  (e: 'select-sms'): void;
  (e: 'select-sber'): void;
}>();
</script>

<template>
  <div class="choice">
    <div class="cards">
      <button
        type="button"
        class="card card--sms"
        @click="emit('select-sms')"
      >
        <img
          src="@shared/assets/icons/square-arrow-right.svg"
          alt="SMS"
        />

        <span class="card__text">
          <span>Войти</span>
          <span>по телефону</span>
        </span>
      </button>
      <button
        type="button"
        class="card card--sber"
        @click="emit('select-sber')"
      >
        <img
          src="@shared/assets/icons/sber.svg"
          alt="Sber"
        />

        <span class="card__text">
          <span>Войти</span>
          <span>по Сбер ID</span>
        </span>
      </button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.choice {
  display: flex;

  flex: 1;
  width: 100%;
  align-items: flex-end;
}

.cards {
  display: flex;
  width: 100%;
  gap: 6px;
}

.card {
  border: none;
  border-radius: 24px;
  padding: 18px 14px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-start;
  font-size: 1.5rem;
  font-weight: 600;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 30px rgba(31, 112, 245, 0.25);
  }
}

.card--sms {
  flex: 2;
  background: #1a73e8;
  color: #fff;
  max-height: 128px;
}

.card--sber {
  flex: 1;
  aspect-ratio: 1/1;
  background: #dae9ff;
  color: #111827;
  max-height: 128px;
}

.card__icon {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 32px;

  img {
    width: 18.75px;
    height: 19px;
  }
}

.card__text {
  display: flex;
  flex-direction: column;
  font-size: 0.875rem;
  font-weight: 400;

  span {
    text-align: left;
  }
}
</style>
