// ============================================
// Модуль авторизации через Discord OAuth2
// ============================================

const Auth = {
  API_BASE_URL: '/api',
  TOKEN_KEY: 'masteria_auth_token',
  USER_KEY: 'masteria_user',

  // Получить токен из localStorage
  getToken() {
    return localStorage.getItem(this.TOKEN_KEY);
  },

  // Сохранить токен в localStorage
  setToken(token) {
    if (token) {
      localStorage.setItem(this.TOKEN_KEY, token);
    } else {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
    }
  },

  // Получить данные пользователя из localStorage
  getUser() {
    const userStr = localStorage.getItem(this.USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  },

  // Сохранить данные пользователя в localStorage
  setUser(user) {
    if (user) {
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(this.USER_KEY);
    }
  },

  // Проверить, авторизован ли пользователь
  isAuthenticated() {
    return !!this.getToken();
  },

  // Получить URL для авторизации Discord
  async getDiscordAuthUrl() {
    try {
      const response = await fetch(`${this.API_BASE_URL}/auth/discord/url`);
      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error('Error getting Discord auth URL:', error);
      throw error;
    }
  },

  // Запустить процесс авторизации через Discord
  async login() {
    try {
      const authUrl = await this.getDiscordAuthUrl();
      window.location.href = authUrl;
    } catch (error) {
      console.error('Error initiating login:', error);
      alert('Ошибка при попытке авторизации. Попробуйте позже.');
    }
  },

  // Выход из системы
  logout() {
    this.setToken(null);
    this.setUser(null);
    window.location.href = '/';
  },

  // Получить информацию о текущем пользователе
  async getCurrentUser() {
    const token = this.getToken();
    if (!token) {
      return null;
    }

    try {
      const response = await fetch(`${this.API_BASE_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        // Токен недействителен
        this.setToken(null);
        this.setUser(null);
        return null;
      }

      if (!response.ok) {
        throw new Error('Failed to get user info');
      }

      const user = await response.json();
      this.setUser(user);
      return user;
    } catch (error) {
      console.error('Error getting current user:', error);
      this.setToken(null);
      this.setUser(null);
      return null;
    }
  },

  // Инициализация: проверка токена из URL и загрузка пользователя
  async init() {
    // Проверяем, есть ли токен в URL параметрах (после редиректа от Discord)
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const error = urlParams.get('error');

    if (error) {
      console.error('Auth error:', error);
      alert('Ошибка авторизации. Попробуйте еще раз.');
      // Удаляем параметр ошибки из URL
      window.history.replaceState({}, document.title, window.location.pathname);
      return;
    }

    if (token) {
      // Сохраняем токен
      this.setToken(token);
      // Удаляем токен из URL
      window.history.replaceState({}, document.title, window.location.pathname);
      // Загружаем данные пользователя
      await this.getCurrentUser();
    } else if (this.isAuthenticated()) {
      // Если токен уже есть, проверяем его валидность
      await this.getCurrentUser();
    }
  },

  // Обновить UI навбара с информацией о пользователе
  updateNavbar() {
    const loginBtn = document.querySelector('.navbar-login-btn');
    if (!loginBtn) return;

    const user = this.getUser();
    
    if (user) {
      // Пользователь авторизован
      loginBtn.textContent = user.username || 'Профиль';
      loginBtn.href = '#';
      loginBtn.onclick = (e) => {
        e.preventDefault();
        // Можно добавить меню профиля или редирект на страницу профиля
        if (confirm('Вы хотите выйти?')) {
          this.logout();
        }
      };
    } else {
      // Пользователь не авторизован
      loginBtn.textContent = 'Войти';
      loginBtn.href = '#';
      loginBtn.onclick = (e) => {
        e.preventDefault();
        this.login();
      };
    }
  },

  // Проверить авторизацию для защищенных страниц
  async requireAuth() {
    if (!this.isAuthenticated()) {
      // Сохраняем текущий URL для редиректа после авторизации
      const currentUrl = window.location.pathname;
      sessionStorage.setItem('redirect_after_auth', currentUrl);
      // Перенаправляем на главную страницу
      window.location.href = '/';
      return false;
    }

    const user = await this.getCurrentUser();
    if (!user) {
      // Токен недействителен
      this.setToken(null);
      window.location.href = '/';
      return false;
    }

    return true;
  }
};

// Автоматическая инициализация при загрузке
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    Auth.init().then(() => {
      Auth.updateNavbar();
    });
  });
} else {
  Auth.init().then(() => {
    Auth.updateNavbar();
  });
}

