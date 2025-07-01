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
    const currentPath = window.location.pathname;
    
    sidebarLinks.forEach(link => {
      const key = link.getAttribute('data-sidebar');
      const linkHref = link.getAttribute('href');
      
      // Verificar se o link atual corresponde à página atual
      let isActive = false;
      
      switch(key) {
        case 'dashboard':
          isActive = currentPath.includes('/dashboard/dashboard.html');
          break;
        case 'usuarios':
          isActive = currentPath.includes('/usuarios/listar-usuarios.html');
          break;
        case 'equipamentos':
          isActive = currentPath.includes('/equipamentos/listar-equipamentos.html');
          break;
        case 'setores':
          isActive = currentPath.includes('/setores/listar-setores.html');
          break;
        case 'perfil':
          isActive = currentPath.includes('/usuarios/perfil.html');
          break;
        default:
          isActive = currentPath === linkHref;
      }
      
      if (isActive) {
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
        if (confirm('Tem certeza que deseja sair da sua conta?')) {
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
        }
      });
    }
  }
})(); 