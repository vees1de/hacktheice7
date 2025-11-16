<script setup lang="ts">
import { useViewStore } from '@shared/stores/view.store';

const { toggleQrVisible } = useViewStore();
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
      <div class="qr-sheet__img">
        <img src="@shared/assets/images/qrcode.png" />
        <!-- toggler -->
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
  }
}
</style>
