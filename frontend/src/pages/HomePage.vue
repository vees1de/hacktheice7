<script lang="ts" setup>
import { shareTokenApi } from '@entities/auth/api/shareToken';
import { useUserStore } from '@entities/user';
import { ROUTE_NAMES } from '@shared/model/routes.constants';
import { useCatalogStore } from '@shared/stores/catalog.store';
import { useViewStore } from '@shared/stores/view.store';
import { Block } from '@shared/ui';
import BenefitPromptModal from '@shared/ui/BenefitPromptModal.vue';
import { BenefitsCarousel } from '@widgets/benefits-carousel';
import { ChatBot } from '@widgets/chatbot';
import { Economy } from '@widgets/possible-economy';
import { QrSheetComponent } from '@widgets/qr-sheet';
import { SalesCarousel } from '@widgets/sales-carousel';
import { storeToRefs } from 'pinia';
import QRCode from 'qrcode';
import { computed, ref, watch } from 'vue';
import { useRouter } from 'vue-router';

const viewStore = useViewStore();
const { isQrSheetVisible } = storeToRefs(viewStore);
const userStore = useUserStore();
const { user, hasBenefits, benefitsVersion } = storeToRefs(userStore);
const catalogStore = useCatalogStore();
const { benefits, offers, benefitsLoading, offersLoading } =
  storeToRefs(catalogStore);
const showBenefitModal = ref(false);
const qrPreview = ref<string | null>(null);
const qrPreviewLoading = ref(false);
const qrPreviewError = ref('');
const isRefreshingHome = ref(false);
const pendingRefreshForce = ref(false);

const loadQrPreview = async () => {
  if (qrPreviewLoading.value) return;
  if (!user.value?.id || user.value?.onboardingStep === 'ESIA_AUTH') {
    qrPreview.value = null;
    qrPreviewError.value = '';
    return;
  }

  qrPreviewLoading.value = true;
  qrPreviewError.value = '';
  try {
    const res = await shareTokenApi.create();
    qrPreview.value = await QRCode.toDataURL(res.token, {
      margin: 1,
      width: 120
    });
  } catch (error: any) {
    qrPreview.value = null;
    qrPreviewError.value =
      error?.response?.data?.message || 'Не удалось загрузить QR';
  } finally {
    qrPreviewLoading.value = false;
  }
};

const refreshHomeData = async (forceCatalog = false) => {
  if (isRefreshingHome.value) {
    pendingRefreshForce.value = pendingRefreshForce.value || forceCatalog;
    return;
  }
  isRefreshingHome.value = true;
  try {
    try {
      await userStore.getUser();
    } catch (error) {
      // ignore
    }
    await Promise.all([
      catalogStore.fetchBenefits(forceCatalog),
      catalogStore.fetchOffers(forceCatalog)
    ]);
    await loadQrPreview();
  } finally {
    isRefreshingHome.value = false;
    if (pendingRefreshForce.value) {
      pendingRefreshForce.value = false;
      refreshHomeData(true);
    }
  }
};

watch(
  () => benefitsVersion.value,
  async (newVersion, oldVersion) => {
    const forceCatalog = oldVersion !== undefined ? true : newVersion > 0;
    await refreshHomeData(forceCatalog);
  },
  { immediate: true }
);

watch(
  () => [hasBenefits.value, user.value?.id],
  ([hasAny]) => {
    if (!user.value?.id) return;
    showBenefitModal.value = !hasAny;
  },
  { immediate: true }
);

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

const goToBenefitSelection = async () => {
  showBenefitModal.value = false;
};

const goToSimpleMode = async () => {
  showBenefitModal.value = false;
  await router.push(ROUTE_NAMES.SIMPLE);
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
          <p
            v-if="qrPreviewLoading"
            class="qr__status"
          >
            Генерируем QR...
          </p>
          <p
            v-else-if="qrPreviewError"
            class="qr__status qr__status--error"
          >
            {{ qrPreviewError }}
          </p>
          <img
            v-else-if="qrPreview"
            :src="qrPreview"
            alt="qr-code"
          />
          <img
            v-else
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
            alt="''"
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
        <div class="heading">Вы могли сэкономить</div>
        <img
          src="/assets/icons/arrow.svg"
          alt="''"
        />
      </div>
      <Economy />
      <div class="heading">Чат-бот помощник ЛАССО</div>
      <ChatBot @click="redirect(ROUTE_NAMES.CHAT)" />
      <div
        @click="redirect(ROUTE_NAMES.BENEFITS)"
        class="section-heading"
      >
        <div class="heading">Льготы для тебя</div>
        <img
          src="/assets/icons/arrow.svg"
          alt="''"
        />
      </div>

      <BenefitsCarousel
        :benefits="benefits"
        :loading="benefitsLoading"
      />

      <div
        @click="redirect(ROUTE_NAMES.SALES)"
        class="section-heading"
      >
        <div class="heading">Акции для тебя</div>
        <img
          src="/assets/icons/arrow.svg"
          alt="''"
        />
      </div>
      <SalesCarousel
        :offers="offers"
        :loading="offersLoading"
      />
    </div>
  </div>
  <QrSheetComponent v-if="isQrSheetVisible" />
  <BenefitPromptModal
    :open="showBenefitModal"
    description="Укажите категории, чтобы мы подобрали льготы и открыли чат."
    primary-label="Выбрать льготы"
    simple-label="Простой режим"
    secondary-label="Продолжить позже"
    @primary="goToBenefitSelection"
    @simple="goToSimpleMode"
    @close="showBenefitModal = false"
  />
</template>

<style lang="scss" scoped>
.heading {
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
    display: grid;
    place-items: center;
    overflow: hidden;
    text-align: center;

    width: 124px;

    img {
      height: 100%;
      width: 100%;
      object-fit: contain;
    }
  }

  &__status {
    font-weight: 600;
    color: #1a73e8;
    font-size: 0.85rem;

    &--error {
      color: #c53030;
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
