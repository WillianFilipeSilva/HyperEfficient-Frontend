// Configuração da API HyperEfficient
const API_CONFIG = {
    // URL base da API - ajuste conforme sua configuração
    BASE_URL: 'http://localhost:5205',
    
    // Endpoints
    ENDPOINTS: {
        LOGIN: '/usuarios/login',
        CADASTRO: '/usuarios',
        USUARIOS: '/usuarios',
        SETORES: '/setores',
        CATEGORIAS: '/categorias',
        EQUIPAMENTOS: '/equipamentos',
        REGISTROS: '/registros',
        RELATORIOS: '/relatorios'
    },
    
    // Headers padrão
    DEFAULT_HEADERS: {
        'Content-Type': 'application/json'
    },
    
    // Função para obter token do localStorage
    getToken: function() {
        return localStorage.getItem('token');
    },
    
    // Função para obter usuário do localStorage
    getUsuario: function() {
        const userStr = localStorage.getItem('usuario');
        return userStr ? JSON.parse(userStr) : null;
    },
    
    // Função para obter headers com autenticação
    getAuthHeaders: function() {
        let token = this.getToken();
        if (token) {
            token = token.replace(/^"|"$/g, '');
        }
        return {
            ...this.DEFAULT_HEADERS,
            'Authorization': token ? `Bearer ${token}` : ''
        };
    },
    
    // Função para fazer requisições autenticadas
    async authenticatedRequest(url, options = {}) {
        const headers = this.getAuthHeaders();
        const response = await fetch(this.BASE_URL + url, {
            ...options,
            headers: {
                ...headers,
                ...options.headers
            }
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Erro na requisição: ${response.status}`);
        }
        
        return response.json();
    },
    
    // Função para fazer requisições públicas
    async publicRequest(url, options = {}) {
        const response = await fetch(this.BASE_URL + url, {
            ...options,
            headers: {
                ...this.DEFAULT_HEADERS,
                ...options.headers
            }
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Erro na requisição: ${response.status}`);
        }
        
        return response.json();
    },
    
    // Função para verificar handshake do token
    async handshake() {
        try {
            await this.authenticatedRequest('/usuarios/handshake', { method: 'GET' });
            return true;
        } catch (error) {
            return false;
        }
    }
};

// Funções utilitárias para autenticação
const AuthUtils = {
    // Verificar se o usuário está logado (agora usando handshake)
    isLoggedIn: async function() {
        const token = API_CONFIG.getToken();
        if (!token) return false;
        if (this.isTokenExpired()) return false;
        // Verifica no backend se o token é válido
        return await API_CONFIG.handshake();
    },
    
    // Obter dados do usuário logado
    getCurrentUser: function() {
        return API_CONFIG.getUsuario();
    },
    
    // Fazer logout
    logout: function() {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        if (!window.location.pathname.includes('/pages/auth/login.html')) {
            window.location.href = '/pages/auth/login.html';
        }
    },
    
    // Verificar se o token expirou (implementação robusta)
    isTokenExpired: function() {
        const token = API_CONFIG.getToken();
        if (!token) return true;
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const currentTime = Math.floor(Date.now() / 1000);
            if (payload.exp < currentTime) {
                localStorage.removeItem('token');
                localStorage.removeItem('usuario');
                return true;
            }
            return false;
        } catch (error) {
            localStorage.removeItem('token');
            localStorage.removeItem('usuario');
            return true;
        }
    }
};

// Exportar para uso global
window.API_CONFIG = API_CONFIG;
window.AuthUtils = AuthUtils; 