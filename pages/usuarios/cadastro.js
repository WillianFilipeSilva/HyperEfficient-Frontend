// ========================================
// FORMULÁRIO DE CADASTRO DE USUÁRIOS
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('cadastroForm');
    const errorMessage = document.getElementById('errorMessage');
    const cadastroButton = document.getElementById('cadastroButton');
    const cadastroButtonText = document.getElementById('cadastroButtonText');
    const cadastroButtonLoading = document.getElementById('cadastroButtonLoading');

    // Aguardar dependências
    const checkDependencies = () => {
        if (window.Utils && window.API_CONFIG && window.AuthUtils) {
            initForm();
        } else {
            setTimeout(checkDependencies, 100);
        }
    };
    checkDependencies();

    async function initForm() {
        // Verificar se já está logado (usando handshake)
        if (window.AuthUtils && await AuthUtils.isLoggedIn()) {
            window.location.href = '/pages/dashboard/dashboard.html';
            return;
        }

        // Event listener para o formulário
        form.addEventListener('submit', handleSubmit);
    }

    async function handleSubmit(e) {
        e.preventDefault();
        
        // Validar formulário
        if (!validateForm()) {
            return;
        }

        // Mostrar loading
        showLoading(true);

        try {
            // Preparar dados
            const formData = {
                nome: document.getElementById('nome').value.trim(),
                email: document.getElementById('email').value.trim(),
                senha: document.getElementById('senha').value,
                ativo: true
            };

            // Fazer requisição para criar usuário
            const response = await window.API_CONFIG.authenticatedRequest(
                window.API_CONFIG.ENDPOINTS.USUARIOS,
                {
                    method: 'POST',
                    body: JSON.stringify(formData)
                }
            );

            // Sucesso
            if (window.Utils && window.Utils.showToast) {
                window.Utils.showToast('Conta criada com sucesso! Faça login para continuar.', 'success');
            }

            // Limpar formulário
            form.reset();
            hideError();

            // Redirecionar para login após 2 segundos
            setTimeout(() => {
                window.location.href = '/pages/auth/login.html';
            }, 2000);

        } catch (error) {
            console.error('Erro ao criar conta:', error);
            
            // Mostrar erro específico
            let errorMsg = 'Erro ao criar conta. Tente novamente.';
            
            if (error.response) {
                const errorData = await error.response.json().catch(() => ({}));
                if (errorData.message) {
                    errorMsg = errorData.message;
                } else if (errorData.errors) {
                    // Se houver múltiplos erros de validação
                    const firstError = Object.values(errorData.errors)[0];
                    errorMsg = Array.isArray(firstError) ? firstError[0] : firstError;
                }
            } else if (error.message) {
                errorMsg = error.message;
            }

            showError(errorMsg);
        } finally {
            showLoading(false);
        }
    }

    function validateForm() {
        const nomeInput = document.getElementById('nome');
        const emailInput = document.getElementById('email');
        const senhaInput = document.getElementById('senha');
        const confirmarSenhaInput = document.getElementById('confirmarSenha');

        if (!nomeInput || !emailInput || !senhaInput || !confirmarSenhaInput) {
            showError('Erro interno: campo do formulário não encontrado.');
            return false;
        }

        const nome = nomeInput.value.trim();
        const email = emailInput.value.trim();
        const senha = senhaInput.value;
        const confirmarSenha = confirmarSenhaInput.value;

        if (!nome) {
            showError('Nome é obrigatório');
            return false;
        }

        if (nome.length < 3) {
            showError('Nome deve ter pelo menos 3 caracteres');
            return false;
        }

        // Validar email
        if (!email) {
            showError('Email é obrigatório');
            return false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showError('Email inválido');
            return false;
        }

        // Validar senha
        if (!senha) {
            showError('Senha é obrigatória');
            return false;
        }

        if (senha.length < 6) {
            showError('Senha deve ter pelo menos 6 caracteres');
            return false;
        }

        // Validar confirmação de senha
        if (senha !== confirmarSenha) {
            showError('Senhas não coincidem');
            return false;
        }

        hideError();
        return true;
    }

    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.classList.remove('hidden');
        errorMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    function hideError() {
        errorMessage.classList.add('hidden');
    }

    function showLoading(show) {
        if (show) {
            cadastroButtonText.classList.add('hidden');
            cadastroButtonLoading.classList.remove('hidden');
            cadastroButton.disabled = true;
        } else {
            cadastroButtonText.classList.remove('hidden');
            cadastroButtonLoading.classList.add('hidden');
            cadastroButton.disabled = false;
        }
    }

    // Validação em tempo real
    const inputs = form.querySelectorAll('input, select');
    inputs.forEach(input => {
        input.addEventListener('blur', () => {
            if (input.value.trim()) {
                validateForm();
            }
        });
    });

    // Limpar erro quando usuário começar a digitar
    inputs.forEach(input => {
        input.addEventListener('input', () => {
            if (errorMessage.classList.contains('hidden') === false) {
                hideError();
            }
        });
    });
}); 