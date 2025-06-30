// Script de cadastro externo para HyperEfficient

window.addEventListener('DOMContentLoaded', function() {
  (async function() {
    if (window.AuthUtils && await AuthUtils.isLoggedIn()) {
      window.location.href = '/pages/dashboard/dashboard.html';
      return;
    }
    // Elementos do DOM
    const signupForm = document.getElementById('signupForm');
    const nomeInput = document.getElementById('nome');
    const emailInput = document.getElementById('email');
    const senhaInput = document.getElementById('senha');
    const signupButton = document.getElementById('signupButton');
    const errorMessage = document.getElementById('errorMessage');
    // Função para fazer cadastro
    async function fazerCadastro(nome, email, senha) {
      try {
        const data = await API_CONFIG.publicRequest(API_CONFIG.ENDPOINTS.CADASTRO, {
          method: 'POST',
          body: JSON.stringify({
            email: email,
            nome: nome,
            senha: senha
          })
        });
        // Mostrar sucesso e redirecionar
        Utils.showToast('Cadastro realizado com sucesso!', 'success');
        Utils.redirect('/pages/auth/login.html', 1500);
      } catch (error) {
        console.error('Erro no cadastro:', error);
        Utils.showError('errorMessage', error.message || 'Erro ao conectar com o servidor');
      }
    }
    // Event listener para o formulário
    signupForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      const nome = nomeInput.value.trim();
      const email = emailInput.value.trim();
      const senha = senhaInput.value.trim();
      // Validação usando Utils
      const formData = { nome, email, senha };
      const validations = {
        nome: {
          required: true,
          requiredMessage: 'Por favor, preencha o nome',
          minLength: 2,
          minLengthMessage: 'O nome deve ter pelo menos 2 caracteres'
        },
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
      Utils.showButtonLoading('signupButton', 'Cadastrando...');
      await fazerCadastro(nome, email, senha);
      Utils.hideButtonLoading('signupButton');
    });
    // Limpar erro quando o usuário começar a digitar
    nomeInput.addEventListener('input', () => Utils.hideError('errorMessage'));
    emailInput.addEventListener('input', () => Utils.hideError('errorMessage'));
    senhaInput.addEventListener('input', () => Utils.hideError('errorMessage'));
  })();
}); 