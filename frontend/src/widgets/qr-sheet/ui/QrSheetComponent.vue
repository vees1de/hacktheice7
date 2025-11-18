<script setup lang="ts">
import { shareTokenApi } from '@entities/auth/api/shareToken';
import { useViewStore } from '@shared/stores/view.store';
import QRCode from 'qrcode';
import { onMounted, ref, watch } from 'vue';

const viewStore = useViewStore();
const { toggleQrVisible, isQrSheetVisible } = viewStore;

const qrDataUrl = ref<string | null>(null);
const loading = ref(false);
const error = ref('');
const token = ref<string | null>(null);

const generateQr = async () => {
  loading.value = true;
  error.value = '';
  qrDataUrl.value = null;
  token.value = null;
  try {
    const res = await shareTokenApi.create();
    token.value = res.token;
    qrDataUrl.value = await QRCode.toDataURL(res.token, {
      margin: 1,
      width: 240
    });
  } catch (e: any) {
    error.value =
      e?.response?.data?.message || 'Не удалось сгенерировать QR-токен';
  } finally {
    loading.value = false;
  }
};

watch(
  () => isQrSheetVisible,
  visible => {
    if (visible) {
      generateQr();
    }
  }
);

onMounted(() => {
  if (isQrSheetVisible) {
    generateQr();
  }
});
</script>
<template>
  <div class="over">
    <div class="qr-sheet">
      <div class="qr-sheet__head">
        <span>Единое цифровое удостоверение льготника</span>
        <div
          @click="toggleQrVisible()"
          class="exit"
        >
          X
        </div>
      </div>
      <div class="qr-sheet__content">
        <div class="qr-sheet__img">
          <template v-if="loading">
            <p>Генерируем QR...</p>
          </template>
          <template v-else-if="error">
            <p class="error">{{ error }}</p>
            <button
              class="retry"
              @click="generateQr"
            >
              Повторить
            </button>
          </template>
          <template v-else-if="qrDataUrl">
            <img
              :src="qrDataUrl"
              alt="QR token"
            />
            <p class="token">{{ token }}</p>
          </template>
        </div>
        <p class="hint">
          Покажите QR кассиру. Токен одноразовый и действует ограниченное время.
        </p>
      </div>
    </div>
  </div>
</template>
<style lang="scss" scoped>
.over {
  position: absolute;
  height: 100%;
  width: 100%;
  background-color: #38383886;
  bottom: 0;
  left: 0;
  display: flex;
  align-items: end;
}

.qr-sheet {
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
  background-color: #fff;
  padding: 16px 16px;
  z-index: 10;

  &__head {
    display: flex;
    padding-inline: 8px;
    margin-bottom: 16px;
    font-size: 1.25rem;
    font-weight: 600;
  }

  &__img {
    padding: 16px;
    border-radius: 16px;
    display: grid;
    place-items: center;
    background-color: #f2f7fe;

    img {
      max-width: 240px;
      width: 100%;
    }
    .token {
      font-size: 0.8rem;
      color: #777;
      word-break: break-all;
      margin-top: 8px;
      text-align: center;
    }
    .error {
      color: #c53030;
      font-weight: 600;
    }
    .retry {
      margin-top: 8px;
      padding: 8px 10px;
      border-radius: 10px;
      border: 1px solid #1a73e8;
      background: #e8f0fe;
      cursor: pointer;
    }
  }
}
.hint {
  margin-top: 12px;
  font-size: 0.9rem;
  color: #555;
}
</style>
