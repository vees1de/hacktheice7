<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    type?: 'button' | 'submit' | 'reset';
    loading?: boolean;
    disabled?: boolean;
    kind?: 'primary' | 'secondary';
  }>(),
  {
    type: 'button',
    loading: false,
    disabled: false,
    kind: 'primary'
  }
);

const emit = defineEmits<{
  (e: 'click', event: MouseEvent): void;
}>();

const classes = computed(() => [
  'btn',
  props.kind === 'secondary' ? 'btn--secondary' : 'btn--primary',
  props.loading ? 'is-loading' : ''
]);

const handleClick = (event: MouseEvent) => {
  if (props.disabled || props.loading) return;
  emit('click', event);
};
</script>

<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :class="classes"
    @click="handleClick"
  >
    <span
      v-if="loading"
      class="spinner"
    />
    <slot />
  </button>
</template>

<style lang="scss" scoped>
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 12px 14px;
  border-radius: 8px;
  border: none;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: 150ms ease;
}

.btn--primary {
  background-color: var(--btn-primary-bg);
  color: var(--btn-primary-text);
}

.btn--secondary {
  background-color: var(--btn-secondary-bg);
  color: var(--btn-secondary-text);
}

.btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.spinner {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.4);
  border-top-color: #fff;
  animation: spin 0.8s linear infinite;
}

.btn--secondary .spinner {
  border-color: rgba(15, 23, 42, 0.25);
  border-top-color: #0f172a;
}

.is-loading {
  opacity: 0.9;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
