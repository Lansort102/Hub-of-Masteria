// ============================================
// Мобильное меню навбара (для всех страниц)
// ============================================
function initNavbar() {
    const navbarToggle = document.querySelector('.navbar-toggle');
    const navbarMain = document.querySelector('.navbar-main');
    
    if (navbarToggle && navbarMain) {
        navbarToggle.addEventListener('click', () => {
            navbarToggle.classList.toggle('active');
            navbarMain.classList.toggle('active');
        });
        
        // Закрытие меню при клике на ссылку
        const navbarLinks = navbarMain.querySelectorAll('.navbar-link');
        navbarLinks.forEach(link => {
            link.addEventListener('click', () => {
                navbarToggle.classList.remove('active');
                navbarMain.classList.remove('active');
            });
        });
    }
}

// ============================================
// Сайдбар (для страниц с сайдбаром)
// ============================================
function initSidebar() {
    const sidebarToggle = document.querySelector('.sidebar-toggle');
    const sidebar = document.querySelector('.wiki-sidebar') || document.querySelector('.history-sidebar');
    const sidebarOverlay = document.querySelector('.sidebar-overlay');
    const sidebarClose = document.querySelector('.sidebar-close');
    
    if (!sidebar) return; // Если сайдбара нет, выходим
    
    function updateSidebarState(isOpen) {
        if (sidebar) {
            if (isOpen) {
                sidebar.classList.add('active');
            } else {
                sidebar.classList.remove('active');
            }
        }
        if (sidebarOverlay) {
            if (isOpen) {
                sidebarOverlay.classList.add('active');
            } else {
                sidebarOverlay.classList.remove('active');
            }
        }
        if (sidebarClose) {
            if (isOpen) {
                sidebarClose.classList.add('active');
            } else {
                sidebarClose.classList.remove('active');
            }
        }
    }
    
    function closeSidebar() {
        updateSidebarState(false);
    }
    
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', () => {
            const isOpen = sidebar.classList.contains('active');
            updateSidebarState(!isOpen);
        });
    }
    
    if (sidebarClose) {
        sidebarClose.addEventListener('click', closeSidebar);
    }
    
    if (sidebarOverlay) {
        sidebarOverlay.addEventListener('click', closeSidebar);
    }
}

// ============================================
// Инициализация при загрузке страницы
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    initNavbar();
    initSidebar();
});

