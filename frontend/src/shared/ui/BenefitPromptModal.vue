<script setup lang="ts">
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

const handleBackdrop = () => emit('close');
const handlePrimary = () => emit('primary');
const handleSimple = () => emit('simple');
</script>

<template>
  <teleport to="body">
    <div
      v-if="open"
      class="benefit-modal"
    >
      <div class="benefit-modal__body">
        <div class="benefit-modal__glow benefit-modal__glow--one"></div>
        <div class="benefit-modal__glow benefit-modal__glow--two"></div>
        <button
          class="benefit-modal__close"
          type="button"
          aria-label="Закрыть"
          @click="handleBackdrop"
        >
          x
        </button>
        <div class="benefit-modal__content">
          <div class="benefit-modal__hero">
            <div class="hero__pill">Новичкам в LASSO</div>
            <div class="hero__header">
              <img
                class="hero__logo"
                src="/assets/icons/lasso-icon.svg"
                alt="LASSO"
              />
              <div>
                <p class="eyebrow">Добро пожаловать</p>
                <h2>{{ title || 'Начнем с персональных льгот' }}</h2>
              </div>
            </div>
            <p class="hero__text">
              {{
                description ||
                'Отметьте категории, включите подсказки в простом режиме и мгновенно переходите к нужным разделам.'
              }}
            </p>
            <div class="benefit-modal__actions">
              <button
                class="btn btn--primary"
                type="button"
                @click="handlePrimary"
              >
                {{ primaryLabel || 'Выбрать льготы' }}
              </button>
              <button
                class="btn btn--simple"
                type="button"
                @click="handleSimple"
              >
                {{ simpleLabel || 'Включить простой режим' }}
              </button>
              <button
                class="btn btn--ghost"
                type="button"
                @click="handleBackdrop"
              >
                {{ secondaryLabel || 'Позже' }}
              </button>
            </div>
          </div>

          <div class="benefit-modal__quick">
            <div class="quick__header">
              <p class="quick__title">Быстрый старт</p>
              <p class="quick__subtitle">Что можно сделать за пару касаний</p>
            </div>
            <div class="quick__grid">
              <div
                class="quick-card"
                v-for="item in [
                  {
                    title: 'Подобрать льготы',
                    desc: 'Подскажем, что вам доступно прямо сейчас.',
                    icon: '/assets/icons/shield-icon.svg'
                  },
                  {
                    title: 'Показать удостоверение',
                    desc: 'QR для подтверждения льгот в одном касании.',
                    icon: '/assets/icons/user-icon.svg'
                  },
                  {
                    title: 'Открыть чат-бот',
                    desc: 'Спросите про выплаты, документы и статусы.',
                    icon: '/assets/icons/chat-icon.svg'
                  },
                  {
                    title: 'Найти акции и выгоды',
                    desc: 'Скидки и бонусы, подобранные под вас.',
                    icon: '/assets/icons/sale-icon.svg'
                  }
                ]"
                :key="item.title"
              >
                <div class="quick-card__icon">
                  <img
                    :src="item.icon"
                    :alt="item.title"
                  />
                </div>
                <div class="quick-card__text">
                  <p class="quick-card__title">{{ item.title }}</p>
                  <p class="quick-card__desc">{{ item.desc }}</p>
                </div>
                <div class="quick-card__chevron">></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </teleport>
</template>

<style scoped lang="scss">
.benefit-modal {
  position: fixed;
  inset: 0;
  z-index: 2000;
  display: flex;
  justify-content: center;
  align-items: stretch;
  background: rgba(15, 23, 42, 0.55); // полупрозрачный фон под модалкой
  overflow: hidden; // чтобы не было двойного скролла по краям
}

.benefit-modal__body {
  position: relative;
  padding: 24px 16px 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  color: #0b1729;
  background: linear-gradient(135deg, #f8fbff 0%, #eef4ff 48%, #f7fffb 100%);

  max-height: 100vh; // << ключевое
  width: 100%;
  overflow-y: auto; // << внутри модалки теперь скролл
  -webkit-overflow-scrolling: touch; // приятный скролл на iOS
}
.benefit-modal__close {
  position: absolute;
  right: 14px;
  top: 14px;
  width: 36px;
  height: 36px;
  border-radius: 12px;
  border: 1px solid #d6d9e0;
  background: #fff;
  font-size: 18px;
  font-weight: 700;
  color: #0f172a;
  z-index: 2001;
  cursor: pointer;
  transition:
    transform 0.15s ease,
    background 0.15s ease;

  &:active {
    background: #f1f5f9;
    transform: scale(0.96);
  }
}

.benefit-modal__glow {
  position: absolute;
  filter: blur(80px);
  opacity: 0.45;
  pointer-events: none;
}

.benefit-modal__glow--one {
  width: 240px;
  height: 240px;
  background: #0ea5e9;
  top: 10%;
  left: 12%;
}

.benefit-modal__glow--two {
  width: 280px;
  height: 280px;
  background: #10b981;
  bottom: 4%;
  right: 10%;
}

.benefit-modal__content {
  position: relative;
  z-index: 1;
  width: min(1100px, 100%);
  display: grid;
  gap: 18px;
}

.benefit-modal__hero {
  display: grid;
  gap: 12px;
  padding: 18px;
  border-radius: 20px;
  background: linear-gradient(
    140deg,
    rgba(15, 23, 42, 0.9),
    #0f172a 55%,
    #0b1729 100%
  );
  color: #fff;
  box-shadow: 0 18px 42px rgba(15, 23, 42, 0.35);

  h2 {
    margin: 0;
    font-size: 26px;
    line-height: 1.2;
    color: #fff;
  }
}

.hero__header {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 12px;
  align-items: center;
}

.hero__logo {
  width: 46px;
  height: 46px;
  border-radius: 12px;
  padding: 8px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.hero__pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.18);
  color: #e0f2fe;
  border-radius: 999px;
  padding: 6px 12px;
  font-weight: 700;
  width: fit-content;
}

.eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #7dd3fc;
  font-weight: 800;
  font-size: 13px;
  margin: 0 0 2px 0;
}

.hero__text {
  margin: 0;
  color: rgba(255, 255, 255, 0.82);
  font-size: 16px;
}

.benefit-modal__actions {
  display: grid;
  gap: 10px;
  grid-template-columns: 1fr;
  width: min(560px, 100%);
}

.btn {
  border: none;
  border-radius: 14px;
  padding: 14px 16px;
  font-weight: 700;
  cursor: pointer;
  transition:
    opacity 0.2s ease,
    transform 0.12s ease,
    box-shadow 0.12s ease;

  &:hover {
    opacity: 0.9;
  }

  &:active {
    transform: translateY(1px);
    box-shadow: none;
  }
}

.btn--primary {
  background: linear-gradient(135deg, #0f766e, #0ea5e9);
  color: #fff;
  box-shadow: 0 12px 32px rgba(14, 165, 233, 0.35);
}

.btn--simple {
  background: #0f172a;
  color: #fff;
  border: 1px solid #0f172a;
  box-shadow: 0 10px 28px rgba(15, 23, 42, 0.35);
}

.btn--ghost {
  background: #f4f6fb;
  color: #1f2937;
  border: 1px solid #e2e8f0;
}

.benefit-modal__quick {
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid #e2e8f0;
  border-radius: 18px;
  padding: 16px;
  box-shadow: 0 18px 48px rgba(0, 0, 0, 0.06);
  display: grid;
  gap: 16px;
}

.quick__title {
  margin: 0;
  font-weight: 800;
  color: #0f172a;
}

.quick__subtitle {
  margin: 0;
  color: #475467;
}

.quick__header {
  display: grid;
  gap: 2px;
}

.quick__grid {
  display: grid;
  gap: 12px;
  grid-template-columns: 1fr;
}

.quick-card {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 12px;
  align-items: center;
  padding: 12px;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
  background: linear-gradient(120deg, rgba(226, 232, 240, 0.38), #fff);
  box-shadow: 0 10px 28px rgba(15, 23, 42, 0.06);
}

.quick-card__icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: #0f172a;
  display: grid;
  place-items: center;

  img {
    width: 24px;
    height: 24px;
  }
}

.quick-card__text {
  display: grid;
  gap: 4px;
}

.quick-card__title {
  margin: 0;
  font-weight: 700;
  color: #0f172a;
}

.quick-card__desc {
  margin: 0;
  color: #475467;
  font-size: 14px;
}

.quick-card__chevron {
  font-weight: 800;
  color: #0f172a;
  font-size: 18px;
}

@media (min-width: 720px) {
  .benefit-modal__body {
    padding: 36px 32px 48px;
  }

  .benefit-modal__actions {
    grid-template-columns: repeat(3, max-content);
    align-items: center;
    gap: 12px;

    .btn {
      min-width: 180px;
      justify-content: center;
    }
  }

  .quick__grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 960px) {
  .benefit-modal__body {
    padding: 46px 40px 64px;
  }

  .benefit-modal__content {
    gap: 22px;
  }

  .benefit-modal__hero {
    padding: 24px;
    grid-template-columns: 1fr;
  }

  .benefit-modal__actions {
    grid-template-columns: repeat(3, max-content);
  }
}
</style>
