<script setup>
const props = defineProps({
  adminName: {
    type: String,
    default: "Админ",
  },
  onLogout: {
    type: Function,
    default: () => {},
  },
});
</script>

<template>
  <header class="topbar">
    <div>
      <h1>Панель администратора</h1>
      <p>Сканирование QR-токенов и просмотр информации</p>
    </div>

    <div class="user-chip">
      <div class="avatar">
        {{ adminName.slice(0, 2).toUpperCase() }}
      </div>
      <div>
        <p style="margin: 0; font-weight: 600">{{ adminName }}</p>
        <p class="muted" style="margin: 2px 0 0">Доступ разрешён</p>
      </div>
      <button class="btn" @click="onLogout">Выйти</button>
    </div>
  </header>
</template>

<style scoped>
.topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 18px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--border);
}
.avatar {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: #1e293b;
  display: grid;
  place-items: center;
  font-weight: 700;
  border: 1px solid var(--border);
}
.user-chip {
  display: flex;
  align-items: center;
  gap: 10px;
}
</style>
