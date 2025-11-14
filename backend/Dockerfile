# Базовый образ Node.js (LTS, slim для прод)
FROM node:20-slim AS builder

# Установка зависимостей
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Билд приложения
COPY . .
RUN npm run build

# Production-стадия (минимальный размер)
FROM node:20-slim AS production
WORKDIR /app

# Копируем node_modules и dist из builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

# Env для прод (порт 8000)
ENV NODE_ENV=production
ENV PORT=8000

# Запуск
EXPOSE 8000
CMD ["npm", "run", "start:prod"]