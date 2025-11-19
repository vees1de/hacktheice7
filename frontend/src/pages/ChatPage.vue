<script setup lang="ts">
import {
  type SmartSearchItem,
  type SmartSearchResponse,
  smartSearchApi
} from '@entities/smart-search/api/smart-search.api';
import { computed, nextTick, ref } from 'vue';

type ChatMessage = {
  id: number;
  role: 'user' | 'bot';
  text: string;
  items?: SmartSearchItem[];
  meta?: string;
};

const messages = ref<ChatMessage[]>([
  {
    id: Date.now(),
    role: 'bot',
    text: 'Привет! Я чат-бот Лассо и помогу найти нужные льготы. Расскажите, что именно ищете или опишите свою ситуацию.'
  }
]);

const inputValue = ref('');
const isSending = ref(false);
const chatBody = ref<HTMLElement | null>(null);

const hasMessages = computed(() => messages.value.length > 0);

const scrollToBottom = async () => {
  await nextTick();
  const el = chatBody.value;
  if (el) {
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }
};

const appendMessage = (msg: ChatMessage) => {
  messages.value.push({
    ...msg,
    id: Date.now() + Math.random()
  });
  scrollToBottom();
};

const handleSmartSearchResponse = (payload: SmartSearchResponse) => {
  const text =
    payload.answer_final?.trim() ||
    payload.answer_ru?.trim() ||
    'Не смог найти подходящих льгот, попробуйте уточнить вопрос.';
  appendMessage({
    role: 'bot',
    text,
    items: payload.items || [],
    meta: payload.items?.length ? 'Топ подходящих льгот' : undefined,
    id: 0
  });
};

const sendMessage = async () => {
  if (!inputValue.value.trim() || isSending.value) return;
  const text = inputValue.value.trim();
  appendMessage({
    role: 'user',
    text,
    id: 0
  });
  inputValue.value = '';
  isSending.value = true;

  try {
    const response = await smartSearchApi.search(text);
    handleSmartSearchResponse(response);
  } catch (error: any) {
    appendMessage({
      role: 'bot',
      text:
        error?.response?.data?.message ||
        'Не удалось выполнить поиск. Попробуйте позже.',
      id: 0
    });
  } finally {
    isSending.value = false;
  }
};

const handleKeyPress = (event: KeyboardEvent) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    sendMessage();
  }
};
</script>

<template>
  <div class="chat-page">
    <header class="chat-header">
      <div>
        <p class="chat-header__title">Чат-Бот Лассо</p>
        <p class="chat-header__subtitle">Задайте вопрос — я подскажу льготы</p>
      </div>
    </header>

    <div class="chat-area">
      <div
        class="chat-body"
        ref="chatBody"
      >
        <template v-if="hasMessages">
          <div
            v-for="message in messages"
            :key="message.id"
            class="chat-message"
            :class="
              message.role === 'user'
                ? 'chat-message--user'
                : 'chat-message--bot'
            "
          >
            <p
              class="chat-message__text"
              v-html="message.text.replace(/\n/g, '<br/>')"
            />

            <div
              v-if="message.items && message.items.length"
              class="cards"
            >
              <p class="cards__title">{{ message.meta }}</p>
              <article
                class="benefit-card"
                v-for="item in message.items"
                :key="item.id"
              >
                <p class="benefit-card__title">{{ item.title }}</p>
                <p class="benefit-card__type">{{ item.type }}</p>
                <p class="benefit-card__hint">
                  Действует до {{ item.valid_to || '—' }}
                </p>
                <p
                  v-if="item.categories?.length"
                  class="benefit-card__tags"
                >
                  {{ item.categories.join(', ') }}
                </p>
              </article>
            </div>
          </div>
        </template>
      </div>

      <div class="chat-input">
        <textarea
          v-model="inputValue"
          class="chat-textarea"
          placeholder="Как тебе помочь?"
          rows="2"
          @keydown="handleKeyPress"
        />
        <button
          class="send-btn"
          :disabled="isSending"
          @click="sendMessage"
        >
          {{ isSending ? '...' : 'Отправить' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.chat-page {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  height: calc(100vh - 140px);
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-radius: 16px;
  background: #f4f6fb;
  border: 1px solid #dfe4f2;

  &__title {
    margin: 0;
    font-weight: 700;
    font-size: 1.1rem;
  }

  &__subtitle {
    margin: 4px 0 0;
    font-size: 0.9rem;
    color: #6b7280;
  }
}

.chat-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 24px 24px 12px 12px;
  border: 1px solid #e5e7eb;
  overflow: hidden;
}

.chat-body {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  background: #f8f9fb;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.chat-message {
  max-width: 90%;
  padding: 12px 14px;
  border-radius: 18px;
  line-height: 1.4;
  font-size: 0.95rem;

  &--user {
    align-self: flex-end;
    background: #1a73e8;
    color: #fff;
    border-bottom-right-radius: 4px;
  }

  &--bot {
    align-self: flex-start;
    background: #fff;
    border: 1px solid #e5e7eb;
    box-shadow:
      0 10px 30px rgba(15, 23, 42, 0.08),
      inset 0 0 0 1px rgba(255, 255, 255, 0.6);
    border-bottom-left-radius: 4px;
  }
}

.chat-message__text {
  margin: 0;
  white-space: pre-wrap;
}

.cards {
  margin-top: 12px;
  display: grid;
  gap: 8px;

  &__title {
    margin: 0;
    font-weight: 600;
    font-size: 0.9rem;
    color: #4b5563;
  }
}

.benefit-card {
  border: 1px solid #d9dcee;
  border-radius: 14px;
  padding: 10px 12px;
  background: #f5f6ff;

  &__title {
    margin: 0;
    font-weight: 600;
  }

  &__type {
    margin: 2px 0 0;
    font-size: 0.85rem;
    color: #334155;
  }

  &__hint {
    margin: 4px 0;
    font-size: 0.8rem;
    color: #6b7280;
  }

  &__tags {
    margin: 0;
    font-size: 0.8rem;
    color: #1d4ed8;
  }
}

.chat-input {
  padding: 12px;
  border-top: 1px solid #e2e8f0;
  background: #fff;
  display: flex;
  gap: 12px;
}

.chat-textarea {
  flex: 1;
  resize: none;
  border: 1px solid #d1d5db;
  border-radius: 16px;
  padding: 12px;
  font-size: 1rem;
  outline: none;
  font-family: inherit;

  &:focus {
    border-color: #2563eb;
    box-shadow: 0 0 0 1px rgba(37, 99, 235, 0.3);
  }
}

.send-btn {
  border: none;
  background: #1a73e8;
  color: #fff;
  border-radius: 16px;
  padding: 0 20px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;

  &:disabled {
    opacity: 0.6;
    cursor: default;
  }
}

@media (max-width: 768px) {
  .chat-page {
    padding: 8px;
    height: calc(100vh - 180px);
  }

  .chat-message {
    max-width: 100%;
  }
}
</style>
