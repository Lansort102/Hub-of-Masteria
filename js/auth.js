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
    // Показываем индикатор загрузки
    const loginBtn = document.querySelector('.navbar-login-btn');
    if (loginBtn) {
      loginBtn.classList.add('navbar-login-btn--loading');
    }

    try {
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
    } finally {
      // Убираем индикатор загрузки
      if (loginBtn) {
        loginBtn.classList.remove('navbar-login-btn--loading');
      }
    }
  },

  // Обновить UI навбара с информацией о пользователе
  updateNavbar() {
    const loginBtn = document.querySelector('.navbar-login-btn');
    if (!loginBtn) return;

    const user = this.getUser();
    
    // Удаляем старые обработчики и меню
    this.closeUserMenu();
    loginBtn.classList.remove('navbar-login-btn--loading');
    
    if (user) {
      // Пользователь авторизован
      loginBtn.classList.add('navbar-login-btn--authenticated');
      
      // Очищаем содержимое кнопки
      loginBtn.innerHTML = '';
      
      // Добавляем аватар
      const avatar = document.createElement('img');
      avatar.src = user.avatar_url || `https://cdn.discordapp.com/avatars/${user.discord_id}/${user.avatar}.png?size=32` || '/img/hubavatar.webp';
      avatar.alt = user.username || 'Профиль';
      avatar.className = 'user-avatar';
      avatar.onerror = function() {
        this.src = '/img/hubavatar.webp';
      };
      
      // Добавляем имя пользователя
      const userName = document.createElement('span');
      userName.className = 'user-name';
      userName.textContent = user.username || 'Профиль';
      
      loginBtn.appendChild(avatar);
      loginBtn.appendChild(userName);
      
      // Создаем контейнер для меню (если его еще нет)
      let menuContainer = loginBtn.parentElement;
      if (!menuContainer.classList.contains('user-menu-container')) {
        const newContainer = document.createElement('div');
        newContainer.className = 'user-menu-container';
        menuContainer.parentElement.insertBefore(newContainer, menuContainer);
        newContainer.appendChild(loginBtn);
        menuContainer = newContainer;
      }
      
      // Создаем выпадающее меню (если его еще нет)
      let userMenu = menuContainer.querySelector('.user-menu');
      if (!userMenu) {
        userMenu = document.createElement('div');
        userMenu.className = 'user-menu';
        
        // Пункт "Профиль"
        const profileItem = document.createElement('a');
        profileItem.href = '#';
        profileItem.className = 'user-menu-item';
        profileItem.textContent = 'Профиль';
        profileItem.onclick = (e) => {
          e.preventDefault();
          this.closeUserMenu();
          // TODO: Редирект на страницу профиля, когда она будет создана
        };
        userMenu.appendChild(profileItem);
        
        // Разделитель
        const divider = document.createElement('hr');
        divider.className = 'user-menu-divider';
        userMenu.appendChild(divider);
        
        // Пункт "Выйти"
        const logoutItem = document.createElement('button');
        logoutItem.className = 'user-menu-item user-menu-item--danger';
        logoutItem.textContent = 'Выйти';
        logoutItem.onclick = (e) => {
          e.preventDefault();
          this.closeUserMenu();
          this.logout();
        };
        userMenu.appendChild(logoutItem);
        
        menuContainer.appendChild(userMenu);
      }
      
      // Обработчик клика по кнопке для открытия/закрытия меню
      loginBtn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const isMenuOpen = userMenu.classList.contains('active');
        this.closeAllUserMenus();
        if (!isMenuOpen) {
          userMenu.classList.add('active');
        }
      };
      
      // Закрытие меню при клике вне его
      if (!this.menuClickListener) {
        this.menuClickListener = (e) => {
          if (!menuContainer.contains(e.target)) {
            this.closeAllUserMenus();
          }
        };
        document.addEventListener('click', this.menuClickListener);
      }
    } else {
      // Пользователь не авторизован
      loginBtn.classList.remove('navbar-login-btn--authenticated');
      loginBtn.innerHTML = 'Войти';
      loginBtn.onclick = (e) => {
        e.preventDefault();
        this.login();
      };
      
      // Удаляем контейнер меню, если он есть
      const menuContainer = loginBtn.parentElement;
      if (menuContainer && menuContainer.classList.contains('user-menu-container')) {
        const parent = menuContainer.parentElement;
        // Перемещаем кнопку обратно в родительский элемент
        parent.insertBefore(loginBtn, menuContainer);
        // Удаляем контейнер меню
        menuContainer.remove();
      }
    }
  },

  // Закрыть выпадающее меню пользователя
  closeUserMenu(menuElement) {
    if (menuElement) {
      menuElement.classList.remove('active');
    } else {
      this.closeAllUserMenus();
    }
  },

  // Закрыть все выпадающие меню пользователя
  closeAllUserMenus() {
    const allMenus = document.querySelectorAll('.user-menu');
    allMenus.forEach(menu => menu.classList.remove('active'));
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

