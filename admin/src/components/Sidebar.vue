<template>
  <aside class="sidebar">
    <div class="brand">
      <div class="brand__logo">QR</div>
      <div>
        <div class="brand__name">Admin Desk</div>
        <div class="brand__muted">Проверка клиентов</div>
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
