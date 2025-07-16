const AuthGuard = {
    config: {
        loginPage: '/pages/auth/login.html',
        dashboardPage: '/pages/dashboard/dashboard.html',
        checkInterval: 60000,
        redirectDelay: 1000
    },

    init: function(options = {}) {
        this.config = { ...this.config, ...options };
        
        this.startTokenCheck();
    },

    checkAuth: async function() {
        if (!(await AuthUtils.isLoggedIn())) {
            this.redirectToLogin();
            return false;
        }

        if (AuthUtils.isTokenExpired()) {
            this.handleTokenExpired();
            return false;
        }

        return true;
    },

    checkAuthPublic: function() {
        if (AuthUtils.isLoggedIn() && !AuthUtils.isTokenExpired()) {
            this.redirectToDashboard();
            return false;
        }
        return true;
    },

    redirectToLogin: function() {
        if (Utils && Utils.showToast) {
            Utils.showToast('Faça login para acessar esta página', 'warning');
        }
        this.redirect(this.config.loginPage);
    },

    redirectToDashboard: function() {
        if (Utils && Utils.showToast) {
            Utils.showToast('Você já está logado', 'info');
        }
        this.redirect(this.config.dashboardPage);
    },

    handleTokenExpired: function() {
        if (Utils && Utils.showToast) {
            Utils.showToast('Sua sessão expirou. Faça login novamente.', 'warning');
        }
        AuthUtils.logout();
    },

    redirect: function(url, delay = this.config.redirectDelay) {
        setTimeout(() => {
            window.location.href = url;
        }, delay);
    },

    startTokenCheck: function() {
        setInterval(() => {
            if (API_CONFIG.getToken() && AuthUtils.isTokenExpired()) {
                this.handleTokenExpired();
            }
        }, this.config.checkInterval);
    },

    isCurrentPage: function(pageName) {
        return window.location.pathname.includes(pageName);
    },

    getPageConfig: function() {
        const currentPath = window.location.pathname;
        
        const publicPages = [
            '/pages/auth/login.html',
            '/pages/usuarios/cadastro.html'
        ];

        const protectedPages = [
            '/pages/dashboard/',
            '/pages/usuarios/'
        ];

        if (publicPages.some(page => currentPath.includes(page))) {
            return { type: 'public', requireAuth: false };
        }

        if (protectedPages.some(page => currentPath.includes(page))) {
            return { type: 'protected', requireAuth: true };
        }

        return { type: 'protected', requireAuth: true };
    }
};

async function initAuthGuard(options = {}) {
    const currentPath = window.location.pathname;
    const isLoginPage = currentPath.includes('/pages/auth/login.html');
    const isLoggedIn = await AuthUtils.isLoggedIn() && !AuthUtils.isTokenExpired();

    if (isLoginPage) {
        if (isLoggedIn) {
            AuthGuard.redirectToDashboard();
        } else {
            AuthGuard.init({ ...options, checkAuth: false });
        }
    } else {
        AuthGuard.init(options);
        await AuthGuard.checkAuth();
    }
}

window.AuthGuard = AuthGuard;
window.initAuthGuard = initAuthGuard; 