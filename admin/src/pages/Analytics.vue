<script setup>
import Sidebar from "@/components/Sidebar.vue";
import HeaderBar from "@/components/HeaderBar.vue";
</script>

<template>
  <div class="page">
    <Sidebar />

    <main class="content">
      <HeaderBar adminName="Admin" />

      <div class="card">
        <h2 style="margin: 0 0 10px">Аналитика</h2>
        <p class="muted">Раздел находится в разработке.</p>
      </div>
    </main>
  </div>
</template>
