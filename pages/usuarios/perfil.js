window.addEventListener('DOMContentLoaded', function () {
  initAuthGuard();

  let usuarioOriginal = null;
  let modoEdicao = false;

  const profileInitials = document.getElementById('profileInitials');
  const profileName = document.getElementById('profileName');
  const profileEmail = document.getElementById('profileEmail');

  const nameInput = document.getElementById('nameInput');
  const emailInput = document.getElementById('emailInput');
  const newPasswordInput = document.getElementById('newPasswordInput');
  const confirmPasswordInput = document.getElementById('confirmPasswordInput');
  const allInputs = [nameInput, emailInput, newPasswordInput, confirmPasswordInput];

  const editButton = document.getElementById('editButton');
  const saveButton = document.getElementById('saveButton');
  const cancelButton = document.getElementById('cancelButton');
  const errorMessageDiv = document.getElementById('errorMessage');

  function carregarInformacoesUsuario() {
    const usuario = AuthUtils.getCurrentUser();
    if (!usuario) {
      console.error("Usuário não encontrado no localStorage.");
      // Opcional: redirecionar para o login se o usuário não estiver logado
      // window.location.href = '/pages/auth/login.html';
      return;
    }

    usuarioOriginal = { ...usuario };
    
    // Header do Perfil
    profileName.textContent = usuario.nome;
    profileEmail.textContent = usuario.email;
    profileInitials.textContent = Utils.getInitials(usuario.nome);

    // Campos do formulário
    nameInput.value = usuario.nome;
    emailInput.value = usuario.email;
  }

  function alternarModoEdicao(editar) {
    modoEdicao = editar;
    
    if (editar) {
      editButton.classList.add('hidden');
      saveButton.classList.remove('hidden');
      cancelButton.classList.remove('hidden');
    } else {
      editButton.classList.remove('hidden');
      saveButton.classList.add('hidden');
      cancelButton.classList.add('hidden');
    }

    allInputs.forEach(input => {
      // O email não deve ser editável
      if (input.id !== 'emailInput') {
        input.disabled = !editar;
      }
    });

    // Limpa os campos de senha e erros ao sair do modo de edição
    if (!editar) {
      newPasswordInput.value = '';
      confirmPasswordInput.value = '';
      hideError();
      // Restaura os valores originais se o usuário cancelar
      nameInput.value = usuarioOriginal.nome;
    }
  }

  async function salvarAlteracoes() {
    hideError();
    const nome = nameInput.value.trim();
    const novaSenha = newPasswordInput.value;
    const confirmarSenha = confirmPasswordInput.value;

    if (!nome) {
      showError("O campo nome é obrigatório.");
      return;
    }

    if (novaSenha !== confirmarSenha) {
      showError("As senhas não coincidem.");
      return;
    }

    const payload = {
      id: usuarioOriginal.id,
      nome: nome,
    };
    
    if (novaSenha) {
      payload.senha = novaSenha;
    }
    
    Utils.showButtonLoading(saveButton);

    try {
      const response = await API_CONFIG.authenticatedRequest(`/usuarios/${usuarioOriginal.id}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      });

      // Atualiza o usuário no localStorage para refletir as mudanças
      const usuarioAtualizado = { ...usuarioOriginal, nome: nome };
      AuthUtils.saveUser(usuarioAtualizado);

      Utils.showToast('Perfil atualizado com sucesso!', 'success');
      carregarInformacoesUsuario(); // Recarrega as informações
      alternarModoEdicao(false); // Sai do modo de edição

    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
      showError(error.message || "Erro desconhecido ao salvar.");
    } finally {
      Utils.hideButtonLoading(saveButton);
    }
  }

  function showError(message) {
    errorMessageDiv.textContent = message;
    errorMessageDiv.classList.remove('hidden');
  }

  function hideError() {
    errorMessageDiv.classList.add('hidden');
  }

  function configurarBotoes() {
    editButton.addEventListener('click', () => alternarModoEdicao(true));
    saveButton.addEventListener('click', salvarAlteracoes);
    cancelButton.addEventListener('click', () => alternarModoEdicao(false));
  }
  
  // Inicialização
  waitForDependencies().then(() => {
    carregarInformacoesUsuario();
    configurarBotoes();
  });

  function waitForDependencies() {
    return new Promise((resolve) => {
      const check = () => {
        if (window.Utils && window.API_CONFIG && window.AuthUtils) {
          resolve();
        } else {
          setTimeout(check, 100);
        }
      };
      check();
    });
  }
}); 