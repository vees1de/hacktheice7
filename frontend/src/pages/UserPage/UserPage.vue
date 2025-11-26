<script setup lang="ts">
import { useAuthStore } from '@entities/auth';
import { downloadCertificatePdf, useUserStore } from '@entities/user';
import { storeToRefs } from 'pinia';
import { ref } from 'vue';
import { RouterView, useRouter } from 'vue-router';

const { user } = storeToRefs(useUserStore());
const router = useRouter();
const authStore = useAuthStore();
const redirectTo = () => {
  router.push('/user/edit-benefits');
};
const goToSettings = () => {
  router.push('/user/settings');
};

const exit = async () => {
  await authStore.logout();
};

const isCertificateLoading = ref(false);
const downloadCertificate = async () => {
  if (isCertificateLoading.value) return;
  isCertificateLoading.value = true;
  try {
    await downloadCertificatePdf();
  } catch (error) {
    console.error('Не удалось скачать удостоверение', error);
  } finally {
    isCertificateLoading.value = false;
  }
};
</script>
<template>
  <template v-if="router.currentRoute.value.path === '/user'">
    <div class="profile">
      <div class="profile__info">
        <img
          src="/assets/icons/profile-icon.svg"
          alt="иконка профиля"
        />
        <div class="name">{{ user.firstName }} {{ user.lastName }}</div>
        <div class="phone">{{ user.phone }}</div>
      </div>
      <div class="profile__edit">
        <div class="edit-button">
          <div @click="redirectTo">
            <img
              class="btn-icon"
              src="/assets/icons/chat-icon.svg"
              alt=""
            />
            <span>Выбрать льготы</span>
          </div>
          <img
            class="arrow"
            src="/assets/icons/arrow.svg"
          />
        </div>
        <div class="edit-button">
          <div @click="goToSettings">
            <img
              class="btn-icon"
              src="/assets/icons/chat-icon.svg"
              alt=""
            />
            <span>Настройки приложения</span>
          </div>
          <img
            class="arrow"
            src="/assets/icons/arrow.svg"
          />
        </div>
      </div>
      <div class="profile__actions">
        <div class="download-card">
          <button
            class="download-button"
            :disabled="isCertificateLoading"
            @click="downloadCertificate"
          >
            {{ isCertificateLoading ? 'Готовим PDF...' : 'Скачать бумажное удостоверение' }}
          </button>
        </div>
        <div class="edit-button">
          <div @click="exit">
            <img
              class="btn-icon"
              src="/assets/icons/exit-icon.svg"
              alt=""
            />
            <span>Выйти</span>
          </div>
        </div>
      </div>
    </div>
  </template>
  <RouterView v-else></RouterView>
</template>
<style lang="scss" scoped>
.profile {
  display: flex;
  flex-direction: column;
  align-items: center;

  &__actions {
    margin-top: 60px;
    display: grid;
    gap: 16px;
    width: 100%;
  }

  &__edit {
    display: grid;
    gap: 16px;
    width: 100%;
  }

  .edit-button {
    width: 100%;
    display: flex;

    justify-content: space-between;
    font-weight: 500;

    > div {
      display: flex;
      gap: 4px;
      align-items: center;
      font-weight: 500;
    }

    .arrow {
      transform: rotate(180deg);
      filter: brightness(0) saturate(100%) invert(33%) sepia(57%)
        saturate(2127%) hue-rotate(195deg) brightness(99%) contrast(90%);
    }
  }

  &__info {
    text-align: center;
    margin-bottom: 24px;

    img {
      width: 100px;
      height: 100px;
      margin-bottom: 16px;
    }

    .name {
      font-size: 1.25rem;
      font-weight: 600;
      margin-bottom: 8px;
    }

    .phone {
      font-size: 0.825rem;
      font-weight: 600;
      color: #d9d9d9;
    }
  }

  .download-card {
    width: 100%;
    display: flex;
    justify-content: center;

    .download-button {
      width: 100%;
      padding: 12px 16px;
      border-radius: 16px;
      border: none;
      background-color: #1a73e8;
      color: #fff;
      font-weight: 600;
      font-size: 0.95rem;
      cursor: pointer;
      transition: opacity 0.2s ease;

      &:disabled {
        opacity: 0.7;
        cursor: default;
      }
    }
  }
}
</style>
