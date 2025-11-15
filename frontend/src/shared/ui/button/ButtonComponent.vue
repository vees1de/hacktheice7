<script setup lang="ts">
const emit = defineEmits(['clck']);
</script>

<template>
  <button
    type="button"
    @click="emit('clck')"
  >
    <slot></slot>
  </button>
</template>

<style lang="scss" scoped>
button {
  background-color: #e4e9f5;
  font-size: 1rem;
  font-weight: 500;
  border-radius: 5px;
  width: 100%;
  padding-block: 14px;
  border: none;
}
</style>
