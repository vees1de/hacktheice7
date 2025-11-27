<script setup lang="ts">
import { useBiometricStore } from '@entities/auth';
import { useUserStore, userApi } from '@entities/user';
import { useCatalogStore } from '@shared/stores/catalog.store';
import { computed, reactive, ref } from 'vue';

import GosuslugiMockModal from './GosuslugiMockModal.vue';

defineProps<{
  open: boolean;
  title?: string;
  description?: string;
  primaryLabel?: string;
  secondaryLabel?: string;
  simpleLabel?: string;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'primary'): void;
  (e: 'simple'): void;
}>();

const biometricStore = useBiometricStore();
const userStore = useUserStore();
const catalogStore = useCatalogStore();

const steps = [
  { id: 0, label: 'Старт' },
  { id: 1, label: 'Льготы' },
  { id: 2, label: 'Госуслуги' },
  { id: 3, label: 'Режим' },
  { id: 4, label: 'Защита' }
];

const heroImages = [
  '/assets/images/step1.png',
  '/assets/images/step2.png',
  '/assets/images/step3.png',
  '/assets/images/step4.png'
];

const benefitOptions = reactive([
  {
    value: 'PENSIONER',
    title: 'Пенсионер',
    subtitle: 'Есть пенсионное удостоверение'
  },
  {
    value: 'DISABLED_1',
    title: 'Инвалид I группы',
    subtitle: 'Подтвержденная I группа инвалидности'
  },
  {
    value: 'DISABLED_2',
    title: 'Инвалид II группы',
    subtitle: 'Подтвержденная II группа инвалидности'
  },
  {
    value: 'DISABLED_3',
    title: 'Инвалид III группы',
    subtitle: 'Подтвержденная III группа инвалидности'
  },
  {
    value: 'MULTICHILD_PARENT',
    title: 'Многодетный родитель',
    subtitle: 'Три и более детей в семье'
  },
  { value: 'VETERAN', title: 'Ветеран', subtitle: 'Удостоверение ветерана' },
  {
    value: 'LOW_INCOME',
    title: 'Малоимущий',
    subtitle: 'Подтвержден статус малоимущего'
  },
  {
    value: 'STUDENT',
    title: 'Студент',
    subtitle: 'Очное или заочное обучение'
  },
  {
    value: 'DISABLED_CHILD_PARENT',
    title: 'Родитель ребенка-инвалида',
    subtitle: 'Есть ребенок с инвалидностью'
  }
]);

const step = ref(0);
const selectedBenefits = ref<string[]>([]);
const selectedMode = ref<'simple' | 'default' | null>(null);
const isEsiaModalOpen = ref(false);
const isEsiaWarmup = ref(false);
let esiaTimer: ReturnType<typeof setTimeout> | null = null;
const finishing = ref(false);
const finishError = ref('');
const activeHeroIndex = ref(0);
const activeHero = computed(() => heroImages[activeHeroIndex.value]);
const pinValue = ref('');
const pinComplete = computed(() => pinValue.value.length === 4);

const progress = computed(() => ((step.value + 1) / steps.length) * 100);

// const handleClose = () => {
//   isEsiaModalOpen.value = false;
//   emit('close');
// };
const handlePrimary = () => emit('primary');
const handleSimple = () => emit('simple');

const goToStep = (nextStep: number) => {
  if (nextStep < 0 || nextStep >= steps.length) return;
  step.value = nextStep;
};

const goBack = () => goToStep(step.value - 1);
const startFlow = () => goToStep(1);
const goToSecurity = () => {
  pinValue.value = '';
  finishError.value = '';
  goToStep(4);
};

const toggleBenefit = (value: string) => {
  if (selectedBenefits.value.includes(value)) {
    selectedBenefits.value = selectedBenefits.value.filter(
      item => item !== value
    );
  } else {
    selectedBenefits.value = [...selectedBenefits.value, value];
  }
};

const proceedFromBenefits = () => {
  goToStep(2);
};

const openEsia = () => {
  if (esiaTimer) {
    clearTimeout(esiaTimer);
  }
  isEsiaWarmup.value = true;
  esiaTimer = setTimeout(() => {
    isEsiaWarmup.value = false;
    isEsiaModalOpen.value = true;
  }, 2000);
};
const closeEsiaModal = () => {
  if (esiaTimer) {
    clearTimeout(esiaTimer);
  }
  isEsiaWarmup.value = false;
  isEsiaModalOpen.value = false;
};
const handleEsiaSubmit = () => {
  if (esiaTimer) {
    clearTimeout(esiaTimer);
  }
  isEsiaModalOpen.value = false;
  goToStep(3);
};

const selectMode = (mode: 'simple' | 'default') => {
  selectedMode.value = mode;
};

const handlePinDigit = (digit: string) => {
  if (pinValue.value.length >= 4) return;
  pinValue.value += digit;
  finishError.value = '';
};

const handlePinDelete = () => {
  pinValue.value = pinValue.value.slice(0, -1);
  finishError.value = '';
};

// const finishRegistration = () => {
//   // handled below with async finalize
// };

const finalizeOnboarding = async () => {
  if (!selectedMode.value) return;
  if (!pinComplete.value) {
    finishError.value = 'Введите ПИН-код из 4 цифр';
    return;
  }
  finishError.value = '';
  finishing.value = true;
  try {
    await biometricStore.setPin(pinValue.value);
    const withBenefits = await userApi.updateUserCategories(
      selectedBenefits.value
    );
    userStore.setUser(withBenefits);
    // Обновляем профиль и доступные льготы, чтобы данные синхронизировались
    await Promise.all([
      userStore.getUser(),
      catalogStore.fetchBenefits(true)
    ]);

    if (selectedMode.value === 'simple') {
      handleSimple();
    } else {
      handlePrimary();
    }
  } catch (error: any) {
    finishError.value =
      error?.response?.data?.message ||
      'Не удалось завершить регистрацию. Попробуйте ещё раз.';
  } finally {
    finishing.value = false;
  }
};

// const clearAutoAdvance = () => {
//   if (autoAdvanceTimer) {
//     clearTimeout(autoAdvanceTimer);
//     autoAdvanceTimer = null;
//   }
// };

// const setHeroIndex = (index: number) => {
//   if (index < 0 || index >= heroImages.length) return;
//   activeHeroIndex.value = index;
// };

const nextHero = () => {
  activeHeroIndex.value = (activeHeroIndex.value + 1) % heroImages.length;
};

// const prevHero = () => {
//   activeHeroIndex.value =
//     (activeHeroIndex.value - 1 + heroImages.length) % heroImages.length;
// };
</script>

<template>
  <teleport to="body">
    <div
      v-if="open"
      class="benefit-modal"
    >
      <div class="benefit-modal__body">
        <div class="benefit-modal__grid">
          <aside class="benefit-cover">
            <div class="benefit-cover__meta">
              <div class="meta__item">
                <span class="meta__label"
                  >Шаг {{ step + 1 }} из {{ steps.length }}</span
                >
                <div class="progress">
                  <span class="progress__bar">
                    <span
                      class="progress__fill"
                      :style="{ width: `${progress}%` }"
                    ></span>
                  </span>
                </div>
              </div>
            </div>
          </aside>

          <section class="benefit-panel">
            <div class="panel__steps">
              <button
                v-if="step > 0"
                class="step-chip__back"
                type="button"
                @click="goBack"
              >
                ← Назад
              </button>
            </div>
            <div class="panel__content">
              <!-- Шаг 0: Приветствие -->
              <div
                v-if="step === 0"
                class="panel__card panel__welcome"
              >
                <div class="benefit-cover__logo">
                  <img
                    src="/assets/icons/lasso-icon.svg"
                    alt="LASSO"
                  />
                  <div>
                    <p class="cover__eyebrow">Лассо</p>
                    <h2>Цифровое удостоверение льготника</h2>
                  </div>
                </div>

                <p class="benefit-cover__text">
                  Лассо — цифровое удостоверение льготника. Работает в магазинах
                  и сервисах вашего региона.
                </p>

                <div class="panel__actions">
                  <button
                    class="btn btn--primary"
                    type="button"
                    @click="startFlow"
                  >
                    Начать →
                  </button>
                </div>
                <div class="hero-slider">
                  <div
                    class="hero-slider__frame"
                    @click="nextHero"
                  >
                    <img
                      :src="activeHero"
                      alt="Преимущества Лассо"
                      @click="nextHero"
                    />
                  </div>
                </div>
              </div>

              <!-- Шаг 1: Льготы -->
              <div
                v-else-if="step === 1"
                class="panel__card"
              >
                <div class="panel__heading">
                  <h3>Какая у вас льгота?</h3>
                  <p>Можно выбрать несколько категорий — сохраним в профиле.</p>
                </div>

                <div class="benefit-grid">
                  <button
                    v-for="item in benefitOptions"
                    :key="item.value"
                    type="button"
                    class="option-card"
                    :class="{
                      'option-card--active': selectedBenefits.includes(
                        item.value
                      )
                    }"
                    @click="toggleBenefit(item.value)"
                  >
                    <div class="option-card__top">
                      <div class="option-card__title">{{ item.title }}</div>
                      <span
                        v-if="selectedBenefits.includes(item.value)"
                        class="option-card__check"
                      >
                        ✓
                      </span>
                    </div>
                    <p class="option-card__subtitle">
                      {{ item.subtitle }}
                    </p>
                    <span class="option-card__chevron">→</span>
                  </button>
                </div>

                <div class="panel__actions">
                  <button
                    class="btn btn--primary"
                    type="button"
                    @click="proceedFromBenefits"
                  >
                    Далее
                  </button>
                </div>
              </div>

              <!-- Шаг 2: Госуслуги -->
              <div
                v-else-if="step === 2"
                class="panel__card"
              >
                <div class="panel__heading">
                  <h3>Подтверждение через Госуслуги</h3>
                  <p>
                    Для доступа к вашим официальным льготам требуется
                    подтверждение личности через Госуслуги.
                  </p>
                </div>

                <button
                  class="btn btn--gos"
                  type="button"
                  :disabled="isEsiaWarmup"
                  @click="openEsia"
                >
                  <img
                    src="/assets/icons/gos-low-icon.svg"
                    alt=""
                  />
                  <span v-if="isEsiaWarmup">Загрузка...</span>
                  <span v-else>Войти через Госуслуги</span>
                </button>
                <p
                  v-if="isEsiaWarmup"
                  class="gos-hint"
                >
                  Подождите, открываем окно авторизации…
                </p>
              </div>

              <!-- Шаг 3: Режим -->
              <div
                v-else-if="step === 3"
                class="panel__card"
              >
                <div class="panel__heading">
                  <h3>Выберите режим</h3>
                  <p>Как удобнее начать работу с Лассо?</p>
                </div>

                <div class="mode-grid">
                  <button
                    class="mode-card"
                    :class="{
                      'mode-card--active': selectedMode === 'simple'
                    }"
                    type="button"
                    @click="selectMode('simple')"
                  >
                    <div class="mode-card__badge">Рекомендуем</div>
                    <h4>Простой режим</h4>
                    <p class="mode-card__subtitle">
                      Минимальный интерфейс и подсказки для быстрого старта.
                    </p>
                    <ul class="mode-card__list">
                      <li>минимальный интерфейс</li>
                      <li>подсказки</li>
                      <li>подходит новичкам</li>
                    </ul>
                  </button>

                  <button
                    class="mode-card mode-card--light"
                    :class="{
                      'mode-card--active': selectedMode === 'default'
                    }"
                    type="button"
                    @click="selectMode('default')"
                  >
                    <h4>Обычный режим</h4>
                    <p class="mode-card__subtitle">
                      Полный функционал и быстрый доступ ко всем возможностям.
                    </p>
                    <ul class="mode-card__list">
                      <li>полный функционал</li>
                      <li>быстрый доступ ко всем функциям</li>
                      <li>готовы сразу пользоваться</li>
                    </ul>
                  </button>
                </div>

                <div class="panel__actions panel__actions--end">
                  <button
                    class="btn btn--primary"
                    type="button"
                    :disabled="!selectedMode"
                    @click="goToSecurity"
                  >
                    Далее
                  </button>
                </div>
              </div>

              <!-- Шаг 4: ПИН и биометрия -->
              <div
                v-else-if="step === 4"
                class="panel__card"
              >
                <div class="panel__heading">
                  <h3>Защитите вход</h3>
                  <p>Придумайте ПИН-код — 4 цифры, как на экране блокировки.</p>
                </div>

                <div class="pin-setup">
                  <div class="pin-dots">
                    <span
                      v-for="i in 4"
                      :key="i"
                      :class="['pin-dot', { 'pin-dot--filled': i <= pinValue.length }]"
                    ></span>
                  </div>

                  <div class="pin-numpad">
                    <button
                      v-for="n in ['1', '2', '3', '4', '5', '6', '7', '8', '9']"
                      :key="n"
                      class="pin-numpad__btn"
                      type="button"
                      @click="handlePinDigit(n)"
                    >
                      {{ n }}
                    </button>
                    <button
                      class="pin-numpad__btn pin-numpad__btn--empty"
                      type="button"
                      disabled
                    ></button>
                    <button
                      class="pin-numpad__btn"
                      type="button"
                      @click="handlePinDigit('0')"
                    >
                      0
                    </button>
                    <button
                      class="pin-numpad__btn pin-numpad__btn--delete"
                      type="button"
                      @click="handlePinDelete"
                    >
                      ⌫
                    </button>
                  </div>

                  <p class="pin-setup__note">
                    Face ID / отпечаток можно будет использовать, если
                    поддерживается вашим устройством.
                  </p>
                </div>

                <div class="finish-row">
                  <p
                    v-if="finishError"
                    class="finish-row__error"
                  >
                    {{ finishError }}
                  </p>
                  <button
                    class="btn btn--primary finish-row__cta"
                    type="button"
                    :disabled="!selectedMode || !pinComplete || finishing"
                    @click="finalizeOnboarding"
                  >
                    {{ finishing ? 'Завершаем...' : 'Завершить регистрацию' }}
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      <GosuslugiMockModal
        :open="isEsiaModalOpen"
        @close="closeEsiaModal"
        @submit="handleEsiaSubmit"
      />
    </div>
  </teleport>
</template>

<style scoped lang="scss">
.benefit-modal {
  position: fixed;
  inset: 0;
  z-index: 2000;
  display: flex;
  align-items: stretch;
  justify-content: stretch;
  background: rgba(11, 23, 41, 0.72);
}

.benefit-modal__body {
  position: relative;
  width: 100%;
  height: 100%;
  background: #f7f9ff;
  overflow: auto;
}

.benefit-modal__grid {
  min-height: 100%;
}

.benefit-cover {
  background: linear-gradient(140deg, #1a73e8, #0a4ec2);
  color: #fff;
  padding: 32px 28px;
  display: grid;
  gap: 18px;
  align-content: space-between;
  min-height: 100%;
}

.benefit-cover__logo {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 12px;
  align-items: center;

  img {
    width: 52px;
    height: 52px;
    border-radius: 16px;
    padding: 10px;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.14);
  }

  h2 {
    margin: 0;
    font-size: 24px;
    line-height: 1.25;
  }
}

.benefit-cover__pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.14);
  border: 1px solid rgba(255, 255, 255, 0.24);
  padding: 8px 14px;
  border-radius: 999px;
  font-weight: 700;
  width: fit-content;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.benefit-cover__text {
  margin: 0;
  color: black;
  font-size: 15px;
  line-height: 1.6;
}

.benefit-cover__meta {
  display: grid;
  gap: 12px;
}

.meta__item {
  display: grid;
  gap: 8px;
}

.meta__label {
  color: rgba(255, 255, 255, 0.95);
  font-weight: 700;
}

.meta__muted {
  color: rgba(255, 255, 255, 0.76);
  line-height: 1.5;
}

.progress {
  width: 100%;
}

.progress__bar {
  display: block;
  width: 100%;
  height: 8px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.18);
  overflow: hidden;
}

.progress__fill {
  display: block;
  height: 100%;
  background: linear-gradient(90deg, #d7e9ff, #9dd0ff);
  border-radius: 999px;
  transition: width 0.2s ease;
}

.cover__eyebrow {
  margin: 0 0 2px 0;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.82);
}

.hero-slider {
  display: flex;
  align-items: flex-end;
  /* фиксированная высота области под иллюстрацию */
  height: 250px;
}

.hero-slider__frame {
  position: relative;
  /* одинаковый размер “рамки” для всех step.png */
  width: 260px; // можешь подправить под макет
  height: 220px; // и это тоже
  overflow: visible; // вправо/вверх можно вылезать
}

/* Картинка не тянется под фрейм, а рисуется в натуральном размере,
   привязанная к левому нижнему углу */
.hero-slider__frame img {
  position: absolute;
  bottom: 0;
  width: 100px;

  width: auto;
  height: auto;
  max-width: none;
  max-height: none;

  pointer-events: none; // “не взаимодействует” с остальным UI
}

.hero-slider__arrow {
  border: 1px solid #dfe4f3;
  background: #fff;
  border-radius: 12px;
  width: 38px;
  height: 38px;
  font-weight: 800;
  color: #1a73e8;
  cursor: pointer;
  transition: background 0.15s ease;
}

.hero-slider__arrow:hover {
  background: #f4f6fb;
}

.hero-slider__dots {
  grid-column: 1 / span 3;
  display: flex;
  gap: 8px;
  justify-content: center;
  padding-top: 6px;
}

.hero-slider__dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 1px solid #c7d2e8;
  background: #fff;
  cursor: pointer;
}

.hero-slider__dot--active {
  background: #1a73e8;
  border-color: #1a73e8;
}

.benefit-panel {
  background: #fff;
  padding: 28px;
  display: grid;
  gap: 16px;
  min-height: 100%;
}

.panel__steps {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.step-chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 12px;
  background: #f2f5ff;
  color: #1d2b46;
  font-weight: 700;
  font-size: 14px;
  border: 1px solid #e4e9fb;
  transition: all 0.15s ease;
}

.step-chip__index {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: #e2eaff;
}

.step-chip--active {
  background: #1a73e8;
  color: #fff;
  border-color: #1a73e8;
}

.step-chip--active .step-chip__index {
  background: rgba(255, 255, 255, 0.16);
}

.step-chip--done {
  border-color: #7cc4ff;
  background: #e8f3ff;
}

.step-chip__back {
  margin-left: auto;
  border: none;
  background: transparent;
  font-weight: 700;
  color: #1a73e8;
  cursor: pointer;
  padding: 8px 10px;
}

.panel__card {
  border: 1px solid #e6eaf4;
  border-radius: 20px;
  padding: 20px;
  display: grid;
  gap: 16px;
  background: #fff;
  box-shadow: 0 18px 48px rgba(7, 23, 50, 0.06);
}

.panel__welcome h3 {
  margin: 0;
  font-size: 24px;
}

.panel__lead {
  margin: 0;
  color: #1d2b46;
  font-size: 16px;
  line-height: 1.6;
}

.panel__heading h3 {
  margin: 0 0 6px 0;
  font-size: 22px;
}

.panel__heading p {
  margin: 0;
  color: #6b7280;
}

.panel__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
}

.panel__actions--end {
  justify-content: flex-end;
}

.panel__muted {
  margin: 0;
  color: #6b7280;
  line-height: 1.5;
}

.benefit-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 12px;
}

.option-card {
  border: 1px solid #e6eaf4;
  border-radius: 16px;
  padding: 14px 14px 12px;
  background: #f9fbff;
  text-align: left;
  cursor: pointer;
  transition: all 0.12s ease;
  display: grid;
  gap: 6px;
}

.option-card__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.option-card__title {
  font-weight: 800;
  color: #102a4e;
}

.option-card__subtitle {
  margin: 0;
  color: #516079;
  font-size: 14px;
  line-height: 1.45;
}

.option-card__chevron {
  margin-left: auto;
  color: #1a73e8;
  font-weight: 700;
}

.option-card__check {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #1a73e8;
  color: #fff;
  font-weight: 800;
  font-size: 13px;
}

.option-card--active {
  border-color: #1a73e8;
  background: linear-gradient(135deg, #f1f6ff, #e8f2ff);
  box-shadow: 0 12px 32px rgba(26, 115, 232, 0.15);
}

.gos-card {
  border: 1px solid #d9e1f5;
  border-radius: 16px;
  padding: 16px;
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 12px;
  align-items: center;
  background: linear-gradient(135deg, #f4f6fb, #ffffff);
}

.gos-card__logo {
  background: linear-gradient(90deg, #1a5ad7, #d81b60);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-weight: 800;
  font-size: 20px;
}

.gos-card__text {
  color: #1d2b46;
  line-height: 1.4;
}

.gos-card__text p {
  margin: 0 0 4px 0;
}

.gos-card__hint {
  color: #1a73e8;
  font-weight: 700;
}

.mode-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 14px;
}

.mode-card {
  padding: 18px;
  border-radius: 16px;
  background: #407cad;
  color: #fff;
  display: grid;
  gap: 10px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 16px 42px rgba(26, 115, 232, 0.28);
  border: 4px solid transparent;
  cursor: pointer;
  text-align: left;
}

.mode-card--light {
  background: #f9fbff;
  color: #0f172a;
  border: 2px solid #e1e7f5;
  box-shadow: none;
}

.mode-card--active {
  border-color: #1a73e8;
  box-shadow: 0 18px 44px rgba(26, 115, 232, 0.25);
}

.mode-card__badge {
  width: fit-content;
  padding: 6px 10px;
  background: rgba(255, 255, 255, 0.16);
  border-radius: 999px;
  font-weight: 700;
  font-size: 12px;
}

.mode-card--light .mode-card__badge {
  background: #e7efff;
}

.mode-card h4 {
  margin: 0;
  font-size: 18px;
}

.mode-card__subtitle {
  margin: 0;
  color: rgba(255, 255, 255, 0.86);
  line-height: 1.4;
}

.mode-card--light .mode-card__subtitle {
  color: #45516a;
}

.mode-card__list {
  margin: 0;
  padding-left: 18px;
  display: grid;
  gap: 6px;
  color: rgba(255, 255, 255, 0.9);
}

.mode-card--light .mode-card__list {
  color: #45516a;
}

.pin-setup {
  display: grid;
  gap: 16px;
}

.pin-dots {
  display: flex;
  gap: 12px;
}

.pin-dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 2px solid #cbd5e1;
  background: #fff;
}

.pin-dot--filled {
  background: #1a73e8;
  border-color: #1a73e8;
  box-shadow: 0 0 0 3px rgba(26, 115, 232, 0.15);
}

.pin-numpad {
  display: grid;
  grid-template-columns: repeat(3, minmax(64px, 1fr));
  gap: 10px;
}

.pin-numpad__btn {
  border: 1px solid #dfe4f3;
  border-radius: 12px;
  background: #fff;
  font-weight: 800;
  font-size: 18px;
  color: #0f172a;
  padding: 12px 0;
  cursor: pointer;
  transition: background 0.12s ease;
}

.pin-numpad__btn:hover:not(:disabled) {
  background: #f4f6fb;
}

.pin-numpad__btn:disabled {
  cursor: default;
  opacity: 0.6;
}

.pin-numpad__btn--delete {
  color: #1a73e8;
}

.pin-numpad__btn--empty {
  visibility: hidden;
}

.pin-setup__note {
  margin: 0;
  color: #4b5563;
  line-height: 1.5;
}

.finish-row {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 12px;
}

.finish-row__cta {
}

.finish-row__error {
  margin: 0;
  color: #b91c1c;
  font-weight: 700;
}

.btn {
  border: none;
  border-radius: 14px;
  padding: 12px 16px;
  font-weight: 800;
  cursor: pointer;
  transition:
    opacity 0.2s ease,
    transform 0.12s ease,
    box-shadow 0.12s ease;
  font-size: 14px;
}

.btn:hover {
  opacity: 0.95;
}

.btn:active {
  transform: translateY(1px);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn--primary {
  background: linear-gradient(135deg, #1a73e8, #0a4ec2);
  color: #fff;
  box-shadow: 0 12px 28px rgba(26, 115, 232, 0.35);
}

.btn--ghost {
  background: #f4f6fb;
  color: #1d2b46;
  border: 1px solid #dfe4f3;
}

.btn--gos {
  margin-top: 30px;
  color: #0d4cd3;
  background-color: #fff;
  border: #516079 1px solid;
  border-radius: 8px;
  border: 1px solid #0d4cd3;
  padding: 0px;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 8px 8px;
  gap: 20px;
  font-weight: 400;

  img {
    width: 30px;
    height: 30px;
    border: 16px;
  }
}

.gos-hint {
  margin: 4px 0 0 0;
  color: #6b7280;
  font-size: 14px;
}

.eyebrow {
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #6b7a96;
  font-weight: 800;
  font-size: 12px;
}

@media (max-width: 1100px) {
  .benefit-modal__grid {
    grid-template-columns: 1fr;
  }

  .benefit-cover {
    height: auto;
  }
}

@media (max-width: 720px) {
  .benefit-panel {
    padding: 18px;
  }

  .benefit-cover {
    padding: 22px 18px;
  }

  .panel__actions {
    flex-direction: column;
    align-items: stretch;

    .btn {
      width: 100%;
      justify-content: center;
    }
  }

  .finish-row {
    justify-content: stretch;
  }

  .finish-row__cta {
    width: 100%;
  }
}
</style>
