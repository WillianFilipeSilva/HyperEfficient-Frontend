const Utils = {
    
    isValidEmail: function(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },
    
    isValidPassword: function(senha) {
        return senha && senha.length >= 6;
    },
    
    isValidName: function(nome) {
        return nome && nome.trim().length >= 2;
    },
    
    isRequired: function(value) {
        return value && value.trim().length > 0;
    },
    
    showError: function(elementId, message) {
        const errorElement = document.getElementById(elementId);
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.remove('hidden');
        }
    },
    
    hideError: function(elementId) {
        const errorElement = document.getElementById(elementId);
        if (errorElement) {
            errorElement.classList.add('hidden');
        }
    },
    
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
    
    _toastCounter: 0,
    
    showToast: function(message, type = 'info', duration = 3000) {
        this._toastCounter++;
        const toastIndex = this._toastCounter;
        
        const toast = document.createElement('div');
        toast.className = `fixed right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300 transform translate-x-full backdrop-blur-lg`;
        
        const topPosition = 24 + (toastIndex - 1) * 80;
        toast.style.top = `${topPosition}px`;
        
        const colors = {
            success: 'bg-green-500/90 text-white',
            error: 'bg-red-500/90 text-white',
            warning: 'bg-yellow-500/90 text-black',
            info: 'bg-blue-500/90 text-white'
        };
        
        toast.className += ` ${colors[type] || colors.info}`;
        
        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };
        
        toast.innerHTML = `
            <div class="flex items-center space-x-2">
                <i class="${icons[type] || icons.info}"></i>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.remove('translate-x-full');
        }, 100);
        
        setTimeout(() => {
            toast.classList.add('translate-x-full');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
                this._toastCounter = Math.max(0, this._toastCounter - 1);
            }, 300);
        }, duration);
    },
    
    validateForm: function(formData, validations) {
        const errors = {};
        
        for (const [field, value] of Object.entries(formData)) {
            if (validations[field]) {
                const validation = validations[field];
                
                if (validation.required && !this.isRequired(value)) {
                    errors[field] = validation.requiredMessage || 'Este campo é obrigatório';
                    continue;
                }
                
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
    
    clearForm: function(formId) {
        const form = document.getElementById(formId);
        if (form) {
            form.reset();
            const errorElements = form.querySelectorAll('[id*="error"]');
            errorElements.forEach(element => {
                element.classList.add('hidden');
            });
        }
    },
    
    redirect: function(url, delay = 0) {
        if (delay > 0) {
            setTimeout(() => {
                window.location.href = url;
            }, delay);
        } else {
            window.location.href = url;
        }
    },
    
    isCurrentPage: function(pageName) {
        return window.location.pathname.includes(pageName);
    },
    
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
    
    formatCurrency: function(value, currency = 'R$') {
        if (value === null || value === undefined) return `${currency} 0,00`;
        
        const number = parseFloat(value);
        if (isNaN(number)) return `${currency} 0,00`;
        
        return `${currency} ${number.toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`;
    },
    
    formatNumber: function(value, decimals = 2) {
        if (value === null || value === undefined) return '0';
        
        const number = parseFloat(value);
        if (isNaN(number)) return '0';
        
        return number.toLocaleString('pt-BR', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        });
    },
    
    showElement: function(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.classList.remove('hidden');
        }
    },
    
    hideElement: function(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.classList.add('hidden');
        }
    },

    toggleElement: function(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.classList.toggle('hidden');
        }
    },
    
    capitalize: function(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    },
    
    getInitials: function(name, maxLength = 2) {
        if (!name) return '';
        
        const words = name.trim().split(' ');
        const initials = words.map(word => word.charAt(0).toUpperCase()).join('');
        
        return initials.substring(0, maxLength);
    },
    
    truncate: function(str, maxLength = 50, suffix = '...') {
        if (!str || str.length <= maxLength) return str;
        return str.substring(0, maxLength) + suffix;
    },
    
    removeAccents: function(str) {
        if (!str) return '';
        return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    },
    
    filterByProperty: function(array, property, value) {
        return array.filter(item => item[property] === value);
    },
    
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
    
    saveToStorage: function(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('Erro ao salvar no localStorage:', error);
            return false;
        }
    },
    
    loadFromStorage: function(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('Erro ao carregar do localStorage:', error);
            return defaultValue;
        }
    },
    
    removeFromStorage: function(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Erro ao remover do localStorage:', error);
            return false;
        }
    },

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
    
    showModal: function({ title = 'Confirmação', message = '', onConfirm = null, onCancel = null, confirmText = 'Confirmar', cancelText = 'Cancelar' }) {
        const existing = document.getElementById('globalCustomModal');
        if (existing) existing.remove();

        const overlay = document.createElement('div');
        overlay.id = 'globalCustomModal';
        overlay.style.position = 'fixed';
        overlay.style.inset = '0';
        overlay.style.zIndex = '10000';
        overlay.style.background = 'rgba(10,11,15,0.75)';
        overlay.style.backdropFilter = 'blur(2px)';
        overlay.style.display = 'flex';
        overlay.style.alignItems = 'center';
        overlay.style.justifyContent = 'center';

        overlay.innerHTML = `
          <div class="glass rounded-2xl max-w-md w-full p-8 shadow-2xl animate-fade-in-up" style="background:rgba(26,27,35,0.98); border:1px solid rgba(255,255,255,0.08);">
            <h2 class="text-xl font-bold text-white mb-4">${title}</h2>
            <p class="text-gray-300 mb-8">${message}</p>
            <div class="flex justify-end gap-3">
              <button id="modalCancelBtn" class="px-6 py-3 bg-white/5 text-gray-300 rounded-xl hover:bg-white/10 transition-all font-medium">${cancelText}</button>
              <button id="modalConfirmBtn" class="btn-primary px-6 py-3 rounded-xl flex items-center space-x-2 hover-lift">${confirmText}</button>
            </div>
          </div>
        `;

        document.body.appendChild(overlay);

        overlay.addEventListener('click', (e) => {
          if (e.target === overlay) {
            overlay.remove();
            if (onCancel) onCancel();
          }
        });

        overlay.querySelector('#modalCancelBtn').onclick = () => {
          overlay.remove();
          if (onCancel) onCancel();
        };
        overlay.querySelector('#modalConfirmBtn').onclick = () => {
          overlay.remove();
          if (onConfirm) onConfirm();
        };
    },

};

window.Utils = Utils; 

window.showGlobalLoading = function() {
  const el = document.getElementById('globalLoading');
  if (el) el.style.display = 'flex';
}
window.hideGlobalLoading = function() {
  const el = document.getElementById('globalLoading');
  if (el) el.style.display = 'none';
} 