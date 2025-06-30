// Script de login externo para HyperEfficient

window.addEventListener('DOMContentLoaded', function() {
  (async function() {
    if (window.AuthUtils && await AuthUtils.isLoggedIn()) {
      window.location.href = '/pages/dashboard/dashboard.html';
      return;
    }
    // Elementos do DOM
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const senhaInput = document.getElementById('senha');
    const loginButton = document.getElementById('loginButton');
    const errorMessage = document.getElementById('errorMessage');
    // Função para fazer login
    async function fazerLogin(email, senha) {
      try {
        const lembrarDeMim = document.getElementById('rememberMe').checked;
        const data = await API_CONFIG.publicRequest(API_CONFIG.ENDPOINTS.LOGIN, {
          method: 'POST',
          body: JSON.stringify({
            email: email,
            senha: senha,
            lembrarDeMim: lembrarDeMim
          })
        });
        // Sempre salvar no localStorage
        localStorage.setItem('token', data.token);
        localStorage.setItem('usuario', JSON.stringify(data.usuario));
        // Mostrar sucesso e redirecionar
        Utils.showToast('Login realizado com sucesso!', 'success');
        Utils.redirect('/pages/dashboard/dashboard.html', 1000);
      } catch (error) {
        console.error('Erro no login:', error);
        Utils.showError('errorMessage', error.message || 'Erro ao conectar com o servidor');
      }
    }
    // Event listener para o formulário
    loginForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      const email = emailInput.value.trim();
      const senha = senhaInput.value.trim();
      // Validação usando Utils
      const formData = { email, senha };
      const validations = {
        email: {
          required: true,
          requiredMessage: 'Por favor, preencha o email',
          email: true,
          emailMessage: 'Por favor, insira um email válido'
        },
        senha: {
          required: true,
          requiredMessage: 'Por favor, preencha a senha',
          minLength: 6,
          minLengthMessage: 'A senha deve ter pelo menos 6 caracteres'
        }
      };
      const validation = Utils.validateForm(formData, validations);
      if (!validation.isValid) {
        // Mostrar primeiro erro encontrado
        const firstError = Object.values(validation.errors)[0];
        Utils.showError('errorMessage', firstError);
        return;
      }
      Utils.hideError('errorMessage');
      Utils.showButtonLoading('loginButton', 'Entrando...');
      await fazerLogin(email, senha);
      Utils.hideButtonLoading('loginButton');
    });
    // Limpar erro quando o usuário começar a digitar
    emailInput.addEventListener('input', () => Utils.hideError('errorMessage'));
    senhaInput.addEventListener('input', () => Utils.hideError('errorMessage'));
  })();
}); 