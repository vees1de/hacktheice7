<script setup lang="ts">
import { effect, ref } from 'vue';

const emit = defineEmits(['success', 'fail']);

const handleBackspace = (index: number, e: KeyboardEvent) => {
  if (e.key === 'Backspace' && !codeDigits.value[index] && index > 0) {
    const prev = document.getElementById(`digit-${index - 1}`);
    codeDigits.value[index - 1] = '';
    prev?.focus();
  }
};

const codeDigits = ref(['', '', '', '']);

effect(() => {
  const isOk = codeDigits.value.every(d => d.length === 1);
  const code = codeDigits.value.join('');
  isOk ? emit('success', code) : emit('fail');
});

const handleDigitInput = (index: number, e: Event) => {
  const target = e.target as HTMLInputElement;
  let value = target.value.replace(/\D/g, ''); // только цифры

  if (value.length > 1) value = value[0];
  codeDigits.value[index] = value;

  // переход вперёд
  if (value && index < 3) {
    const next = document.getElementById(`digit-${index + 1}`);
    next?.focus();
  }
};
</script>
<template>
  <div class="code-inputs">
    <input
      v-for="(_digit, i) in codeDigits"
      :key="i"
      :id="`digit-${i}`"
      class="code-box"
      type="text"
      inputmode="numeric"
      maxlength="1"
      v-model="codeDigits[i]"
      @input="e => handleDigitInput(i, e)"
      @keydown="e => handleBackspace(i, e)"
    />
  </div>
</template>
<style lang="scss" scoped>
.code-wrapper {
  display: flex;
  justify-content: center;
}

.code-inputs {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.code-box {
  width: 56px;
  height: 64px;
  font-size: 2rem;
  font-weight: 600;
  text-align: center;
  border-radius: 12px;
  border: 1.5px solid #d0d5dd;
  outline: none;
  transition: 0.2s border;

  &:focus {
    border-color: #1a73e8;
  }
}
</style>
