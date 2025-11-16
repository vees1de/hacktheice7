<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';

import InputComponent from '../input/InputComponent.vue';

interface Option {
  value: string | number;
  text: string;
}

interface Props {
  modelValue: string | number;
  options: Option[];
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  helperText?: string;
}

const props = defineProps<Props>();
const emit = defineEmits(['update:modelValue']);

const isOpen = ref(false);
const dropdownRef = ref<HTMLDivElement | null>(null);

const selectedOption = computed(() => {
  return (
    props.options.find(option => option.value === props.modelValue)?.text || ''
  );
});

const selectOption = (option: Option) => {
  emit('update:modelValue', option.value);
  isOpen.value = false;
};

const handleClickOutside = (event: Event) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    isOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<template>
  <div
    class="dropdown"
    ref="dropdownRef"
  >
    <InputComponent
      :model-value="selectedOption"
      :label="label"
      :placeholder="placeholder"
      :disabled="disabled"
      :error="error"
      :helper-text="helperText"
      @click="isOpen = !isOpen"
      readonly
    />

    <div
      v-if="isOpen"
      class="dropdown-list"
    >
      <div
        v-for="option in options"
        :key="option.value"
        class="dropdown-option"
        @click="selectOption(option)"
      >
        {{ option.text }}
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.dropdown {
  position: relative;
  width: 100%;
}

.dropdown-list {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #d1d5db;
  border-top: none;
  border-radius: 0 0 0.5rem 0.5rem;
  max-height: 200px;
  overflow-y: auto;
  z-index: 1000;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.dropdown-option {
  padding: 0.75rem 1rem;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #f3f4f6;
  }
}
</style>
