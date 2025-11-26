<script setup lang="ts">
defineProps<{
  open: boolean;
  title?: string;
  description?: string;
  primaryLabel?: string;
  secondaryLabel?: string;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'primary'): void;
}>();

const handleBackdrop = () => emit('close');
const handlePrimary = () => emit('primary');
</script>

<template>
  <teleport to="body">
    <div
      v-if="open"
      class="benefit-modal"
    >
      <div
        class="benefit-modal__backdrop"
        @click="handleBackdrop"
      />
      <div class="benefit-modal__content">
        <h3>{{ title || 'Выберите льготы' }}</h3>
        <p>
          {{
            description ||
            'У вас пока нет выбранных льгот. Расскажите о себе, и мы покажем подходящие.'
          }}
        </p>
        <div class="benefit-modal__actions">
          <button
            class="btn btn--primary"
            type="button"
            @click="handlePrimary"
          >
            {{ primaryLabel || 'Перейти к выбору' }}
          </button>
          <button
            class="btn btn--ghost"
            type="button"
            @click="handleBackdrop"
          >
            {{ secondaryLabel || 'Позже' }}
          </button>
        </div>
      </div>
    </div>
  </teleport>
</template>

<style scoped lang="scss">
.benefit-modal {
  position: fixed;
  inset: 0;
  display: grid;
  place-items: center;
  z-index: 2000;
}

.benefit-modal__backdrop {
  position: absolute;
  inset: 0;
  background: rgba(17, 24, 39, 0.45);
  backdrop-filter: blur(6px);
}

.benefit-modal__content {
  position: relative;
  background: #fff;
  padding: 24px;
  border-radius: 16px;
  max-width: 420px;
  width: calc(100% - 32px);
  box-shadow: 0 18px 48px rgba(0, 0, 0, 0.18);
  display: grid;
  gap: 12px;

  h3 {
    margin: 0;
    font-size: 1.2rem;
  }

  p {
    margin: 0;
    color: #475467;
  }
}

.benefit-modal__actions {
  display: grid;
  gap: 10px;
}

.btn {
  border: none;
  border-radius: 12px;
  padding: 12px 14px;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 0.9;
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
</style>
