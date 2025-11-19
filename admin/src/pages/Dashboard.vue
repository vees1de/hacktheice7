<script setup>
import { onMounted, onBeforeUnmount, ref, computed } from "vue";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";

import Sidebar from "../components/Sidebar.vue";
import { authApi } from "../api/auth";
import { useAuthStore } from "../stores/auth";
import { useRouter } from "vue-router";

const auth = useAuthStore();
const router = useRouter();

/* STATE */
const html5Qr = ref(null);
const scanning = ref(false);
const cameras = ref([]);
const selectedCameraId = ref("");
const scannerError = ref("");

const manualToken = ref("");
const lastToken = ref("");
const fetchError = ref("");
const clientLoading = ref(false);
const client = ref(null);

const adminName = computed(() => auth.adminName || "Админ");

/* API */
const resolveClient = async (token) => {
  fetchError.value = "";
  clientLoading.value = true;
  console.log("resolve token -> backend", token);

  try {
    const { data } = await authApi.resolveShareToken(token);
    client.value = data;
  } catch (err) {
    fetchError.value =
      err?.response?.data?.message || "Не удалось получить данные.";
  } finally {
    clientLoading.value = false;
  }
};

/* TOKEN HANDLER */
const handleToken = (text) => {
  const cleaned = text.trim();
  console.log("text", text);
  console.log("TOKEN:", cleaned);

  lastToken.value = cleaned;
  manualToken.value = cleaned;

  resolveClient(cleaned);
};

/* CAMERA LIST */
const loadCameras = async () => {
  try {
    const list = await Html5Qrcode.getCameras();
    cameras.value = list;
    selectedCameraId.value = list[0]?.id || null;
  } catch (e) {
    scannerError.value = "Не удалось получить камеры";
  }
};

/* START SCANNING */
const startScanner = async () => {
  scannerError.value = "";
  client.value = null;
  scanning.value = true;

  if (!html5Qr.value) {
    html5Qr.value = new Html5Qrcode("qr-box", {
      formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
    });
  }

  try {
    await html5Qr.value.start(
      selectedCameraId.value
        ? { deviceId: { exact: selectedCameraId.value } }
        : { facingMode: "environment" },

      { fps: 12, qrbox: { width: 260, height: 260 } },

      (decodedText) => {
        console.log("QR FOUND:", decodedText);
        handleToken(decodedText);
        stopScanner();
      },

      () => {}
    );
  } catch (err) {
    scannerError.value = "Ошибка камеры: " + err?.message;
    scanning.value = false;
  }
};

/* STOP SCANNER */
const stopScanner = () => {
  scanning.value = false;

  if (html5Qr.value) {
    html5Qr.value.stop().catch(() => {});
    html5Qr.value.clear();
  }
};

/* SCAN FROM PHOTO */
const scanFromImage = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  if (!html5Qr.value) {
    html5Qr.value = new Html5Qrcode("qr-box");
  }

  try {
    const result = await html5Qr.value.scanFile(file, true);
    console.log("IMAGE QR:", result);

    handleToken(result);
  } catch (e) {
    scannerError.value = "QR не найден на изображении.";
  }
};

/* LOGOUT */
const logout = () => {
  auth.clearAuth();
  router.push({ name: "Login" });
};

onMounted(loadCameras);
onBeforeUnmount(stopScanner);
</script>
<template>
  <div class="page">
    <Sidebar :admin-name="adminName" :on-logout="logout" />

    <main class="content">
      <div class="grid">
        <!-- СКАНЕР -->
        <section class="card">
          <div class="card__title">
            <span>Сканер QR</span>
            <span class="pill">{{
              scanning ? "Сканирование" : "Ожидание"
            }}</span>
          </div>

          <p class="muted">
            Работает на мобильных устройствах. Можно выбрать фото.
          </p>

          <div class="stack">
            <!-- token input -->
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

            <!-- cameras -->
            <select
              class="input"
              v-if="cameras.length > 1"
              v-model="selectedCameraId"
              :disabled="scanning"
            >
              <option v-for="c in cameras" :key="c.id" :value="c.id">
                {{ c.label }}
              </option>
            </select>

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

              <label class="btn btn--primary upload-btn">
                Сканировать из фото
                <input
                  type="file"
                  accept="image/*"
                  @change="scanFromImage"
                  hidden
                />
              </label>
            </div>

            <!-- QR BOX -->
            <div id="qr-box" class="qr-frame" v-show="scanning">
              <div class="scan-line"></div>
            </div>

            <div v-if="scannerError" class="status status--error">
              {{ scannerError }}
            </div>

            <div class="status">
              Последний токен: <strong>{{ lastToken || "—" }}</strong>
            </div>
          </div>
        </section>

        <!-- CLIENT -->
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
/* Контейнер */
.qr-frame {
  width: 100%;
  max-width: 320px;
  height: 320px;
  margin: 0 auto;
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  border: 3px solid #4f8cff;
  box-shadow: 0 0 15px rgba(79, 140, 255, 0.4);
}

/* Анимационная линия */
.scan-line {
  position: absolute;
  top: 0;
  width: 100%;
  height: 3px;
  background: rgba(79, 140, 255, 0.9);
  animation: scan 2.2s linear infinite;
}

@keyframes scan {
  0% {
    top: 0;
  }
  100% {
    top: 100%;
  }
}

/* upload button */
.upload-btn {
  cursor: pointer;
  display: inline-flex;
  align-items: center;
}

/* Остальные твои стили не трогаю */

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
