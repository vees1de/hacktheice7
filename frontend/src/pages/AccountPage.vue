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
        <img
          src="@shared/assets/icons/chat-icon.svg"
          alt=""
        />
        <span>Выбрать льготы</span>
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
    .edit-button {
      display: flex;
      gap: 8px;
      align-items: center;
      font-weight: 500;
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
