# Инструкция по настройке авторизации через Discord

## Предварительные требования

1. Node.js 20+ (для локальной разработки)
2. Docker и Docker Compose
3. Discord Application (см. раздел ниже)

## Настройка Discord Application

1. Перейдите на https://discord.com/developers/applications
2. Нажмите "New Application" и создайте новое приложение
3. Перейдите в раздел "OAuth2"
4. В разделе "Redirects" добавьте:
   - Для локальной разработки: `http://localhost/api/auth/discord/callback`
   - Для production: `https://yourdomain.com/api/auth/discord/callback`
5. Скопируйте:
   - **Client ID** (в разделе OAuth2)
   - **Client Secret** (нажмите "Reset Secret" если нужно)

## Настройка переменных окружения

Создайте файл `.env` в корне проекта со следующим содержимым:

```env
# Discord OAuth2
DISCORD_CLIENT_ID=your_discord_client_id_here
DISCORD_CLIENT_SECRET=your_discord_client_secret_here
DISCORD_REDIRECT_URI=http://localhost/api/auth/discord/callback

# JWT Secret (измените на случайную строку!)
JWT_SECRET=your_super_secret_jwt_key_change_this
JWT_EXPIRES_IN=7d

# Frontend URL
FRONTEND_URL=http://localhost

# Database (опционально, если хотите изменить)
# DATABASE_URL=postgresql://masteria_user:change_this_password@db:5432/masteria
```

**ВАЖНО:** Измените `JWT_SECRET` на случайную строку для безопасности!

## Запуск проекта

### Через Docker Compose (рекомендуется)

```bash
# Запуск всех сервисов
docker-compose up -d

# Просмотр логов
docker-compose logs -f

# Остановка
docker-compose down
```

### Локальная разработка

1. Установите зависимости backend:
```bash
cd backend
npm install
```

2. Убедитесь, что PostgreSQL запущен и доступен

3. Создайте файл `backend/.env` с переменными окружения

4. Запустите миграции:
```bash
npm run migrate
```

5. Запустите backend:
```bash
npm run dev
```

6. Запустите frontend через любой статический сервер или используйте Docker только для frontend

## Проверка работы

1. Откройте http://localhost в браузере
2. Нажмите кнопку "Войти"
3. Вы должны быть перенаправлены на Discord для авторизации
4. После авторизации вы вернетесь на сайт и будете авторизованы

## Структура проекта

```
Hub of Masteria/
├── backend/              # Backend API (Node.js + TypeScript)
│   ├── src/
│   │   ├── config/      # Конфигурация БД
│   │   ├── controllers/ # Контроллеры API
│   │   ├── middleware/  # Middleware (auth, errors)
│   │   ├── models/      # Модели данных
│   │   ├── routes/      # Маршруты API
│   │   ├── services/    # Бизнес-логика
│   │   └── types/       # TypeScript типы
│   ├── migrations/      # SQL миграции
│   └── package.json
├── js/
│   └── auth.js          # Клиентская логика авторизации
├── docker-compose.yml   # Docker Compose конфигурация
└── nginx.conf          # Конфигурация Nginx
```

## Защищенные страницы

Страница `membersdesk.html` требует авторизации. При попытке доступа без авторизации пользователь будет перенаправлен на главную страницу.

## Troubleshooting

### Backend не запускается

- Проверьте, что PostgreSQL контейнер запущен: `docker-compose ps`
- Проверьте логи: `docker-compose logs backend`
- Убедитесь, что переменные окружения установлены правильно

### Ошибка авторизации Discord

- Проверьте, что `DISCORD_CLIENT_ID` и `DISCORD_CLIENT_SECRET` правильные
- Убедитесь, что Redirect URI в Discord Application совпадает с `DISCORD_REDIRECT_URI`
- Проверьте, что в Discord Application включены scopes: `identify` и `email`

### База данных не создается

- Проверьте логи PostgreSQL: `docker-compose logs db`
- Убедитесь, что миграции находятся в `backend/migrations/`
- Попробуйте пересоздать контейнер БД: `docker-compose down -v && docker-compose up -d`

