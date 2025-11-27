<script setup lang="ts">
import { useUserStore } from '@entities/user';
import { ROUTE_NAMES } from '@shared/model/routes.constants';
import { storeToRefs } from 'pinia';
import { computed } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const { user } = storeToRefs(useUserStore());
const redirectToProfile = async () => {
  await router.push(ROUTE_NAMES.USER);
};

const isShow = computed(
  () =>
    !router.currentRoute.value.path.includes(ROUTE_NAMES.USER) &&
    !router.currentRoute.value.path.startsWith('/auth')
);
</script>
<template>
  <div
    v-if="isShow"
    class="profile-header"
  >
    <div
      class="left"
      @click="redirectToProfile"
    >
      <img
        class="profile-icon"
        src="/assets/icons/profile-icon.svg"
        alt="Профиль"
      />
      <span>{{ user?.lastName }}</span>
      <img
        class="arrow-icon"
        src="/assets/icons/arrow.svg"
        alt="''"
      />
    </div>
    <img
      class="right"
      src="/assets/icons/bell-icon.svg"
      alt="''"
    />
  </div>
</template>
<style lang="scss" scoped>
.profile-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-inline: 16px;
  margin-top: 8px;
  margin-bottom: 22px;

  .left {
    display: flex;
    align-items: center;
    .profile-icon {
      margin-right: 8px;
    }

    span {
      font-weight: 600;
      margin-right: 12px;
    }

    .arrow-icon {
      transform: rotate(180deg);
    }
  }
}

img {
  filter: var(--icon);
}
</style>
