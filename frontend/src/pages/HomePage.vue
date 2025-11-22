<script lang="ts" setup>
import { useUserStore } from '@entities/user';
import { useViewStore } from '@shared/stores/view.store';
import { Block } from '@shared/ui';
import { BenefitsCarousel } from '@widgets/benefits-carousel';
import { ChatBot } from '@widgets/chatbot';
import { Economy } from '@widgets/possible-economy';
import { QrSheetComponent } from '@widgets/qr-sheet';
import { SalesCarousel } from '@widgets/sales-carousel';
import { storeToRefs } from 'pinia';
import { computed } from 'vue';

const viewStore = useViewStore();
const { isQrSheetVisible } = storeToRefs(viewStore);
const { user } = storeToRefs(useUserStore());

const userBenefitTitles = computed(() => {
  const categories = user.value.userBeneficiaryCategories ?? [];
  return categories
    .filter(category => category.confirmed)
    .map(category => category.beneficiaryCategory?.title || '')
    .filter((title): title is string => Boolean(title));
});

const visibleBenefitTitles = computed(() =>
  userBenefitTitles.value.slice(0, 2)
);
const remainingBenefitCount = computed(() =>
  Math.max(
    userBenefitTitles.value.length - visibleBenefitTitles.value.length,
    0
  )
);

const openQrSheet = () => {
  viewStore.toggleQrVisible();
};
</script>

<template>
  <div class="home">
    <div class="home__content">
      <Block class="qr">
        <div class="qr__title">
          Единый кошелек льготника
          <div
            v-if="visibleBenefitTitles.length"
            class="qr__benefits"
          >
            <span
              v-for="title in visibleBenefitTitles"
              :key="title"
              class="qr__benefit"
            >
              {{ title }}
            </span>
            <span
              v-if="remainingBenefitCount"
              class="qr__benefit qr__benefit--more"
            >
              +{{ remainingBenefitCount }}
            </span>
          </div>
        </div>
        <div
          @click="openQrSheet"
          class="qr__image"
        >
          <img
            src="/assets/images/qrcode.png"
            alt="qr-code"
          />
        </div>
        <div
          v-if="user.onboardingStep == 'ESIA_AUTH'"
          class="qr__locked"
        >
          <img
            src="/assets/icons/locked.svg"
            alt=""
          />
          <p>
            Подтвердите аккаунт госулсуг, чтобы использовать цифровое
            удостоверение льготника
          </p>
        </div>
      </Block>
      <div class="section-heading">
        <h3>Вы сэкономили</h3>
        <img src="/assets/icons/arrow.svg" />
      </div>
      <Economy />
      <h3>Чат-бот помощник ЛАССО</h3>
      <ChatBot />
      <div class="section-heading">
        <h3>Льготы для тебя</h3>
        <img src="/assets/icons/arrow.svg" />
      </div>
      <BenefitsCarousel />
      <div class="section-heading">
        <h3>Акции для тебя</h3>
        <img src="/assets/icons/arrow.svg" />
      </div>
      <SalesCarousel />
    </div>
  </div>
  <QrSheetComponent v-if="isQrSheetVisible" />
</template>

<style lang="scss" scoped>
h3 {
  font-size: 20px;
  font-weight: 600;
}

.home {
  margin-bottom: 36px;
  &__content {
    display: grid;
    gap: 32px;
  }
}

.qr {
  display: flex;
  justify-content: space-between;
  background: #1a73e8 url('/assets/images/intersect.svg');
  background-repeat: repeat-x;
  background-position: 0 calc(100% + 20px);

  margin-bottom: 32px;
  position: relative;

  &__locked {
    position: absolute;
    background-color: #45454572;
    backdrop-filter: blur(8px);
    width: 100%;
    height: 100%;
    left: 0;
    top: 0;
    border-radius: 24px;
    color: #fff;
    font-weight: 500;
    display: flex;
    flex-direction: column;
    gap: 4px;
    align-items: center;
    justify-content: center;
    text-align: center;

    img {
      width: 33px;
      height: 33px;
    }
  }

  &__title {
    color: #fff;
    font-size: 1.063;
    padding-top: 8px;
    font-weight: 600;
    width: 60%;
    display: flex;

    flex-direction: column;
    justify-content: space-between;
  }

  &__image {
    padding: 4px;
    background-color: #fff;
    border-radius: 6px;
    height: 124px;

    width: 124px;

    img {
      height: 100%;
    }
  }

  &__benefits {
    margin-top: 12px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  &__benefit {
    display: inline-flex;
    align-items: center;
    width: fit-content;
    padding: 6px 16px;
    border-radius: 999px;
    background-color: #dfeaff;
    color: #0f172a;
    font-weight: 600;
    font-size: 0.9rem;

    &--more {
      font-weight: 500;
    }
  }
}
</style>
