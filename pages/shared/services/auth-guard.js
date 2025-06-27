// AuthGuard - Sistema de proteção de rotas para HyperEfficient
const AuthGuard = {
    // Configurações
    config: {
        loginPage: '/pages/auth/login.html',
        dashboardPage: '/pages/dashboard/dashboard.html',
        checkInterval: 60000, // Verificar token a cada 1 minuto
        redirectDelay: 1000
    },

    // Inicializar proteção de rotas
    init: function(options = {}) {
        this.config = { ...this.config, ...options };
        
        // Verificar autenticação quando a página carrega
        document.addEventListener('DOMContentLoaded', () => {
            this.checkAuth();
        });

        // Verificar periodicamente se o token expirou
        this.startTokenCheck();
    },

    // Verificar autenticação
    checkAuth: function() {
        // Se não estiver logado, redirecionar para login
        if (!AuthUtils.isLoggedIn()) {
            this.redirectToLogin();
            return false;
        }

        // Se o token expirou, fazer logout
        if (AuthUtils.isTokenExpired()) {
            this.handleTokenExpired();
            return false;
        }

        return true;
    },

    // Verificar autenticação para páginas públicas (login/cadastro)
    checkAuthPublic: function() {
        // Se já estiver logado, redirecionar para dashboard
        if (AuthUtils.isLoggedIn() && !AuthUtils.isTokenExpired()) {
            this.redirectToDashboard();
            return false;
        }
        return true;
    },

    // Redirecionar para login
    redirectToLogin: function() {
        if (Utils && Utils.showToast) {
            Utils.showToast('Faça login para acessar esta página', 'warning');
        }
        this.redirect(this.config.loginPage);
    },

    // Redirecionar para dashboard
    redirectToDashboard: function() {
        if (Utils && Utils.showToast) {
            Utils.showToast('Você já está logado', 'info');
        }
        this.redirect(this.config.dashboardPage);
    },

    // Lidar com token expirado
    handleTokenExpired: function() {
        if (Utils && Utils.showToast) {
            Utils.showToast('Sua sessão expirou. Faça login novamente.', 'warning');
        }
        AuthUtils.logout();
    },

    // Redirecionar com delay
    redirect: function(url, delay = this.config.redirectDelay) {
        setTimeout(() => {
            window.location.href = url;
        }, delay);
    },

    // Iniciar verificação periódica do token
    startTokenCheck: function() {
        setInterval(() => {
            if (AuthUtils.isLoggedIn() && AuthUtils.isTokenExpired()) {
                this.handleTokenExpired();
            }
        }, this.config.checkInterval);
    },

    // Verificar se está em uma página específica
    isCurrentPage: function(pageName) {
        return window.location.pathname.includes(pageName);
    },

    // Obter configuração personalizada baseada na página atual
    getPageConfig: function() {
        const currentPath = window.location.pathname;
        
        // Páginas públicas (não precisam de autenticação)
        const publicPages = [
            '/pages/auth/login.html',
            '/pages/usuarios/usuario-form.html'
        ];

        // Páginas que precisam de autenticação
        const protectedPages = [
            '/pages/dashboard/',
            '/pages/usuarios/'
        ];

        // Verificar se é página pública
        if (publicPages.some(page => currentPath.includes(page))) {
            return { type: 'public', requireAuth: false };
        }

        // Verificar se é página protegida
        if (protectedPages.some(page => currentPath.includes(page))) {
            return { type: 'protected', requireAuth: true };
        }

        // Padrão: página protegida
        return { type: 'protected', requireAuth: true };
    }
};

// Função de inicialização automática
function initAuthGuard(options = {}) {
    const currentPath = window.location.pathname;
    const isLoginPage = currentPath.includes('/pages/auth/login.html');
    const isLoggedIn = AuthUtils.isLoggedIn() && !AuthUtils.isTokenExpired();

    if (isLoginPage) {
        // Se está na página de login
        if (isLoggedIn) {
            // Já está logado, redireciona para o dashboard
            AuthGuard.redirectToDashboard();
        } else {
            // Não está logado, permite acessar o login normalmente
            AuthGuard.init({ ...options, checkAuth: false });
        }
    } else {
        // Qualquer outra página
        AuthGuard.init(options);
        AuthGuard.checkAuth();
    }
}

// Exportar para uso global
window.AuthGuard = AuthGuard;
window.initAuthGuard = initAuthGuard; 