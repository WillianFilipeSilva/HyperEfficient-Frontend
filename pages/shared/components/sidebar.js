// Sidebar inteligente HyperEfficient
(function() {
  // Caminho absoluto do componente (sempre a partir da raiz do projeto)
  const sidebarPath = '/pages/shared/components/sidebar.html';

  // Função para inserir sidebar
  fetch(sidebarPath)
    .then(res => {
      if (!res.ok) throw new Error('Sidebar não encontrada: ' + sidebarPath);
      return res.text();
    })
    .then(html => {
      const temp = document.createElement('div');
      temp.innerHTML = html;
      document.body.insertAdjacentElement('afterbegin', temp.firstElementChild);
      highlightActiveSidebar();
      setupSidebarLogout();
    })
    .catch(err => {
      console.error('Erro ao carregar sidebar:', err);
    });

  // Destacar item ativo
  function highlightActiveSidebar() {
    const sidebarLinks = document.querySelectorAll('[data-sidebar]');
    const page = window.location.pathname.split('/').pop().replace('.html', '');
    sidebarLinks.forEach(link => {
      const key = link.getAttribute('data-sidebar');
      if (
        (key === 'dashboard' && page === 'dashboard') ||
        (key === 'listagem' && page === 'listagem') ||
        (key === 'setores' && page.includes('setor')) ||
        (key === 'perfil' && page === 'perfil')
      ) {
        link.classList.add('bg-blue-500/13', 'font-semibold', 'text-slate-700');
      } else {
        link.classList.remove('bg-blue-500/13', 'font-semibold', 'text-slate-700');
      }
    });
  }

  // Ativar botão de logout
  function setupSidebarLogout() {
    const btn = document.getElementById('logoutBtnSidebar');
    if (btn) {
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        if (window.Utils && typeof Utils.showModal === 'function') {
          Utils.showModal({
            message: 'Tem certeza que deseja sair da sua conta?',
            title: 'Sair',
            onConfirm: function() {
              if (window.Utils && window.Utils.showToast) {
                Utils.showToast('Logout realizado com sucesso!', 'info');
              }
              if (window.AuthUtils && typeof AuthUtils.logout === 'function') {
                AuthUtils.logout();
                setTimeout(function() { window.location.reload(); }, 500);
              } else {
                // fallback
                localStorage.clear();
                sessionStorage.clear();
                window.location.href = '/pages/auth/login.html';
              }
              // Fechar modal se ainda estiver aberto
              const overlay = document.getElementById('modalGenericOverlay');
              if (overlay) overlay.classList.add('hidden');
            }
          });
        }
      });
    }
  }
})(); 