# ============================================
# Dockerfile для Hub of Masteria
# ============================================

# Используем nginx для статического контента
FROM nginx:alpine

# Удаляем дефолтную конфигурацию nginx
RUN rm /etc/nginx/conf.d/default.conf

# Копируем кастомную конфигурацию nginx
COPY nginx.conf /etc/nginx/conf.d/

# Копируем статические файлы
COPY . /usr/share/nginx/html/

# Удаляем ненужные файлы из production
RUN rm -f /usr/share/nginx/html/Dockerfile \
    /usr/share/nginx/html/docker-compose.yml \
    /usr/share/nginx/html/.dockerignore \
    /usr/share/nginx/html/.gitignore || true

# Открываем порт 80
EXPOSE 80

# Запускаем nginx
CMD ["nginx", "-g", "daemon off;"]

