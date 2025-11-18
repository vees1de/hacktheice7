<script lang="ts" setup>
import { useViewStore } from '@shared/stores/view.store';
import { Block } from '@shared/ui';
import { BenefitElement } from '@widgets/benefit-element';
import { QrSheetComponent } from '@widgets/qr-sheet';
import { storeToRefs } from 'pinia';

const viewStore = useViewStore();
const { isQrSheetVisible } = storeToRefs(viewStore);
const openQrSheet = () => {
  viewStore.toggleQrVisible();
};

const benefits = [
  { icon: 'bus', name: 'Транспорт' },
  { icon: 'heart', name: 'Медицина' },
  { icon: 'bus', name: 'ЖКХ' },
  { icon: 'cash', name: 'Социальные выплаты' },
  { icon: 'wheel', name: 'Образование и досуг' },
  { icon: 'document', name: 'Налоговые льготы' }
];
</script>

<template>
  <div class="home">
    <div class="home__content">
      <Block class="qr">
        <div class="qr__title">Единый кошелек льготника</div>
        <div
          @click="openQrSheet"
          class="qr__image"
        >
          <img
            src="@shared/assets/images/qrcode.png"
            alt="qr-code"
          />
        </div>
        <div class="qr__locked">
          <img
            src="@shared/assets/icons/locked.svg"
            alt=""
          />
          <p>
            Подтвердите аккаунт госулсуг, чтобы использовать цифровое
            удостоверение льготника
          </p>
        </div>
      </Block>
      <h3>Категории льгот для пенсионера</h3>
      <section class="benefits-grid">
        <template
          v-for="(benefit, index) in benefits"
          :key="benefit.icon"
        >
          <BenefitElement
            :icon="benefit.icon"
            :name="benefit.name"
          />
        </template>
      </section>
      <h3></h3>
    </div>
  </div>
  <QrSheetComponent v-if="isQrSheetVisible" />
</template>

<style lang="scss" scoped>
h3 {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 24px;
}

.benefits-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 16px;
}

.qr {
  display: flex;
  justify-content: space-between;
  margin-top: 22px;
  background: #1a73e8 url('/src/shared/assets/images/intersect.svg');
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
}
</style>
