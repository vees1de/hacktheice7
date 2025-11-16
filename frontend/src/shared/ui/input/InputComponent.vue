<script setup lang="ts">
import { computed, ref } from 'vue';

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

const props = defineProps<Props>();

const emit = defineEmits(['update:modelValue']);

const isPasswordVisible = ref(false);

const inputType = computed(() => {
  if (props.type !== 'password') {
    return props.type || 'text';
  }
  return isPasswordVisible.value ? 'text' : 'password';
});

const togglePasswordVisibility = () => {
  if (props.type === 'password') {
    isPasswordVisible.value = !isPasswordVisible.value;
  }
};

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

    <div class="input-wrapper">
      <input
        :id="label"
        :value="modelValue"
        :type="inputType"
        :placeholder="placeholder"
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
        class="input-icon"
        @click="togglePasswordVisibility"
        v-if="type === 'password'"
      >
        <!-- Иконка глаза будет здесь -->
        <img
          :src="
            isPasswordVisible
              ? 'src/shared/assets/icons/russia-icon.svg'
              : 'src/shared/assets/icons/sale-icon.svg'
          "
          :alt="isPasswordVisible ? 'Скрыть пароль' : 'Показать пароль'"
        />
      </div>
    </div>

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

.input-wrapper {
  position: relative;
  display: inline-block;
}

.input-icon {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  img {
    width: 16px;
    height: 16px;
    object-fit: contain;
  }
}

.custom-input {
  width: 100%;
  padding: 0.75rem 2.5rem 0.75rem 1rem; // увеличен правый отступ для иконки
  font-size: 1rem;
  line-height: 1.5;
  color: #111827;
  background-color: #f2f7fe;
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
    border-color: #96bae6;
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
