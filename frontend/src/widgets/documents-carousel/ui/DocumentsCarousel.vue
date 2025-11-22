<script setup lang="ts">
import { Card } from '@shared/types/card';
import { Carousel } from '@shared/ui';
import { computed, ref, watch, onBeforeUnmount } from 'vue';

type OfficeCard = Card & {
  address: string;
  hours: string;
  mapUrl: string;
};

const offices: OfficeCard[] = [
  {
    bannerName: '2',
    title: 'МФЦ — Аммосова',
    subtitle: 'ул. Аммосова, 18',
    tags: ['Пн–Сб', '08:00–20:00'],
    address: 'Якутск, улица Аммосова, 18',
    hours: 'Понедельник–Суббота: 08:00–20:00',
    mapUrl:
      'https://yandex.ru/map-widget/v1/?ll=129.7326%2C62.0247&z=16&pt=129.7326,62.0247,pm2rdm'
  },
  {
    bannerName: '2',
    title: 'МФЦ — Кирова',
    subtitle: 'просп. Ленина, 15/1',
    tags: ['Пн–Сб', '09:00–19:00'],
    address: 'Якутск, проспект Ленина, 15/1',
    hours: 'Понедельник–Суббота: 09:00–19:00',
    mapUrl:
      'https://yandex.ru/map-widget/v1/?ll=129.7305%2C62.0315&z=16&pt=129.7305,62.0315,pm2rdm'
  },
  {
    bannerName: '2',
    title: 'МФЦ — Автодорожный округ',
    subtitle: 'ул. Халтурина, 38',
    tags: ['Пн–Сб', '10:00–18:00'],
    address: 'Якутск, улица Халтурина, 38',
    hours: 'Понедельник–Суббота: 10:00–18:00',
    mapUrl:
      'https://yandex.ru/map-widget/v1/?ll=129.6986%2C62.0221&z=16&pt=129.6986,62.0221,pm2rdm'
  }
];

const cards = offices.map(({ bannerName, title, subtitle, tags }) => ({
  bannerName,
  title,
  subtitle,
  tags
}));

const selectedOffice = ref<OfficeCard | null>(null);
const isModalOpen = computed(() => !!selectedOffice.value);

const handleSelect = (card: Card) => {
  const office = offices.find(item => item.title === card.title);
  selectedOffice.value = office ?? null;
};

watch(isModalOpen, open => {
  const body = document.body;
  if (!body) return;
  if (open) {
    body.style.overflow = 'hidden';
  } else {
    body.style.overflow = '';
  }
});

onBeforeUnmount(() => {
  const body = document.body;
  if (body) {
    body.style.overflow = '';
  }
});

const closeModal = () => {
  selectedOffice.value = null;
};
</script>
<template>
  <div>
    <Carousel
      :cards="cards"
      @select="handleSelect"
    />

    <teleport to="body">
      <transition name="fade">
        <div
          v-if="isModalOpen && selectedOffice"
          class="office-modal"
        >
          <div
            class="office-modal__backdrop"
            @click="closeModal"
          />
          <div class="office-modal__content">
            <button
              class="office-modal__close"
              type="button"
              @click="closeModal"
            >
              ✕
            </button>
            <h3>{{ selectedOffice.title }}</h3>
            <p class="office-modal__address">{{ selectedOffice.address }}</p>
            <p class="office-modal__hours">{{ selectedOffice.hours }}</p>
            <iframe
              class="office-modal__map"
              :src="selectedOffice.mapUrl"
              title="Карта МФЦ"
              allowfullscreen
            />
          </div>
        </div>
      </transition>
    </teleport>
  </div>
</template>
<style lang="scss" scoped>
.office-modal {
  position: fixed;
  inset: 0;
  z-index: 1100;
  display: flex;
  align-items: center;
  justify-content: center;

  &__backdrop {
    position: absolute;
    inset: 0;
    background: rgba(15, 23, 42, 0.45);
    backdrop-filter: blur(2px);
  }

  &__content {
    position: relative;
    width: min(520px, calc(100% - 32px));
    background: #fff;
    border-radius: 20px;
    padding: 24px;
    z-index: 1101;
    box-shadow: 0 20px 40px rgba(15, 23, 42, 0.2);
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  &__close {
    position: absolute;
    top: 12px;
    right: 12px;
    border: none;
    background: transparent;
    font-size: 1.1rem;
    cursor: pointer;
  }

  &__address {
    margin: 0;
    font-weight: 600;
  }

  &__hours {
    margin: 0;
    color: #475467;
  }

  &__map {
    width: 100%;
    height: 320px;
    border: none;
    border-radius: 12px;
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
