# Frontend Portal

## Описание
SPA для граждан, которые проходят онбординг, подтверждают телефон по SMS,
просматривают свои льготы и сохраняют интересующие офферы. UI построен по
feature-sliced архитектуре, поддерживает мобильный сценарий и общается с
backend через REST API (`/api`).

## Стек
- Vue 3 + TypeScript + `<script setup>`.
- Vite 5 (dev server и сборка).
- Pinia (хранение auth state и профиля) + Vue Router 4.
- Axios (HTTP слой с interceptors и auto-refresh токенов).
- Sass, maska, qrcode, PWA-плагин для оффлайн поддержки.

## Архитектура каталога
- `src/app` — инициализация приложения, роутер и глобальные плагины.
- `src/pages` — крупные страницы (Auth, Registration, Home, Chat, пр.).
- `src/entities` и `src/features` — слой бизнес-сущностей и модулей.
- `src/shared` — UI-компоненты, API-клиенты, сторы, утилиты и типы.
- `src/widgets` — составные блоки (например, ввод SMS-кода, QR-шейт).

## Переменные окружения
Создайте `.env` (есть пример `.env.example`):

| Переменная | Значение по умолчанию | Описание |
| --- | --- | --- |
| `VITE_API_BASE` | `https://bims14.ru/api/` | Базовый URL backend. Для локалки используйте `http://localhost:8000/api/`. |

Переменная используется в `src/shared/api/http.client.ts`. После изменения
перезапустите dev сервер Vite.

## Установка и запуск
```bash
cd frontend
npm ci
cp .env.example .env
npm run dev           # http://localhost:3000
```

Полезные скрипты:
- `npm run build` — production сборка в `dist/`.
- `npm run preview` — предпросмотр собранного бандла.

## Работа с аутентификацией
- Токены сохраняются через `@shared/api/token.service` (localStorage).
- `authApi.login` автоматически обновляет `access`/`refresh`, а интерцептор в
  `http.client.ts` обновляет токены при 401.
- Регистрация и подтверждение телефона разделены на два шага (данные
  сохраняются во временных `registration_request`).

## Советы по разработке
- Для корректной работы форм заполните справочники регионов (`regionApi`).
- API ожидает телефоны в формате `79XXXXXXXXX`; маскировка реализована в
  `shared/ui/InputComponent`.
- При работе с PWA/кэшем после замены API стоит очистить service worker
  (DevTools → Application → Service Workers).

## Troubleshooting
- **401/403 после логина** — убедитесь, что backend слушает `http://localhost:8000`
  и в `.env` указан правильный `VITE_API_BASE` (со слэшем в конце).
- **Вечный лоадер на регистрации** — проверьте, что региональный список
  возвращает данные (`regionApi.getAll`). Без активного backend шаг 1 не
  завершится.
- **Не подхватываются новые env** — остановите `npm run dev` и запустите его
  заново; Vite читает `.env` только при старте сервера.
