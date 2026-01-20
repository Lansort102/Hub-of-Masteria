// ============================================
// Система toast-уведомлений
// ============================================

const Notification = {
  container: null,
  notifications: [],

  // Инициализация контейнера для уведомлений
  init() {
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.className = 'notifications-container';
      document.body.appendChild(this.container);
    }
  },

  // Показать уведомление
  show(message, type = 'info', duration = 4000) {
    // Инициализируем контейнер, если его еще нет
    this.init();

    // Создаем элемент уведомления
    const notification = document.createElement('div');
    notification.className = `notification notification--${type}`;
    
    // Иконка для типа уведомления
    const icon = this.getIcon(type);
    
    // Содержимое уведомления
    notification.innerHTML = `
      <div class="notification-icon">${icon}</div>
      <div class="notification-content">
        <div class="notification-message">${this.escapeHtml(message)}</div>
      </div>
      <button class="notification-close" aria-label="Закрыть">&times;</button>
    `;

    // Добавляем обработчик закрытия
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
      this.hide(notification);
    });

    // Добавляем уведомление в контейнер
    this.container.appendChild(notification);
    this.notifications.push(notification);

    // Триггерим анимацию появления
    requestAnimationFrame(() => {
      notification.classList.add('notification--show');
    });

    // Автоматическое скрытие через указанное время
    if (duration > 0) {
      setTimeout(() => {
        this.hide(notification);
      }, duration);
    }

    return notification;
  },

  // Скрыть уведомление
  hide(notification) {
    if (!notification || !notification.parentElement) {
      return;
    }

    // Удаляем из массива
    const index = this.notifications.indexOf(notification);
    if (index > -1) {
      this.notifications.splice(index, 1);
    }

    // Анимация исчезновения
    notification.classList.remove('notification--show');
    notification.classList.add('notification--hide');

    // Удаляем элемент после анимации
    setTimeout(() => {
      if (notification.parentElement) {
        notification.parentElement.removeChild(notification);
      }
    }, 300);
  },

  // Получить иконку для типа уведомления
  getIcon(type) {
    const icons = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ'
    };
    return icons[type] || icons.info;
  },

  // Экранирование HTML для безопасности
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  },

  // Удобные методы для разных типов уведомлений
  success(message, duration) {
    return this.show(message, 'success', duration);
  },

  error(message, duration) {
    return this.show(message, 'error', duration || 5000); // Ошибки показываем дольше
  },

  warning(message, duration) {
    return this.show(message, 'warning', duration);
  },

  info(message, duration) {
    return this.show(message, 'info', duration);
  },

  // Скрыть все уведомления
  hideAll() {
    const notifications = [...this.notifications];
    notifications.forEach(notification => {
      this.hide(notification);
    });
  }
};

// Автоматическая инициализация при загрузке DOM
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    Notification.init();
  });
} else {
  Notification.init();
}

