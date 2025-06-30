// Script da página de setores para HyperEfficient

window.addEventListener('DOMContentLoaded', function() {
  initAuthGuard();
      
  // Variáveis globais
  let setores = [];
  let setorEmEdicao = null;
  let filtroAtual = '';

  // AGUARDAR CARREGAMENTO DOS SCRIPTS NECESSÁRIOS
  function waitForDependencies() {
    return new Promise((resolve) => {
      const checkDeps = () => {
        if (window.Utils && window.API_CONFIG) {
          resolve();
        } else {
          setTimeout(checkDeps, 50);
        }
      };
      checkDeps();
    });
  }

  // ELEMENTOS DO DOM
  const loadingContainer = document.getElementById('loadingContainer');
  const tableContainer = document.getElementById('tableContainer');
  const emptyContainer = document.getElementById('emptyContainer');
  const errorContainer = document.getElementById('errorContainer');
  const errorMessageElement = document.getElementById('errorMessage');
  const setoresTableBody = document.getElementById('setoresTableBody');
  const searchInput = document.getElementById('searchInput');

  const addSetorBtn = document.getElementById('addSetorBtn');
  const addFirstSetorBtn = document.getElementById('addFirstSetorBtn');

  const setorModal = document.getElementById('setorModal');
  const setorModalTitle = document.getElementById('setorModalTitle');
  const closeSetorModal = document.getElementById('closeSetorModal');
  const setorForm = document.getElementById('setorForm');
  const setorNomeInput = document.getElementById('setorNome');
  const setorFormError = document.getElementById('setorFormError');
  const cancelSetorBtn = document.getElementById('cancelSetorBtn');
  const saveSetorBtn = document.getElementById('saveSetorBtn');
  const saveSetorBtnText = document.getElementById('saveSetorBtnText');
  const saveSetorBtnLoading = document.getElementById('saveSetorBtnLoading');

  const confirmModal = document.getElementById('confirmModal');
  const modalIcon = document.getElementById('modalIcon');
  const modalTitle = document.getElementById('modalTitle');
  const modalMessage = document.getElementById('modalMessage');
  const modalCancelBtn = document.getElementById('modalCancelBtn');
  const modalConfirmBtn = document.getElementById('modalConfirmBtn');

  // FUNÇÕES DE UI
  function showLoading() {
    loadingContainer.classList.remove('hidden');
    tableContainer.classList.add('hidden');
    emptyContainer.classList.add('hidden');
    errorContainer.classList.add('hidden');
  }

  function showTable() {
    loadingContainer.classList.add('hidden');
    tableContainer.classList.remove('hidden');
    emptyContainer.classList.add('hidden');
    errorContainer.classList.add('hidden');
  }

  function showEmpty() {
    loadingContainer.classList.add('hidden');
    tableContainer.classList.add('hidden');
    emptyContainer.classList.remove('hidden');
    errorContainer.classList.add('hidden');
  }

  function showError(message) {
    errorMessageElement.textContent = message;
    loadingContainer.classList.add('hidden');
    tableContainer.classList.add('hidden');
    emptyContainer.classList.add('hidden');
    errorContainer.classList.remove('hidden');
  }

  // FUNÇÕES DE DADOS
  async function carregarSetores() {
    showLoading();
    try {
      const response = await API_CONFIG.publicRequest('/setores');
      setores = response.data;
      renderizarTabela();
    } catch (error) {
      showError('Erro ao carregar setores: ' + error.message);
    }
  }

  function renderizarTabela() {
    setoresTableBody.innerHTML = '';
    const setoresFiltrados = setores.filter(s => 
      s.nome.toLowerCase().includes(filtroAtual.toLowerCase())
    );

    if (setoresFiltrados.length === 0 && filtroAtual === '') {
      showEmpty();
      return;
    }

    showTable();
    setoresFiltrados.forEach(setor => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="p-2 align-middle bg-transparent border-b dark:border-white/40 whitespace-nowrap shadow-transparent">
          <div class="flex px-2 py-1">
            <div class="flex flex-col justify-center">
              <h6 class="mb-0 text-sm leading-normal dark:text-white">${setor.nome}</h6>
            </div>
          </div>
        </td>
        <td class="p-2 text-center align-middle bg-transparent border-b dark:border-white/40 whitespace-nowrap shadow-transparent">
          <span class="text-xs font-semibold leading-tight dark:text-white dark:opacity-80 text-slate-400">R$ ${setor.gastoGeral?.toFixed(2) || '0.00'}</span>
        </td>
        <td class="p-2 align-middle bg-transparent border-b dark:border-white/40 whitespace-nowrap shadow-transparent text-center">
          <a href="javascript:;" class="text-xs font-semibold leading-tight dark:text-white dark:opacity-80 text-blue-500 mr-4" onclick="abrirModalEdicao(${setor.id})">Editar</a>
          <a href="javascript:;" class="text-xs font-semibold leading-tight dark:text-white dark:opacity-80 text-red-500" onclick="confirmarExclusao(${setor.id})">Excluir</a>
        </td>
      `;
      setoresTableBody.appendChild(tr);
    });
  }

  // FUNÇÕES DE MODAL
  function abrirModalCriacao() {
    setorEmEdicao = null;
    setorModalTitle.textContent = 'Novo Setor';
    setorForm.reset();
    setorModal.classList.remove('hidden');
  }

  window.abrirModalEdicao = function(id) {
    setorEmEdicao = setores.find(s => s.id === id);
    if (!setorEmEdicao) return;
    setorModalTitle.textContent = 'Editar Setor';
    setorNomeInput.value = setorEmEdicao.nome;
    setorModal.classList.remove('hidden');
  }

  function fecharModalSetor() {
    setorModal.classList.add('hidden');
    setorFormError.classList.add('hidden');
  }

  async function salvarSetor(e) {
    e.preventDefault();
    const nome = setorNomeInput.value.trim();
    if (!nome) {
      setorFormError.textContent = 'O nome do setor é obrigatório.';
      setorFormError.classList.remove('hidden');
      return;
    }

    Utils.showButtonLoading('saveSetorBtn', 'Salvando...');
    
    try {
      if (setorEmEdicao) {
        await API_CONFIG.publicRequest('/setores', {
          method: 'PUT',
          body: JSON.stringify({ id: setorEmEdicao.id, nome: nome })
        });
        Utils.showToast('Setor atualizado com sucesso!', 'success');
      } else {
        await API_CONFIG.publicRequest('/setores', {
          method: 'POST',
          body: JSON.stringify({ nome: nome })
        });
        Utils.showToast('Setor criado com sucesso!', 'success');
      }
      fecharModalSetor();
      carregarSetores();
    } catch (error) {
      Utils.showToast('Erro ao salvar setor: ' + error.message, 'error');
    } finally {
      Utils.hideButtonLoading('saveSetorBtn');
    }
  }

  // FUNÇÕES DE EXCLUSÃO
  window.confirmarExclusao = function(id) {
    modalTitle.textContent = 'Confirmar Exclusão';
    modalMessage.textContent = 'Tem certeza que deseja excluir este setor? Esta ação não pode ser desfeita.';
    modalIcon.className = 'fas fa-exclamation-triangle text-red-500 text-2xl';
    modalConfirmBtn.className = 'px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors';
    
    confirmModal.classList.remove('hidden');

    modalConfirmBtn.onclick = () => excluirSetor(id);
    modalCancelBtn.onclick = () => confirmModal.classList.add('hidden');
    confirmModal.onclick = (e) => {
      if (e.target === confirmModal) {
        confirmModal.classList.add('hidden');
      }
    };
  }

  async function excluirSetor(id) {
    try {
      await API_CONFIG.publicRequest(`/setores/${id}`, { method: 'DELETE' });
      Utils.showToast('Setor excluído com sucesso!', 'success');
      carregarSetores();
    } catch (error) {
      Utils.showToast('Erro ao excluir setor: ' + error.message, 'error');
    } finally {
      confirmModal.classList.add('hidden');
    }
  }

  // EVENT LISTENERS
  searchInput.addEventListener('input', (e) => {
    filtroAtual = e.target.value;
    renderizarTabela();
  });

  addSetorBtn.addEventListener('click', abrirModalCriacao);
  addFirstSetorBtn.addEventListener('click', abrirModalCriacao);
  closeSetorModal.addEventListener('click', fecharModalSetor);
  cancelSetorBtn.addEventListener('click', fecharModalSetor);
  setorForm.addEventListener('submit', salvarSetor);

  // INICIALIZAÇÃO
  waitForDependencies().then(() => {
    carregarSetores();
  });

}); 