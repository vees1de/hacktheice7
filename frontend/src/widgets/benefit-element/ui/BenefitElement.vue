<script lang="ts" setup>
defineProps<{ icon: string; name: string }>();
</script>
<template>
  <div class="benefit-element">
    <img :src="`src/shared/assets/icons/${icon}-icon.svg`" />
    <h5>{{ name }}</h5>
  </div>
</template>
<style lang="scss" scoped>
.benefit-element {
  width: 100%;
  height: 100%;
  background-color: #1a73e8;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border-radius: 10px;
  aspect-ratio: 1 / 1;
  gap: 6px;
  color: #fff;
  font-size: 14px;
  text-align: center;
}
</style>
