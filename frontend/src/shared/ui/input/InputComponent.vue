<script setup lang="ts">
interface Props {
  modelValue: string | number;
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'date';
  error?: string;
  helperText?: string;
}

defineProps<Props>();

const emit = defineEmits(['update:modelValue']);

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  emit('update:modelValue', target.value);
};
</script>

<template>
  <div class="input-container">
    <label
      v-if="label"
      :for="label"
      class="input-label"
    >
      {{ label }}
      <span
        v-if="required"
        class="required-asterisk"
        aria-hidden="true"
        >*</span
      >
    </label>

    <input
      :id="label"
      :value="modelValue"
      :type="type || 'text'"
      :placeholder="''"
      :required="required"
      :disabled="disabled"
      :aria-required="required"
      :aria-invalid="!!error"
      :aria-describedby="
        error ? `${label}-error` : helperText ? `${label}-helper` : undefined
      "
      @input="handleInput"
      class="custom-input"
      :class="{ 'date-input': type === 'date' }"
    />

    <div
      v-if="helperText && !error"
      :id="`${label}-helper`"
      class="helper-text"
    >
      {{ helperText }}
    </div>

    <div
      v-if="error"
      :id="`${label}-error`"
      class="error-message"
      role="alert"
    >
      {{ error }}
    </div>
  </div>
</template>

<style lang="scss" scoped>
.input-container {
  display: flex;
  flex-direction: column;
  margin-bottom: 1rem;
  width: 100%;
}

.input-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  font-weight: 600;
  font-size: 0.875rem;
  line-height: 1.25rem;
}

.required-asterisk {
  color: #ef4444;
  margin-left: 0.25rem;
}

.custom-input {
  width: 100%;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  line-height: 1.5;
  color: #111827;
  background-color: #ffffff;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  transition: all 0.2s ease-in-out;
  outline: none;

  &::placeholder {
    color: #9ca3af;
  }

  &:hover {
    border-color: #9ca3af;
  }

  &:focus {
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  &:disabled {
    background-color: #f9fafb;
    color: #6b7280;
    cursor: not-allowed;

    &:hover {
      border-color: #d1d5db;
    }
  }

  &[aria-invalid='true'] {
    border-color: #ef4444;

    &:focus {
      border-color: #ef4444;
      box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
    }
  }

  &.date-input {
    // Специфичные стили для date input
    min-height: 3rem;

    // Для браузеров, которые поддерживают webkit календари
    &::-webkit-calendar-picker-indicator {
      cursor: pointer;
      padding: 0.25rem;
      border-radius: 0.25rem;
      margin-right: 0.25rem;

      &:hover {
        background-color: #f3f4f6;
      }
    }

    // Для Firefox
    &::-moz-focus-inner {
      border: 0;
    }
  }
}

.helper-text {
  margin-top: 0.5rem;
  font-size: 0.75rem;
  line-height: 1rem;
  color: #6b7280;
}

.error-message {
  margin-top: 0.5rem;
  font-size: 0.75rem;
  line-height: 1rem;
  color: #ef4444;
  font-weight: 500;
}
</style>
