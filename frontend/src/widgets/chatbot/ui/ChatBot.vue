<script lang="tsx" setup>
const hints = [
  'Как оформить ипотеку по ДВИ',
  'Проезд в автобусе',
  'ЖД билет',
  'Льготы по безработице',
  'Авиаперелеты'
];
</script>
<template>
  <section class="chatbot">
    <div class="chatbot__input">
      <img
        src="@shared/assets/icons/lasso-icon.svg"
        alt=""
      />
      <span>Введите запрос...</span>
      <img
        src="@shared/assets/icons/arrow-request-icon.svg"
        alt=""
      />
    </div>
    <div class="chatbot__hints">
      <div
        v-for="hint in hints"
        :key="hint"
        class="hint"
      >
        {{ hint }}
      </div>
    </div>
  </section>
</template>
<style lang="scss" scoped>
.chatbot {
  &__input {
    display: flex;
    align-items: center;
    padding: 10px 16px;
    background-color: #e5f0ff;
    border: 1px solid #c6ddfd;
    justify-content: space-between;
    color: #a2a2a2;
    font-size: 0.875rem;
    border-radius: 8px;
    margin-bottom: 16px;

    img:first-child {
      width: 28px;
      height: 28px;
      margin-right: 12px;
    }

    img:last-child {
      width: 14px;
      height: 14px;
    }

    span {
      width: 100%;
    }
  }

  &__hints {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;

    .hint {
      padding: 6.5px 12px;
      background-color: #2455cc;
      color: #fff;
      border-radius: 12px;
      font-size: 0.75rem;
    }
  }
}
</style>
