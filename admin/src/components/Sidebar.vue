<script lang="ts" setup>
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
  <aside class="sidebar">
    <div class="brand">
      <div>
        <div class="user-chip">
          <div class="avatar">
            {{ adminName.slice(0, 2).toUpperCase() }}
          </div>
          <div>
            <p style="margin: 0; font-weight: 600">{{ adminName }}</p>
            <p class="muted" style="margin: 2px 0 0">Доступ разрешён</p>
          </div>
          <button @click="onLogout()" class="btn">Выйти</button>
        </div>
      </div>
    </div>

    <nav class="nav">
      <router-link to="/" class="nav__link" active-class="is-active">
        QR Сканер
      </router-link>

      <router-link to="/analytics" class="nav__link" active-class="is-active">
        Аналитика
      </router-link>
    </nav>

    <div class="nav__pill">Доступ только для сотрудников.</div>
  </aside>
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

.sidebar {
  background: linear-gradient(180deg, #0f172a 0%, #0b1021 100%);
  border-right: 1px solid var(--border);
  padding: 32px 28px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}
.brand {
  display: flex;
  align-items: center;
  gap: 12px;
}
.brand__logo {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: linear-gradient(120deg, #7c3aed, #22c55e);
  display: grid;
  place-items: center;
  font-weight: 700;
}
.nav {
  display: grid;
  gap: 10px;
}
.nav__link {
  display: block;
  padding: 12px;
  border-radius: 12px;
  border: 1px solid var(--border);
  background: rgba(255, 255, 255, 0.03);
  color: var(--white);
}
.nav__link.is-active,
.nav__link:hover {
  border-color: var(--primary);
  box-shadow: 0 0 0 1px rgba(124, 58, 237, 0.4);
}
.nav__pill {
  font-size: 12px;
  color: var(--muted);
  padding: 6px;
  border-radius: 10px;
  border: 1px dashed var(--border);
}
</style>
