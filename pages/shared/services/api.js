const API_CONFIG = {
    BASE_URL: 'http://localhost:5205',
    
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
    
    DEFAULT_HEADERS: {
        'Content-Type': 'application/json'
    },
    
    getToken: function() {
        return localStorage.getItem('token');
    },
    
    getUsuario: function() {
        const userStr = localStorage.getItem('usuario');
        return userStr ? JSON.parse(userStr) : null;
    },
    
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
    
    async authenticatedRequest(url, options = {}) {
        window.showGlobalLoading && window.showGlobalLoading();
        try {
            const token = API_CONFIG.getToken();
            const headers = {
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
                ...options.headers,
            };
            const fetchOptions = { ...options, headers };
            const response = await fetch(this.BASE_URL + url, fetchOptions);
            
            if (!response.ok) {
                const error = await response.json().catch(() => ({}));
                throw new Error(error.message || `Erro na requisição: ${response.status}`);
            }
            
            return response.json();
        } catch (error) {
            throw error;
        } finally {
            window.hideGlobalLoading && window.hideGlobalLoading();
        }
    },
    
    async publicRequest(url, options = {}) {
        window.showGlobalLoading && window.showGlobalLoading();
        try {
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
        } finally {
            window.hideGlobalLoading && window.hideGlobalLoading();
        }
    },
    
    async handshake() {
        try {
            await this.authenticatedRequest('/usuarios/handshake', { method: 'GET' });
            return true;
        } catch (error) {
            return false;
        }
    }
};

const AuthUtils = {
    _handshakeCache: {
        result: null,
        timestamp: 0,
        ttl: 30000
    },

    isLoggedIn: async function() {
        const token = API_CONFIG.getToken();
        if (!token) return false;
        if (this.isTokenExpired()) return false;
        
        const now = Date.now();
        if (this._handshakeCache.result !== null && 
            (now - this._handshakeCache.timestamp) < this._handshakeCache.ttl) {
            return this._handshakeCache.result;
        }
        
        const result = await API_CONFIG.handshake();
        
        this._handshakeCache.result = result;
        this._handshakeCache.timestamp = now;
        
        return result;
    },
    
    getCurrentUser: function() {
        return API_CONFIG.getUsuario();
    },
    
    logout: function() {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        this._handshakeCache.result = null;
        this._handshakeCache.timestamp = 0;
        if (!window.location.pathname.includes('/pages/auth/login.html')) {
            window.location.href = '/pages/auth/login.html';
        }
    },
    
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

window.API_CONFIG = API_CONFIG;
window.AuthUtils = AuthUtils; 