# Admin UI

## Описание
Одностраничное приложение для партнёров и кассиров. Интерфейс позволяет
авторизоваться по телефону/паролю, просматривать список клиентов, считывать
QR-токены и работать с офферами. Приложение собирается через Vite и
доставляется как статический бандл (есть `Dockerfile` и `docker-compose.yml` для
прод/стейджинга).

## Стек
- Vue 3 + `<script setup>`.
- Vite 5 (сборка, local dev server).
- Pinia (глобальное состояние авторизации).
- Vue Router 4.
- Axios (HTTP клиент с interceptor’ами для токена).

## Архитектура каталога
- `src/api/` — обёртки над REST методами, базовый клиент в `api/index.js`.
- `src/pages/` — отдельные страницы (Login, Dashboard, Analytics и т.д.).
- `src/components/` — переиспользуемые UI блоки (Sidebar, HeaderBar, пр.).
- `src/stores/` — Pinia стора `auth`.
- `docker-compose.yml`, `Dockerfile`, `nginx.conf` — инфраструктурные шаблоны.

## Переменные окружения
Создайте файл `.env` в каталоге `admin/` (есть пример `.env.example`):

| Переменная | Значение по умолчанию | Описание |
| --- | --- | --- |
| `VITE_ADMIN_API_BASE` | `https://bims14.ru/api` | Базовый URL REST API. На dev укажите `http://localhost:8000/api`. |

Переменная попадёт в `import.meta.env` и будет использована в `src/api/index.js`.

## Запуск и сборка
```bash
cd admin
npm ci
cp .env.example .env  # при необходимости поменяйте адрес backend
npm run dev           # http://localhost:3001
```

Дополнительно:
- `npm run build` — production сборка в `dist/`.
- `npm run preview` — локальный просмотр готовой сборки.
- `docker compose up --build` — запуск согласно `docker-compose.yml` (Nginx
  пробрасывает порт 3001 и отдаёт статику).

## Советы по разработке
- Перезагружайте страницу после смены API базового URL (Vite подтягивает env
  при старте dev-сервера).
- Локально backend должен разрешать CORS с `http://localhost:3001`.
- Токен админа лежит в `localStorage` под ключом `adminAccessToken`; для сброса
  достаточно очистить storage или выйти из учётной записи.

## Troubleshooting
- **Видите только белый экран** — убедитесь, что приложение доступно по
  `http://localhost:3001/admin/`. При другом base-path обновите `vite.config.js`.
- **401 сразу после логина** — проверьте правильность `VITE_ADMIN_API_BASE` и
  что backend раздаёт CORS/сессии для данного origin.
- **API запросы идут на прод URL** — удалите старый `dist/` перед сборкой или
  задайте переменную окружения перед `npm run build` (`VITE_ADMIN_API_BASE=...`).
