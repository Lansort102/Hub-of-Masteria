-- Создание таблицы пользователей
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    discord_id BIGINT UNIQUE NOT NULL,
    username VARCHAR(255) NOT NULL,
    discriminator VARCHAR(10),
    avatar VARCHAR(500),
    email VARCHAR(255),
    role VARCHAR(50) DEFAULT 'user' NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Создание индекса на discord_id для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_users_discord_id ON users(discord_id);

-- Создание индекса на role для фильтрации по ролям
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Создание таблицы сессий (опционально, для отслеживания активных сессий)
CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Создание индекса на token_hash для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_sessions_token_hash ON sessions(token_hash);

-- Создание индекса на user_id для поиска сессий пользователя
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);

-- Создание функции для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Создание триггера для автоматического обновления updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

