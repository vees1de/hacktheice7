<script setup lang="ts">
const days = ['Сегодня', 'Завтра', '21.11', '22.11', '23.11', '24.11'];

const calendarItems = [
  {
    image: '/assets/images/ganza.png',
    title: 'Скидка 5% в Ганзе',
    subtitle: 'На всю бытовую химию и посуду'
  },
  {
    image: '/assets/images/hoz.png',
    title: 'Скидка 5% в ХозМаркете',
    subtitle: 'На новогодние вещи'
  },
  {
    image: '/assets/images/slad.png',
    title: 'Акция в Сладких мечтах',
    subtitle: 'Бесплатный торт для инвалидов 1,2 группы'
  }
];
</script>
<template>
  <div class="calendar carousel">
    <div class="carousel__line">
      <div
        v-for="day of days"
        :key="day"
        class="day"
      >
        {{ day }}
      </div>
    </div>
  </div>
  <div class="shops">
    <div
      v-for="item in calendarItems"
      :key="item.title"
      class="shops__item"
    >
      <img
        :src="item.image"
        alt="''"
      />
      <div class="info">
        <div class="info__title">{{ item.title }}</div>
        <div class="info__subtitle">{{ item.subtitle }}</div>
      </div>
    </div>
  </div>
</template>
<style lang="scss" scoped>
.shops {
  display: grid;
  gap: 16px;

  &__item {
    display: flex;
    align-items: center;
    gap: 8px;

    img {
      width: 43px;
      height: 43px;
    }
  }

  .info {
    &__title {
      font-weight: 600;
      margin-bottom: 8px;
    }

    &__subtitle {
      font-size: 0.75rem;
      font-weight: 500;
      color: #a2a2a2;
    }
  }
}

.carousel {
  overflow-y: hidden;
  overflow-x: scroll;

  &__line {
    display: flex;
    gap: 8px;
  }

  .day {
    border-radius: 16px;
    padding: 6.5px 12px;
    background-color: #1a73e8;
    color: #fff;
    width: fit-content;

    &_active {
      background-color: #e5f0ff;
      color: #000;
    }
  }
}
</style>
