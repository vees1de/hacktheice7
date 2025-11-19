<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { authApi } from "../api/auth";
import { useAuthStore } from "../stores/auth";

const router = useRouter();
const auth = useAuthStore();

const phone = ref("+7");
const password = ref("");
const error = ref("");
const loading = ref(false);

const login = async () => {
  error.value = "";
  loading.value = true;
  try {
    const { data } = await authApi.login({
      phone: phone.value.trim(),
      password: password.value,
    });
    if (data.user.staffProfile.role !== "Admin") {
      auth.setAuth(data.accessToken, data.user?.firstName || "Админ");
      router.push("/");
    } else {
      throw "Не удалось войти";
    }
  } catch (e) {
    error.value = e?.response?.data?.message || "Не удалось войти";
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="login-layout">
    <div class="hero">
      <div class="badge">QR Control</div>
      <h1>Панель кассира</h1>
      <p>Сканируйте QR-токен клиента и мгновенно получайте его льготы.</p>
      test: +79990000000
    </div>

    <div class="card login-card">
      <div class="login-header">
        <div>
          <p class="title">Вход для сотрудников</p>
          <p class="muted">Используйте телефон и пароль из сидов или CRM.</p>
        </div>
      </div>

      <div class="form">
        <label class="label">
          Телефон
          <input class="input" v-model="phone" placeholder="+7 999 ..." />
        </label>
        <label class="label">
          Пароль
          <input
            class="input"
            v-model="password"
            type="password"
            placeholder="••••••"
            @keyup.enter="login"
          />
        </label>
        <button class="btn btn--primary" :disabled="loading" @click="login">
          {{ loading ? "Входим..." : "Войти" }}
        </button>
        <p v-if="error" class="status status--error">{{ error }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-layout {
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 32px;
  align-items: center;
  padding: 60px 80px;
  background: radial-gradient(
      circle at 20% 20%,
      rgba(124, 58, 237, 0.2),
      transparent 30%
    ),
    radial-gradient(circle at 80% 0, rgba(34, 197, 94, 0.18), transparent 25%),
    #0b1021;
}

.hero h1 {
  margin: 12px 0 8px;
  font-size: 42px;
}
.hero p {
  margin: 0;
  color: var(--muted);
  max-width: 480px;
  line-height: 1.4;
}
.badge {
  display: inline-flex;
  padding: 8px 12px;
  border-radius: 999px;
  background: rgba(124, 58, 237, 0.12);
  border: 1px solid rgba(124, 58, 237, 0.4);
  color: var(--white);
  font-weight: 600;
}

.login-card {
  padding: 28px;
  border: 1px solid var(--border);
  background: linear-gradient(
    145deg,
    rgba(255, 255, 255, 0.03),
    rgba(255, 255, 255, 0.02)
  );
  border-radius: 18px;
  box-shadow: 0 25px 70px rgba(0, 0, 0, 0.35);
}

.login-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.title {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
}
.muted {
  margin: 4px 0 0;
  color: var(--muted);
}

.form {
  display: grid;
  gap: 14px;
}

.label {
  display: grid;
  gap: 6px;
  color: var(--white);
  font-weight: 600;
}

@media (max-width: 1024px) {
  .login-layout {
    grid-template-columns: 1fr;
    padding: 40px 20px;
  }
}
</style>
