<script setup lang="ts">
import { apiRequest } from '@shared/api/http.client';
import { onMounted } from 'vue';

onMounted(() => {
  apiRequest('as').catch(v => console.log(v));
});
</script>
<template>Аккаунт</template>
