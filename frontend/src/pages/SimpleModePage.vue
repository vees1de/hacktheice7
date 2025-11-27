<script setup lang="ts">
import { ROUTE_NAMES } from '@shared/model/routes.constants';
import { useViewStore } from '@shared/stores/view.store';
import { QrSheetComponent } from '@widgets/qr-sheet';
import { storeToRefs } from 'pinia';
import { useRouter } from 'vue-router';

const router = useRouter();
const viewStore = useViewStore();
const { isQrSheetVisible } = storeToRefs(viewStore);

const go = async (route: string) => {
  await router.push(route);
};

const openQr = () => {
  viewStore.toggleQrVisible();
};

const actions = [
  {
    title: 'Подобрать льготы',
    desc: 'Ответьте на пару вопросов и получите список доступных льгот.',
    icon: '/assets/icons/shield-icon.svg',
    handler: () => go(ROUTE_NAMES.EDIT_BENEFITS)
  },
  {
    title: 'Показать удостоверение',
    desc: 'QR-код для подтверждения права на льготы.',
    icon: '/assets/icons/square-arrow-right.svg',
    handler: openQr
  },
  {
    title: 'Чат-бот ЛАССО',
    desc: 'Спросите про выплаты, документы и статусы.',
    icon: '/assets/icons/chat-icon.svg',
    handler: () => go(ROUTE_NAMES.CHAT)
  },
  {
    title: 'Льготы и предложения',
    desc: 'Весь каталог ваших льгот в одном месте.',
    icon: '/assets/icons/users-icon.svg',
    handler: () => go(ROUTE_NAMES.BENEFITS)
  },
  {
    title: 'Акции и скидки',
    desc: 'Подборка выгодных предложений под ваш профиль.',
    icon: '/assets/icons/sale-icon.svg',
    handler: () => go(ROUTE_NAMES.SALES)
  },
  {
    title: 'Моя выгода',
    desc: 'Отслеживайте, сколько уже сэкономили.',
    icon: '/assets/icons/ruble-bold-icon.svg',
    handler: () => go(ROUTE_NAMES.PROFITS)
  }
];
</script>

<template>
  <div class="simple">
    <div class="simple__hero">
      <p class="eyebrow">Простой режим</p>
      <h1>Все главные действия на одной странице</h1>
      <p class="lead">
        Выберите, что сделать прямо сейчас: показать удостоверение, подобрать льготы
        или задать вопрос в чат-боте.
      </p>
    </div>

    <div class="simple__grid">
      <button
        v-for="action in actions"
        :key="action.title"
        type="button"
        class="simple-card"
        @click="action.handler"
      >
        <div class="simple-card__icon">
          <img
            :src="action.icon"
            :alt="action.title"
          />
        </div>
        <div class="simple-card__text">
          <p class="simple-card__title">{{ action.title }}</p>
          <p class="simple-card__desc">{{ action.desc }}</p>
        </div>
        <img
          class="simple-card__arrow"
          src="/assets/icons/arrow.svg"
          alt=""
        />
      </button>
    </div>
  </div>
  <QrSheetComponent v-if="isQrSheetVisible" />
</template>

<style scoped lang="scss">
.simple {
  display: grid;
  gap: 16px;
  padding: 12px 0 24px;
}

.simple__hero {
  background: linear-gradient(135deg, #0ea5e9, #22c55e);
  color: #fff;
  border-radius: 22px;
  padding: 20px;
  display: grid;
  gap: 10px;
  box-shadow: 0 16px 42px rgba(15, 23, 42, 0.35);

  h1 {
    margin: 0;
    font-size: 24px;
    line-height: 1.2;
  }

  .lead {
    margin: 0;
    color: rgba(255, 255, 255, 0.9);
  }
}

.eyebrow {
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-weight: 800;
  font-size: 13px;
}

.simple__grid {
  display: grid;
  gap: 12px;
}

.simple-card {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 12px;
  padding: 14px;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  background: #fff;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.08);
  cursor: pointer;
  transition: transform 0.12s ease, box-shadow 0.12s ease;

  &:active {
    transform: translateY(1px);
    box-shadow: 0 4px 14px rgba(15, 23, 42, 0.06);
  }
}

.simple-card__icon {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  background: #0f172a;
  display: grid;
  place-items: center;

  img {
    width: 26px;
    height: 26px;
  }
}

.simple-card__text {
  display: grid;
  gap: 4px;
  text-align: left;
}

.simple-card__title {
  margin: 0;
  font-weight: 700;
  color: #0f172a;
}

.simple-card__desc {
  margin: 0;
  color: #475467;
  font-size: 14px;
}

.simple-card__arrow {
  width: 20px;
  height: 20px;
}

@media (min-width: 720px) {
  .simple {
    padding-top: 16px;
  }

  .simple__grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
