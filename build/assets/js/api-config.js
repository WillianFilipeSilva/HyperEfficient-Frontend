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
    
    // Função para obter headers com autenticação
    getAuthHeaders: function() {
        const token = localStorage.getItem('token');
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
    }
};

// Funções utilitárias para autenticação
const AuthUtils = {
    // Verificar se o usuário está logado
    isLoggedIn: function() {
        return !!localStorage.getItem('token');
    },
    
    // Obter dados do usuário logado
    getCurrentUser: function() {
        const userStr = localStorage.getItem('usuario');
        return userStr ? JSON.parse(userStr) : null;
    },
    
    // Fazer logout
    logout: function() {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        // Redirecionar para login se não autenticado
        window.location.href = '../login.html';
    },
    
    // Verificar se o token expirou (implementação básica)
    isTokenExpired: function() {
        const token = localStorage.getItem('token');
        if (!token) return true;
        
        try {
            // Decodificar o token JWT (parte payload)
            const payload = JSON.parse(atob(token.split('.')[1]));
            const currentTime = Math.floor(Date.now() / 1000);
            
            return payload.exp < currentTime;
        } catch (error) {
            return true;
        }
    }
};

// Exportar para uso global
window.API_CONFIG = API_CONFIG;
window.AuthUtils = AuthUtils; 