# Backend & SmartSearch

## Описание
Сервис предоставляет HTTP API для пользовательского портала и кассового
интерфейса. В монолите на NestJS реализованы: регистрация по телефону,
аутентификация по JWT, управление профилями и льготами, выгрузка регионов,
управление партнёрскими офферами, а также генерация и валидирование QR/шаринг
токенов. На стороне `smartsearch/` располагается Python‑скрипт, который по
натуральному запросу ищет релевантные льготы, переводит запрос/ответ через
Yandex Cloud и возвращает результат обратно в API.

## Технологический стек
- Node.js 20 + NestJS 11 (REST API, DI, пайпы/гварды).
- Prisma 6 + PostgreSQL (ORM, миграции, сиды, связь с Python через ту же БД).
- Argon2 для хеширования паролей, JWT для авторизации.
- Python 3.11 + asyncpg + requests (интеллектуальный поиск и интеграция с
  Yandex Cloud Translate/LLM).

## Архитектура
- **Модули**: `auth`, `user`, `benefit`, `offer`, `beneficiary-category`,
  `region`, `admin`, `smart-search`.
- **Prisma** описывает схему (`prisma/schema.prisma`), хранит миграции и сиды.
- **SmartSearchService** в Nest запускает Python‑скрипт `benefit_search.py`,
  передаёт в него текст, а затем отдаёт результат в GraphQL/REST слой.
- **Python** загружает данные напрямую из той же базы, делает семантический
  анализ запроса и перевод (через `YANDEX_API_KEY` / `YANDEX_FOLDER_ID`).

## Требования к окружению
- Node.js >= 20, npm >= 10.
- PostgreSQL 14+.
- Python >= 3.10 с поддержкой virtualenv.

## Переменные окружения
Создайте файл `backend/.env` (можно взять за основу `backend/.env.example`,
его считывает `ConfigModule.forRoot()`):

| Переменная | Описание |
| --- | --- |
| `DATABASE_URL` | строка подключения Prisma к PostgreSQL. |
| `JWT_SECRET` | секрет для подписи access/refresh токенов. |
| `SMART_SEARCH_PYTHON` _(опционально)_ | абсолютный путь до интерпретатора Python, если его нужно переопределить (по умолчанию `smartsearch/python/venv/bin/python`). |

Для Python‑части нужен отдельный `.env` в `backend/smartsearch/python/`:

| Переменная | Описание |
| --- | --- |
| `DATABASE_URL` | тот же DSN, что и в Nest (asyncpg читает льготы напрямую). |
| `YANDEX_API_KEY` | ключ Yandex Cloud Translate/LLM. |
| `YANDEX_FOLDER_ID` | ID каталога в Yandex Cloud. |

> **Важно:** файл `.env` в Python загружается через `python-dotenv`, поэтому он
> обязателен для работы интеллектуального поиска. Без него запросы SMART search
> будут завершаться ошибкой.

## Установка и подготовка БД
```bash
cd backend
npm ci

# применяем миграции и сиды
npx prisma migrate dev
npm run prisma:seed

# настраиваем Python виртуальное окружение
cd smartsearch/python
python3 -m venv venv
source venv/bin/activate  # Windows: venv\\Scripts\\activate
pip install -r requirements.txt
cp .env.example .env      # создайте и заполните вручную, если файла нет
```

Убедитесь, что в `.env` Node указана переменная `SMART_SEARCH_PYTHON`, если
венв лежит не по умолчанию. Пример: `SMART_SEARCH_PYTHON=/path/to/venv/bin/python`.

## Режимы запуска
- **Development**: `npm run start:dev` — запускает Nest в watch‑режиме.
- **Production**: `npm run build && npm run start:prod` — собирает и запускает
  скомпилированный `dist/`.
- **Docker**: используйте `docker-compose.yaml` для локального запуска вместе с
  PostgreSQL, либо `Dockerfile` для сборки образа.

API по умолчанию слушает `http://localhost:8000/api`. CORS открыт для
`http://localhost:3000` (frontend) и `http://localhost:3001` (admin).

## Smart Search вручную
Проверить Python‑скрипт можно отдельно:

```bash
cd backend/smartsearch/python
source venv/bin/activate
python benefit_search.py "Льготы для многодетной семьи в Москве"
```

Скрипт вернёт JSON, который позже отдаётся через Nest.

## Полезные npm-скрипты
- `npm run start:dev` — запуск в режиме разработки.
- `npm run prisma:seed` — повторная загрузка демо‑данных.
- `npm run lint` / `npm run format` — проверка и форматирование кода.
- `npm run test`, `npm run test:e2e` — запуск юнит- и e2e-тестов.

## Структура каталогов
- `src/` — NestJS‑модули.
- `prisma/` — схема, миграции и сиды.
- `smartsearch/` — Python сервис (скрипты, requirements, .env).
- `docker-compose.yaml` — пример прод/локального стека с БД.
