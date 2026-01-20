# Backend API для Hub of Masteria

Backend API с авторизацией через Discord OAuth2.

## Установка и запуск

### Локальная разработка

1. Установите зависимости:
```bash
npm install
```

2. Создайте файл `.env` на основе `.env.example` и заполните переменные окружения:
```bash
cp .env.example .env
```

3. Запустите миграции базы данных:
```bash
npm run migrate
```

4. Запустите сервер в режиме разработки:
```bash
npm run dev
```

### Docker

Backend запускается автоматически через `docker-compose.yml` в корне проекта.

## Переменные окружения

- `DISCORD_CLIENT_ID` - ID приложения Discord
- `DISCORD_CLIENT_SECRET` - секрет приложения Discord
- `DISCORD_REDIRECT_URI` - URL редиректа после авторизации
- `JWT_SECRET` - секретный ключ для JWT токенов
- `JWT_EXPIRES_IN` - срок действия JWT токена (по умолчанию 7d)
- `DATABASE_URL` - строка подключения к PostgreSQL
- `PORT` - порт сервера (по умолчанию 3000)
- `FRONTEND_URL` - URL фронтенда (для CORS)

## API Endpoints

### Авторизация

- `GET /api/auth/discord/url` - получить URL для авторизации Discord
- `GET /api/auth/discord/callback` - обработка callback от Discord
- `GET /api/auth/me` - получить информацию о текущем пользователе (требует JWT)

### Пользователи

- `GET /api/users/me` - получить информацию о текущем пользователе (требует JWT)

### Health Check

- `GET /api/health` - проверка работоспособности сервера

## Настройка Discord Application

1. Перейдите на https://discord.com/developers/applications
2. Создайте новое приложение
3. В разделе OAuth2:
   - Добавьте Redirect URL: `http://localhost/api/auth/discord/callback`
   - Скопируйте Client ID и Client Secret
   - Выберите scopes: `identify`, `email` (опционально)

