<script setup>
import { computed, onBeforeUnmount, ref } from "vue";
import { BrowserQRCodeReader } from "@zxing/browser";
import { authApi } from "./api";

const phone = ref("+7");
const password = ref("");
const adminName = ref("Admin");
const loginError = ref("");
const loginLoading = ref(false);
const accessToken = ref(localStorage.getItem("adminAccessToken") || "");

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

const isAuthed = computed(() => Boolean(accessToken.value));

const setAuth = (token, user) => {
  accessToken.value = token;
  localStorage.setItem("adminAccessToken", token);
  adminName.value = user?.firstName
    ? `${user.firstName} ${user.lastName ?? ""}`.trim()
    : "Admin";
};

const logout = () => {
  accessToken.value = "";
  localStorage.removeItem("adminAccessToken");
};

const login = async () => {
  loginError.value = "";
  loginLoading.value = true;
  try {
    const { data } = await authApi.login({
      phone: phone.value.trim(),
      password: password.value,
    });
    setAuth(data.accessToken, data.user);
  } catch (error) {
    loginError.value =
      error?.response?.data?.message || "Не удалось войти. Проверьте данные.";
  } finally {
    loginLoading.value = false;
  }
};

const stopScanner = () => {
  scanning.value = false;
  if (qrReader.value) {
    qrReader.value.reset();
    qrReader.value = null;
  }
};

const startScanner = async () => {
  scannerError.value = "";
  fetchError.value = "";
  client.value = null;
  lastToken.value = "";

  try {
    const available = await BrowserQRCodeReader.listVideoInputDevices();
    devices.value = available;
    selectedDeviceId.value =
      selectedDeviceId.value || available[0]?.deviceId || "";

    if (!selectedDeviceId.value) {
      scannerError.value =
        "Камера не найдена. Подключите устройство или выберите вручную.";
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
        if (
          err &&
          !err.message?.includes(
            "No MultiFormat Readers were able to detect the code"
          )
        ) {
          scannerError.value = "Не удалось распознать QR. Попробуйте снова.";
        }
      }
    );
  } catch (error) {
    scannerError.value =
      error?.message ||
      "Не удалось инициализировать камеру. Проверьте разрешения.";
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

const resolveClient = async (tokenValue) => {
  fetchError.value = "";
  clientLoading.value = true;
  client.value = null;
  try {
    const { data } = await authApi.resolveShareToken(tokenValue);
    client.value = data;
  } catch (error) {
    fetchError.value =
      error?.response?.data?.message || "Не удалось получить данные по токену.";
  } finally {
    clientLoading.value = false;
  }
};
</script>

<template>
  <div class="page">
    <aside class="sidebar">
      <div class="brand">
        <div class="brand__logo">QR</div>
        <div>
          <div class="brand__name">Admin Desk</div>
          <div class="brand__muted">Проверка клиентов</div>
        </div>
      </div>

      <div class="nav">
        <button class="nav__link is-active">
          <span>QR сканер</span>
        </button>
        <button class="nav__link" disabled>
          <span>Аналитика</span>
        </button>
      </div>

      <div class="nav__pill">
        Доступ только для сотрудников. Авторизуйтесь, чтобы сканировать QR-коды
        клиентов и смотреть их льготы.
      </div>
    </aside>

    <main class="content">
      <header class="topbar">
        <div>
          <h1>Панель администратора</h1>
          <p>Сканирование QR-токена и быстрый просмотр сведений о клиенте.</p>
        </div>
        <div class="user-chip">
          <div class="avatar">
            {{ adminName.slice(0, 2).toUpperCase() }}
          </div>
          <div>
            <p style="margin: 0; font-weight: 600">
              {{ isAuthed ? adminName : "Гость" }}
            </p>
            <p class="muted" style="margin: 2px 0 0">
              {{ isAuthed ? "Доступ разрешён" : "Нужна авторизация" }}
            </p>
          </div>
        </div>
      </header>

      <div class="card-grid">
        <section class="card">
          <div class="card__title">
            <span>Вход</span>
            <span class="pill">Телефон + пароль</span>
          </div>
          <p class="card__muted">
            Укажите учётку администратора/кассира. Токен сохранится в
            localStorage.
          </p>

          <div class="form" @submit.prevent>
            <label class="label">
              <span>Телефон</span>
              <input
                class="input"
                v-model="phone"
                type="text"
                placeholder="+7 900 000-00-00"
              />
            </label>

            <label class="label">
              <span>Пароль</span>
              <input
                class="input"
                v-model="password"
                type="password"
                placeholder="•••••••"
              />
            </label>

            <div style="display: flex; gap: 10px; align-items: center">
              <button
                class="btn btn--primary"
                :disabled="loginLoading"
                @click="login"
              >
                {{ loginLoading ? "Входим..." : "Войти" }}
              </button>
              <button class="btn" type="button" v-if="isAuthed" @click="logout">
                Выйти
              </button>
            </div>

            <div v-if="loginError" class="status status--error">
              {{ loginError }}
            </div>
            <div v-else-if="isAuthed" class="status status--success">
              Авторизация активна. Токен сохранён в localStorage.
            </div>
          </div>
        </section>

        <section class="card">
          <div class="card__title">
            <span>Сканер QR</span>
            <span class="pill">{{
              scanning ? "Сканирование..." : "Ожидание"
            }}</span>
          </div>
          <p class="card__muted">
            Наведите камеру на QR-код клиента или вставьте токен вручную.
          </p>

          <div class="stack">
            <div class="token-input">
              <input
                class="input"
                v-model="manualToken"
                placeholder="Хеш-токен клиента"
              />
              <button
                class="btn btn--primary"
                :disabled="!manualToken || clientLoading"
                @click="handleToken(manualToken)"
              >
                Запросить
              </button>
            </div>

            <div class="stack">
              <div style="display: flex; gap: 10px; align-items: center">
                <button
                  class="btn btn--primary"
                  :disabled="scanning"
                  @click="startScanner"
                >
                  {{ scanning ? "Камера активна" : "Запустить камеру" }}
                </button>
                <button class="btn" :disabled="!scanning" @click="stopScanner">
                  Остановить
                </button>
                <select
                  class="input"
                  style="max-width: 220px"
                  v-model="selectedDeviceId"
                  :disabled="scanning"
                >
                  <option disabled value="">Выберите камеру</option>
                  <option
                    v-for="device in devices"
                    :key="device.deviceId"
                    :value="device.deviceId"
                  >
                    {{ device.label || "Камера" }}
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
      </div>

      <section class="card" v-if="client || clientLoading || fetchError">
        <div class="card__title">
          <span>Данные клиента</span>
          <span class="pill">{{ client ? "Готово" : "Ожидание" }}</span>
        </div>

        <div v-if="clientLoading" class="status">Запрашиваем данные...</div>
        <div v-else-if="fetchError" class="status status--error">
          {{ fetchError }}
        </div>

        <template v-else-if="client">
          <div
            class="card-grid"
            style="grid-template-columns: repeat(auto-fit, minmax(220px, 1fr))"
          >
            <div>
              <p class="muted">ФИО</p>
              <p style="font-weight: 700; margin: 4px 0">
                {{ client.fullName }}
              </p>
            </div>
            <div>
              <p class="muted">Телефон</p>
              <p style="margin: 4px 0">{{ client.phone }}</p>
            </div>
            <div>
              <p class="muted">Возраст</p>
              <p style="margin: 4px 0">{{ client.age }} лет</p>
            </div>
            <div>
              <p class="muted">Регион</p>
              <p style="margin: 4px 0">{{ client.region?.name || "—" }}</p>
            </div>
          </div>

          <div style="margin-top: 18px">
            <p class="muted" style="margin: 0 0 8px">Подтвержденные льготы</p>
            <div v-if="(client.benefits || []).length === 0" class="status">
              Нет привязанных льгот.
            </div>
            <div v-else class="stack">
              <div
                class="chip"
                v-for="benefit in client.benefits"
                :key="benefit.id"
              >
                {{ benefit.title }} ({{ benefit.code }})
              </div>
            </div>
          </div>
        </template>
      </section>
    </main>
  </div>
</template>
