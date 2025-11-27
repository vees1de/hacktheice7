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
      <div
        class="benefit-modal__backdrop"
        @click="handleBackdrop"
      />
      <div class="benefit-modal__body">
        <button
          class="benefit-modal__close"
          type="button"
          aria-label="Закрыть"
          @click="handleBackdrop"
        >
          ✕
        </button>
        <div class="benefit-modal__hero">
          <p class="eyebrow">Добро пожаловать</p>
          <h2>{{ title || 'Начнем с персональных льгот' }}</h2>
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
          <p class="quick__title">Быстрые шаги</p>
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
  display: block;
  z-index: 2000;
}

.benefit-modal__backdrop {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 20% 20%, rgba(14, 165, 233, 0.16), transparent 40%),
    radial-gradient(circle at 80% 0%, rgba(16, 185, 129, 0.1), transparent 38%),
    rgba(15, 23, 42, 0.8);
  backdrop-filter: blur(12px);
}

.benefit-modal__body {
  position: relative;
  min-height: 100vh;
  padding: 24px 20px 32px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  color: #0b1729;
  background: linear-gradient(135deg, #f8fbff 0%, #eef4ff 48%, #f7fffb 100%);
  overflow-y: auto;
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
  cursor: pointer;
  transition: transform 0.15s ease, background 0.15s ease;

  &:active {
    background: #f1f5f9;
    transform: scale(0.96);
  }
}

.benefit-modal__hero {
  display: grid;
  gap: 12px;
  padding-top: 16px;

  h2 {
    margin: 0;
    font-size: 26px;
    line-height: 1.2;
  }
}

.eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #0284c7;
  font-weight: 800;
  font-size: 13px;
}

.hero__text {
  margin: 0;
  color: #475467;
  font-size: 16px;
}

.benefit-modal__actions {
  display: grid;
  gap: 10px;
  grid-template-columns: 1fr;
  width: min(520px, 100%);
}

.btn {
  border: none;
  border-radius: 14px;
  padding: 14px 16px;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 0.9;
  }
}

.btn--primary {
  background: linear-gradient(135deg, #0f766e, #0ea5e9);
  color: #fff;
}

.btn--simple {
  background: #0f172a;
  color: #fff;
  border: 1px solid #0f172a;
}

.btn--ghost {
  background: #f4f6fb;
  color: #1f2937;
  border: 1px solid #e2e8f0;
}

.benefit-modal__quick {
  background: rgba(255, 255, 255, 0.9);
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

.quick__grid {
  display: grid;
  gap: 12px;
  grid-template-columns: 1fr;
}

.quick-card {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 12px;
  align-items: center;
  padding: 12px;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
  background: linear-gradient(120deg, rgba(226, 232, 240, 0.45), #fff);
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

@media (min-width: 720px) {
  .benefit-modal__body {
    padding: 36px 48px;
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
</style>
