<script setup>
import { computed, onBeforeUnmount, ref } from "vue";
import { BrowserQRCodeReader } from "@zxing/browser";
import Sidebar from "../components/Sidebar.vue";
import { authApi } from "../api/auth";
import { useAuthStore } from "../stores/auth";
import { useRouter } from "vue-router";

const auth = useAuthStore();
const router = useRouter();

const videoRef = ref(null);
const scanning = ref(false);
const scannerError = ref("");
const devices = ref([]);
const selectedDeviceId = ref("");
const qrReader = ref(null);

const manualToken = ref("");
const lastToken = ref("");
const fetchError = ref("");
const clientLoading = ref(false);
const client = ref(null);

const adminName = computed(() => auth.adminName || "Админ");

const startScanner = async () => {
  scannerError.value = "";
  fetchError.value = "";
  client.value = null;

  try {
    const available = await BrowserQRCodeReader.listVideoInputDevices();
    devices.value = available;
    selectedDeviceId.value = selectedDeviceId.value || available[0]?.deviceId;

    if (!selectedDeviceId.value) {
      scannerError.value = "Камера не найдена.";
      return;
    }

    qrReader.value = new BrowserQRCodeReader();
    scanning.value = true;

    qrReader.value.decodeFromVideoDevice(
      selectedDeviceId.value,
      videoRef.value,
      (result, err) => {
        if (result) {
          stopScanner();
          handleToken(result.getText());
        }
        if (err && !err.message?.includes("No MultiFormat Readers")) {
          scannerError.value = "Ошибка при считывании QR.";
        }
      }
    );
  } catch (error) {
    scannerError.value =
      error?.message || "Ошибка инициализации камеры. Проверьте доступ.";
  }
};

const stopScanner = () => {
  scanning.value = false;
  if (qrReader.value) {
    qrReader.value.reset();
    qrReader.value = null;
  }
};

onBeforeUnmount(() => stopScanner());

const handleToken = (tokenText) => {
  const cleaned = tokenText?.trim();
  if (!cleaned) {
    fetchError.value = "Пустой токен.";
    return;
  }
  manualToken.value = cleaned;
  lastToken.value = cleaned;
  resolveClient(cleaned);
};

const resolveClient = async (token) => {
  fetchError.value = "";
  clientLoading.value = true;
  client.value = null;

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
          <p class="muted">
            Запустите камеру или вставьте токен вручную. После успешного
            считывания карточка с данными клиента появится справа.
          </p>

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

            <div class="stack">
              <div class="actions-row">
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

                <select
                  class="input"
                  style="max-width: 220px"
                  v-model="selectedDeviceId"
                  :disabled="scanning"
                >
                  <option disabled value="">Выберите камеру</option>
                  <option
                    v-for="d in devices"
                    :key="d.deviceId"
                    :value="d.deviceId"
                  >
                    {{ d.label || "Камера" }}
                  </option>
                </select>
              </div>

              <div class="video-wrap" v-if="scanning">
                <video ref="videoRef" autoplay muted playsinline></video>
              </div>

              <div v-if="scannerError" class="status status--error">
                {{ scannerError }}
              </div>
            </div>

            <div class="status">
              Последний токен: <strong>{{ lastToken || "—" }}</strong>
            </div>
          </div>
        </section>

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
