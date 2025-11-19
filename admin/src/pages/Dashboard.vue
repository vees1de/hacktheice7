<script setup>
import { onMounted, onBeforeUnmount, ref, computed } from "vue";
import { Html5Qrcode } from "html5-qrcode";
import Sidebar from "../components/Sidebar.vue";
import { authApi } from "../api/auth";
import { useAuthStore } from "../stores/auth";
import { useRouter } from "vue-router";

const auth = useAuthStore();
const router = useRouter();

const html5Qr = ref(null);
const scanning = ref(false);
const scannerError = ref("");

const manualToken = ref("");
const lastToken = ref("");
const fetchError = ref("");
const clientLoading = ref(false);
const client = ref(null);

const adminName = computed(() => auth.adminName || "Админ");

const resolveClient = async (token) => {
  fetchError.value = "";
  clientLoading.value = true;

  try {
    const { data } = await authApi.resolveShareToken(token);
    client.value = data;
  } catch (error) {
    fetchError.value =
      error?.response?.data?.message || "Не удалось получить данные.";
  } finally {
    clientLoading.value = false;
  }
};

const handleToken = (tokenText) => {
  const cleaned = tokenText.trim();
  if (!cleaned) return;

  manualToken.value = cleaned;
  lastToken.value = cleaned;
  resolveClient(cleaned);
};

const startScanner = async () => {
  scannerError.value = "";
  client.value = null;
  scanning.value = true;

  if (!html5Qr.value) {
    html5Qr.value = new Html5Qrcode("qr-box"); // контейнер
  }

  try {
    await html5Qr.value.start(
      { facingMode: "environment" },
      {
        fps: 10,
        qrbox: 250,
      },
      (decodedText) => {
        stopScanner();
        handleToken(decodedText);
      },
      (errorMessage) => {
        // ошибки чтения игнорируем
      }
    );
  } catch (err) {
    scannerError.value =
      err?.message || "Не удалось запустить сканер. Проверьте камеру.";
    scanning.value = false;
  }
};

const stopScanner = () => {
  scanning.value = false;
  if (html5Qr.value) {
    html5Qr.value.stop().catch(() => {});
    html5Qr.value.clear();
  }
};

onBeforeUnmount(() => {
  stopScanner();
});

const logout = () => {
  auth.clearAuth();
  router.push({ name: "Login" });
};
</script>

<template>
  <div class="page">
    <Sidebar :admin-name="adminName" :on-logout="logout" />

    <main class="content">
      <div class="grid">
        <section class="card">
          <div class="card__title">
            <span>Сканер QR</span>
            <span class="pill">{{
              scanning ? "Сканирование" : "Ожидание"
            }}</span>
          </div>

          <p class="muted">Работает стабильно на iPhone и Android.</p>

          <div class="stack">
            <div class="token-input">
              <input
                class="input"
                v-model="manualToken"
                placeholder="Хеш токена"
              />
            </div>

            <button class="btn btn--primary" @click="handleToken(manualToken)">
              Запросить
            </button>

            <button
              class="btn btn--primary"
              :disabled="scanning"
              @click="startScanner"
            >
              {{ scanning ? "Камера активна" : "Запустить камеру" }}
            </button>

            <button class="btn" :disabled="!scanning" @click="stopScanner">
              Стоп
            </button>

            <!-- 🔥 html5-qrcode контейнер -->
            <div id="qr-box" class="video-wrap" v-show="scanning"></div>

            <div v-if="scannerError" class="status status--error">
              {{ scannerError }}
            </div>

            <div class="status">
              Последний токен: <strong>{{ lastToken || "—" }}</strong>
            </div>
          </div>
        </section>

        <!-- Данные клиента — твой код без изменений -->
        <section class="card" v-if="client || clientLoading || fetchError">
          <div class="card__title">
            <span>Данные клиента</span>
            <span class="pill">{{ client ? "Готово" : "Ожидание" }}</span>
          </div>

          <div v-if="clientLoading" class="status">Загрузка...</div>
          <div v-else-if="fetchError" class="status status--error">
            {{ fetchError }}
          </div>

          <template v-else-if="client">
            <div class="card-grid">
              <div>
                <p class="muted">ФИО</p>
                <p class="value">{{ client.fullName }}</p>
              </div>
              <div>
                <p class="muted">Телефон</p>
                <p class="value">{{ client.phone }}</p>
              </div>
              <div>
                <p class="muted">Возраст</p>
                <p class="value">{{ client.age }} лет</p>
              </div>
              <div>
                <p class="muted">Регион</p>
                <p class="value">{{ client.region?.name || "—" }}</p>
              </div>
            </div>

            <div class="benefits">
              <p class="muted">Подтвержденные льготы</p>
              <div v-if="!client.benefits?.length" class="status">
                Нет льгот
              </div>
              <div v-else class="stack">
                <div class="chip" v-for="b in client.benefits" :key="b.id">
                  {{ b.title }} ({{ b.code }})
                </div>
              </div>
            </div>
          </template>
        </section>
      </div>
    </main>
  </div>
</template>

<style scoped>
.content {
  padding: 24px;
  display: grid;
  gap: 18px;
}

.grid {
  grid-template-columns: 1.1fr 0.9fr;
  gap: 16px;
  align-items: start;
}

.stack {
  display: grid;
  gap: 12px;
}

#qr-box {
  width: 100%;
  max-width: 350px;
  height: 350px;
  margin: 0 auto;
  border-radius: 12px;
  overflow: hidden;
}

.token-input {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 12px;
  align-items: center;
}

.actions-row {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.value {
  margin: 4px 0 0;
  font-weight: 700;
}

.benefits {
  margin-top: 18px;
}

@media (max-width: 1024px) {
  .page {
    grid-template-columns: 1fr;
  }
  .grid {
    grid-template-columns: 1fr;
  }
}
</style>
