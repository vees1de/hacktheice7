<script setup lang="ts">
import { ROUTE_NAMES } from '@shared/model/routes.constants';
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

const benefitId = computed(
  () => (route.params.benefitId as string | undefined) || 'mock-benefit'
);

const goBack = () => {
  router.back();
};

const mockAudience = [
  'Инвалид I группы',
  'Родитель или опекун',
  'Доверенное лицо'
];
const mockDocuments = {
  required: [
    'Паспорт РФ',
    'Справка МСЭ (1 группа)',
    'Выписка из ЕГРН или договор соцнайма',
    'Квитанция за ЖКУ за последний месяц',
    'Заявление (дадут на месте)'
  ],
  optional: [
    'Справка о составе семьи (если нужно)',
    'Указание основного места проживания'
  ]
};

const mockSteps = [
  'Собрать обязательные и дополнительные документы',
  'Обратиться в ближайший МФЦ',
  'Подать заявление и получить уведомление'
];

const mockOtherBenefits = [
  'Твердое топливо',
  'Денежная компенсация',
  'Компенсация за капремонт',
  'Субсидия на ЖКУ'
];
</script>

<template>
  <div class="benefit-page">
    <header class="benefit-page__header">
      <h1>Скидка на оплату ЖКУ</h1>
    </header>

    <section class="hero">
      <div class="hero__title">Скидка 30% на ЖКУ</div>
      <div class="badges">
        <span class="badge">На ЖКУ, содержание жилья, капремонт</span>
        <span class="badge">Инвалидам I группы</span>
        <span class="badge">Размер скидки от 50%</span>
      </div>
    </section>

    <section class="section">
      <h2>Описание льготы</h2>
      <p>
        Инвалидам I группы положена скидка от 50% на оплату содержания жилья или
        найма, коммунальных услуг и взноса на капитальный ремонт. Скидка
        действует в пределах социальных норм.
      </p>
    </section>

    <section class="section">
      <h2>Кому положена</h2>
      <div class="audience">
        <span
          v-for="audience in mockAudience"
          :key="audience"
          class="audience__pill"
        >
          {{ audience }}
        </span>
      </div>
    </section>

    <section class="section">
      <h2>Необходимые документы</h2>
      <div class="docs">
        <div>
          <h3>Обязательные:</h3>
          <ul>
            <li
              v-for="doc in mockDocuments.required"
              :key="doc"
            >
              {{ doc }}
            </li>
          </ul>
        </div>
        <div>
          <h3>Дополнительные:</h3>
          <ul>
            <li
              v-for="doc in mockDocuments.optional"
              :key="doc"
            >
              {{ doc }}
            </li>
          </ul>
        </div>
      </div>
    </section>

    <section class="section">
      <h2>Как получить льготу</h2>
      <ol class="steps">
        <li
          v-for="step in mockSteps"
          :key="step"
        >
          {{ step }}
        </li>
      </ol>
    </section>

    <section class="section">
      <h2>Другие льготы</h2>
      <div class="other-benefits">
        <div
          v-for="benefitLabel in mockOtherBenefits"
          :key="benefitLabel"
          class="other-benefits__item"
        >
          {{ benefitLabel }}
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped lang="scss">
.benefit-page {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.benefit-page__header {
  display: flex;
  align-items: center;
  gap: 16px;

  h1 {
    font-size: 1.2rem;
    font-weight: 600;
  }
}

.back-button {
  border: none;
  background: none;
  padding: 8px;
  border-radius: 50%;
  background-color: #f2f7fe;
}

.hero {
  background-color: #e5f0ff;
  border-radius: 16px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;

  &__title {
    font-weight: 700;
    font-size: 1.2rem;
  }
}

.badges {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.badge {
  background-color: #fff;
  border-radius: 999px;
  padding: 6px 12px;
  font-size: 0.8rem;
  font-weight: 600;
}

.section {
  display: flex;
  flex-direction: column;
  gap: 8px;

  h2 {
    font-size: 1rem;
    font-weight: 700;
  }

  p {
    line-height: 1.4;
  }
}

.audience {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;

  &__pill {
    background-color: #1a73e8;
    color: #fff;
    border-radius: 999px;
    padding: 6px 12px;
    font-weight: 600;
    font-size: 0.85rem;
  }
}

.docs {
  display: grid;
  gap: 12px;

  h3 {
    font-weight: 600;
    margin-bottom: 4px;
  }

  ul {
    padding-left: 18px;
    margin: 0;
    line-height: 1.4;
  }
}

.steps {
  padding-left: 18px;
  margin: 0;
  line-height: 1.6;
}

.other-benefits {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;

  &__item {
    flex: 1 1 calc(50% - 8px);
    background-color: #e5f0ff;
    border-radius: 16px;
    padding: 12px;
    text-align: center;
    font-weight: 600;
    color: #1a73e8;
  }
}
</style>
