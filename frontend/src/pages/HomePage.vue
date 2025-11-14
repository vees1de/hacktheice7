<script setup lang="ts">
import { storeToRefs } from 'pinia';

import { useLangStore } from '../stores/language.store';

const langStore = useLangStore();
const { change } = langStore;
const { t } = storeToRefs(langStore);
</script>

<template>
  {{ t['title'] }}
  <button @click="change()">asdasd</button>
</template>

<style scoped></style>
