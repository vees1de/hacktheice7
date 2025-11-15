<script lang="ts" setup>
import { Block, Heading } from '@shared/ui';
</script>

<template>
  <div class="home">
    <Heading>Главная</Heading>
    <div class="home__content">
      <Block class="qr">
        <div class="qr__title">Единый кошелек льготника</div>
        <div class="qr__image">
          <img
            src="@shared/assets/images/qrcode.png"
            alt="qr-code"
          />
        </div>
      </Block>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.qr {
  display: flex;
  justify-content: space-between;
  margin-top: 22px;
  background: #1a73e8 url('/src/shared/assets/images/intersect.svg');
  background-repeat: repeat-x;
  background-position: 0 calc(100% + 20px);

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
