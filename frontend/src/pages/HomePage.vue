<script lang="ts" setup>
import { useUserStore } from '@entities/user';
import { ROUTE_NAMES } from '@shared/model/routes.constants';
import { useCatalogStore } from '@shared/stores/catalog.store';
import { useViewStore } from '@shared/stores/view.store';
import { Block } from '@shared/ui';
import { BenefitsCarousel } from '@widgets/benefits-carousel';
import { ChatBot } from '@widgets/chatbot';
import { Economy } from '@widgets/possible-economy';
import { QrSheetComponent } from '@widgets/qr-sheet';
import { SalesCarousel } from '@widgets/sales-carousel';
import { storeToRefs } from 'pinia';
import { computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const viewStore = useViewStore();
const { isQrSheetVisible } = storeToRefs(viewStore);
const { user } = storeToRefs(useUserStore());
const catalogStore = useCatalogStore();
const { benefits, offers, benefitsLoading, offersLoading } =
  storeToRefs(catalogStore);

onMounted(() => {
  catalogStore.fetchBenefits();
  catalogStore.fetchOffers();
});

const userBenefitTitles = computed(() => {
  return (
    user.value.userBeneficiaryCategories
      ?.filter(category => category.confirmed)
      .map(category => category.beneficiaryCategory?.title || '')
      .filter((title): title is string => Boolean(title)) ?? []
  );
});

const visibleBenefitTitles = computed(() =>
  userBenefitTitles.value.slice(0, 2)
);

const openQrSheet = () => {
  viewStore.toggleQrVisible();
};

const router = useRouter();
const redirect = async (route: string) => {
  await router.push(route);
};
</script>

<template>
  <div class="home">
    <div class="home__content">
      <Block class="qr">
        <div class="qr__title">
          Единое цифровое удостоверение льготника
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
      <div
        @click="redirect(ROUTE_NAMES.PROFITS)"
        class="section-heading"
      >
        <h3>Вы могли сэкономить</h3>
        <img src="/assets/icons/arrow.svg" />
      </div>
      <Economy />
      <h3>Чат-бот помощник ЛАССО</h3>
      <ChatBot @click="redirect(ROUTE_NAMES.CHAT)" />
      <div
        @click="redirect(ROUTE_NAMES.BENEFITS)"
        class="section-heading"
      >
        <h3>Льготы для тебя</h3>
        <img src="/assets/icons/arrow.svg" />
      </div>

      <BenefitsCarousel
        :benefits="benefits"
        :loading="benefitsLoading"
      />

      <div
        @click="redirect(ROUTE_NAMES.SALES)"
        class="section-heading"
      >
        <h3>Акции для тебя</h3>
        <img src="/assets/icons/arrow.svg" />
      </div>
      <SalesCarousel
        :offers="offers"
        :loading="offersLoading"
      />
    </div>
  </div>
  <QrSheetComponent v-if="isQrSheetVisible" />
</template>

<style lang="scss" scoped>
h3 {
  font-size: 1.25rem;
  font-weight: 600;
}

.home {
  margin-bottom: 36px;
  overflow-x: hidden;

  &__content {
    display: grid;
    gap: 32px;
    width: 100%;
  }
}

.qr {
  display: flex;
  justify-content: space-between;
  background: #1a73e8 url('/assets/images/intersect.svg');
  background-repeat: repeat-x;
  background-position: 0 calc(100% + 20px);
  width: 100%;
  margin-bottom: 32px;
  position: relative;
  height: 140px;

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
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  &__benefit {
    display: inline-flex;
    align-items: center;
    width: fit-content;
    padding: 4px 12px;
    border-radius: 999px;
    background-color: #dfeaff;
    color: #0f172a;
    font-weight: 600;
    font-size: 0.75rem;

    &--more {
      font-weight: 500;
    }
  }
}
</style>
