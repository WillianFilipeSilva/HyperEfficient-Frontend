// Utilitários gerais para o HyperEfficient
const Utils = {
    // ========================================
    // FUNÇÕES DE VALIDAÇÃO
    // ========================================
    
    // Validar email
    isValidEmail: function(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },
    
    // Validar senha
    isValidPassword: function(senha) {
        return senha && senha.length >= 6;
    },
    
    // Validar nome
    isValidName: function(nome) {
        return nome && nome.trim().length >= 2;
    },
    
    // Validar campo obrigatório
    isRequired: function(value) {
        return value && value.trim().length > 0;
    },
    
    // ========================================
    // FUNÇÕES DE UI/UX
    // ========================================
    
    // Mostrar mensagem de erro
    showError: function(elementId, message) {
        const errorElement = document.getElementById(elementId);
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.remove('hidden');
        }
    },
    
    // Esconder mensagem de erro
    hideError: function(elementId) {
        const errorElement = document.getElementById(elementId);
        if (errorElement) {
            errorElement.classList.add('hidden');
        }
    },
    
    // Mostrar loading em botão
    showButtonLoading: function(buttonId, loadingText = 'Carregando...') {
        const button = document.getElementById(buttonId);
        if (button) {
            const buttonText = button.querySelector('[data-text]');
            const buttonLoading = button.querySelector('[data-loading]');
            
            if (buttonText && buttonLoading) {
                button.disabled = true;
                buttonText.classList.add('hidden');
                buttonLoading.classList.remove('hidden');
                buttonLoading.textContent = loadingText;
            }
        }
    },
    
    // Esconder loading em botão
    hideButtonLoading: function(buttonId) {
        const button = document.getElementById(buttonId);
        if (button) {
            const buttonText = button.querySelector('[data-text]');
            const buttonLoading = button.querySelector('[data-loading]');
            
            if (buttonText && buttonLoading) {
                button.disabled = false;
                buttonText.classList.remove('hidden');
                buttonLoading.classList.add('hidden');
            }
        }
    },
    
    // Mostrar toast/notificação
    showToast: function(message, type = 'info', duration = 3000) {
        // Criar elemento toast
        const toast = document.createElement('div');
        toast.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300 transform translate-x-full`;
        
        // Definir cores baseadas no tipo
        const colors = {
            success: 'bg-green-500 text-white',
            error: 'bg-red-500 text-white',
            warning: 'bg-yellow-500 text-black',
            info: 'bg-blue-500 text-white'
        };
        
        toast.className += ` ${colors[type] || colors.info}`;
        toast.textContent = message;
        
        // Adicionar ao DOM
        document.body.appendChild(toast);
        
        // Animar entrada
        setTimeout(() => {
            toast.classList.remove('translate-x-full');
        }, 100);
        
        // Remover após duração
        setTimeout(() => {
            toast.classList.add('translate-x-full');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, duration);
    },
    
    // ========================================
    // FUNÇÕES DE FORMULÁRIO
    // ========================================
    
    // Validar formulário
    validateForm: function(formData, validations) {
        const errors = {};
        
        for (const [field, value] of Object.entries(formData)) {
            if (validations[field]) {
                const validation = validations[field];
                
                // Verificar se é obrigatório
                if (validation.required && !this.isRequired(value)) {
                    errors[field] = validation.requiredMessage || 'Este campo é obrigatório';
                    continue;
                }
                
                // Verificar validações específicas
                if (validation.email && !this.isValidEmail(value)) {
                    errors[field] = validation.emailMessage || 'Email inválido';
                    continue;
                }
                
                if (validation.minLength && value.length < validation.minLength) {
                    errors[field] = validation.minLengthMessage || `Mínimo de ${validation.minLength} caracteres`;
                    continue;
                }
                
                if (validation.custom && !validation.custom(value)) {
                    errors[field] = validation.customMessage || 'Valor inválido';
                    continue;
                }
            }
        }
        
        return {
            isValid: Object.keys(errors).length === 0,
            errors: errors
        };
    },
    
    // Limpar formulário
    clearForm: function(formId) {
        const form = document.getElementById(formId);
        if (form) {
            form.reset();
            // Limpar todos os erros
            const errorElements = form.querySelectorAll('[id*="error"]');
            errorElements.forEach(element => {
                element.classList.add('hidden');
            });
        }
    },
    
    // ========================================
    // FUNÇÕES DE NAVEGAÇÃO
    // ========================================
    
    // Redirecionar com delay
    redirect: function(url, delay = 0) {
        if (delay > 0) {
            setTimeout(() => {
                window.location.href = url;
            }, delay);
        } else {
            window.location.href = url;
        }
    },
    
    // Verificar se está em uma página específica
    isCurrentPage: function(pageName) {
        return window.location.pathname.includes(pageName);
    },
    
    // ========================================
    // FUNÇÕES DE DADOS
    // ========================================
    
    // Formatar data
    formatDate: function(date, format = 'dd/mm/yyyy') {
        const d = new Date(date);
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        
        return format
            .replace('dd', day)
            .replace('mm', month)
            .replace('yyyy', year);
    },
    
    // Formatar moeda
    formatCurrency: function(value, currency = 'R$') {
        if (value === null || value === undefined) return `${currency} 0,00`;
        
        const number = parseFloat(value);
        if (isNaN(number)) return `${currency} 0,00`;
        
        return `${currency} ${number.toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`;
    },
    
    // Formatar número
    formatNumber: function(value, decimals = 2) {
        if (value === null || value === undefined) return '0';
        
        const number = parseFloat(value);
        if (isNaN(number)) return '0';
        
        return number.toLocaleString('pt-BR', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        });
    },
    
    // ========================================
    // FUNÇÕES DE ELEMENTOS DOM
    // ========================================
    
    // Mostrar elemento
    showElement: function(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.classList.remove('hidden');
        }
    },
    
    // Esconder elemento
    hideElement: function(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.classList.add('hidden');
        }
    },
    
    // Alternar visibilidade de elemento
    toggleElement: function(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.classList.toggle('hidden');
        }
    },
    
    // ========================================
    // FUNÇÕES DE STRING
    // ========================================
    
    // Capitalizar primeira letra
    capitalize: function(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    },
    
    // Obter iniciais
    getInitials: function(name, maxLength = 2) {
        if (!name) return '';
        
        const words = name.trim().split(' ');
        const initials = words.map(word => word.charAt(0).toUpperCase()).join('');
        
        return initials.substring(0, maxLength);
    },
    
    // Truncar texto
    truncate: function(str, maxLength = 50, suffix = '...') {
        if (!str || str.length <= maxLength) return str;
        return str.substring(0, maxLength) + suffix;
    },
    
    // Remover acentos
    removeAccents: function(str) {
        if (!str) return '';
        return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    },
    
    // ========================================
    // FUNÇÕES DE ARRAY/OBJETO
    // ========================================
    
    // Filtrar array por propriedade
    filterByProperty: function(array, property, value) {
        return array.filter(item => item[property] === value);
    },
    
    // Ordenar array por propriedade
    sortByProperty: function(array, property, ascending = true) {
        return array.sort((a, b) => {
            const aVal = a[property];
            const bVal = b[property];
            
            if (ascending) {
                return aVal > bVal ? 1 : -1;
            } else {
                return aVal < bVal ? 1 : -1;
            }
        });
    },
    
    // ========================================
    // FUNÇÕES DE STORAGE
    // ========================================
    
    // Salvar no localStorage
    saveToStorage: function(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('Erro ao salvar no localStorage:', error);
            return false;
        }
    },
    
    // Carregar do localStorage
    loadFromStorage: function(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('Erro ao carregar do localStorage:', error);
            return defaultValue;
        }
    },
    
    // Remover do localStorage
    removeFromStorage: function(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Erro ao remover do localStorage:', error);
            return false;
        }
    },
    
    // ========================================
    // FUNÇÕES DE DEBOUNCE/THROTTLE
    // ========================================
    
    // Debounce function
    debounce: function(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    // Throttle function
    throttle: function(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },
    
    // ========================================
    // FUNÇÕES DE MODAL GENÉRICA
    // ========================================
    showModal: function({
        message = 'Tem certeza que deseja realizar esta ação?',
        title = 'Confirmação',
        onConfirm = null,
        onCancel = null
    }) {
        // Adiciona modal ao body se não existir
        let modal = document.getElementById('modalGenericOverlay');
        if (!modal) {
            const html = `
            <div id=\"modalGenericOverlay\" class=\"fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 hidden\">
              <div id=\"modalGeneric\" class=\"bg-white dark:bg-slate-850 rounded-2xl shadow-xl max-w-md w-full mx-4 p-6 relative flex flex-col items-center\">
                <button id=\"modalGenericClose\" class=\"absolute top-4 right-4 text-slate-400 hover:text-slate-700 dark:text-white text-xl font-bold focus:outline-none\">&times;</button>
                <div class=\"w-full text-center\">
                  <h3 id=\"modalGenericTitle\" class=\"text-lg font-semibold text-slate-700 dark:text-white mb-2\">Confirmação</h3>
                  <p id=\"modalGenericMessage\" class=\"text-slate-500 dark:text-white/80 mb-6\">Tem certeza que deseja realizar esta ação?</p>
                </div>
                <div class=\"flex justify-center gap-4 w-full\">
                  <button id=\"modalGenericCancel\" class=\"px-6 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors font-semibold\">Cancelar</button>
                  <button id=\"modalGenericConfirm\" class=\"px-6 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors font-semibold\">Confirmar</button>
                </div>
              </div>
            </div>`;
            const temp = document.createElement('div');
            temp.innerHTML = html;
            document.body.appendChild(temp.firstElementChild);
            Utils._setupModal({ message, title, onConfirm, onCancel });
        } else {
            Utils._setupModal({ message, title, onConfirm, onCancel });
        }
    },
    _setupModal: function({ message, title, onConfirm, onCancel }) {
        const overlay = document.getElementById('modalGenericOverlay');
        const modal = document.getElementById('modalGeneric');
        const closeBtn = document.getElementById('modalGenericClose');
        const cancelBtn = document.getElementById('modalGenericCancel');
        const confirmBtn = document.getElementById('modalGenericConfirm');
        const msg = document.getElementById('modalGenericMessage');
        const ttl = document.getElementById('modalGenericTitle');
        if (!overlay || !modal) return;
        msg.textContent = message;
        ttl.textContent = title;
        overlay.classList.remove('hidden');
        // Fechar ao clicar fora
        overlay.onclick = function(e) {
            if (e.target === overlay) {
                overlay.classList.add('hidden');
                if (onCancel) onCancel();
            }
        };
        // Fechar no X
        closeBtn.onclick = function() {
            overlay.classList.add('hidden');
            if (onCancel) onCancel();
        };
        // Cancelar
        cancelBtn.onclick = function() {
            overlay.classList.add('hidden');
            if (onCancel) onCancel();
        };
        // Confirmar
        confirmBtn.onclick = function() {
            overlay.classList.add('hidden');
            if (onConfirm) onConfirm();
        };
    }
};

// Exportar para uso global
window.Utils = Utils; 