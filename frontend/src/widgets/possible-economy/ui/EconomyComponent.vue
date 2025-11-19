<script setup lang="ts">
const { type = 'both' } = defineProps<{
  type?: 'both' | 'sales' | 'benefits';
}>();
</script>
<template>
  <div
    v-if="type === 'sales' || type === 'both'"
    class="economy"
    style="margin-bottom: 24px"
  >
    <div class="money">
      <div class="money__sum">13.000₽</div>
      <div class="money__date">11.02.2024-10.01.2025</div>
    </div>
    <div class="shops">
      <div class="shops__count">В 24 магазинах</div>
      <div class="shops__images">
        <img
          src="@shared/assets/images/shops.png"
          alt=""
        />
        <div>...</div>
      </div>
    </div>
  </div>

  <div
    v-if="type === 'benefits' || type === 'both'"
    class="economy"
  >
    <div class="money">
      <div class="money__sum">4.000₽</div>
      <div class="money__date">11.02.2024-10.01.2025</div>
    </div>
    <div class="shops">
      <div class="shops__count">В 12 льготах</div>
      <div class="shops__images">
        <img
          src="@shared/assets/images/benefits.png"
          alt=""
        />
        <div>...</div>
      </div>
    </div>
  </div>
</template>
<style lang="scss" scoped>
.economy {
  display: flex;
  justify-content: space-between;
  padding-inline: 14px;
}

.money {
  width: 155px;
  height: 83px;
  background-color: #e5f0ff;
  border: 2px solid #c6ddfd;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  &__sum {
    font-weight: 600;
    font-size: 1.5rem;
    line-height: 17px;
    margin-bottom: 6px;
  }

  &__date {
    text-decoration: underline;
    color: #a2a2a2;
    font-size: 0.75rem;
  }
}

.shops {
  display: grid;
  place-items: center;

  &__count {
    font-size: 0.875rem;
    font-weight: 600;
  }

  &__images {
    display: flex;
    gap: 6px;

    align-items: center;

    img {
      width: auto;
      height: 32px;
    }
  }
}
</style>
