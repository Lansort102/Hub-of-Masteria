FROM node:20-alpine

WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем все зависимости (включая dev для сборки)
RUN npm ci

# Копируем исходный код
COPY . .

# Компилируем TypeScript
RUN npm run build

# Удаляем dev зависимости после сборки (опционально, для уменьшения размера образа)
RUN npm prune --production

# Открываем порт
EXPOSE 3000

# Запускаем приложение
CMD ["npm", "start"]

