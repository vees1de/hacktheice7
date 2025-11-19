<script setup lang="ts">
import { useUserStore } from '@entities/user';
import { storeToRefs } from 'pinia';

const { user } = storeToRefs(useUserStore());
</script>
<template>
  <div class="profile">
    <div class="profile__info">
      <img
        src="@shared/assets/icons/profile-icon.svg"
        alt="иконка профиля"
      />
      <div class="name">{{ user.firstName }} {{ user.lastName }}</div>
      <div class="phone">{{ user.phone }}</div>
    </div>
    <div class="profile__edit">
      <div class="edit-button">
        <div>
          <img
            class="btn-icon"
            src="@shared/assets/icons/chat-icon.svg"
            alt=""
          />
          <span>Выбрать льготы</span>
        </div>
        <img
          class="arrow"
          src="@shared/assets/icons/arrow.svg"
        />
      </div>
    </div>
  </div>
</template>
<style lang="scss" scoped>
.profile {
  display: flex;
  flex-direction: column;
  align-items: center;

  &__edit {
    display: flex;
    align-items: flex-start;
    width: 100%;
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
}
</style>
