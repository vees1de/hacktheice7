<script lang="ts" setup>
defineProps<{ imgSrc: string; name: string }>();
</script>
<template>
  <div class="benefit-element">
    <img :src="imgSrc" />
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
  border-radius: 16px;
}
</style>
