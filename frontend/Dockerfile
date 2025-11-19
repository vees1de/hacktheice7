# --- STAGE 1: Build frontend ---
FROM node:18 AS build

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# --- STAGE 2: Serve with Nginx ---
FROM nginx:1.25

# Удаляем дефолтный конфиг Nginx
RUN rm /etc/nginx/conf.d/default.conf

# Копируем наш кастомный конфиг
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Копируем собранный фронт
COPY --from=build /app/dist /usr/share/nginx/html

# Контейнер будет слушать 3001
EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
