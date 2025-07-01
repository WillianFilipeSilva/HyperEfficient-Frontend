// ========================================
// PÁGINA DE SETORES - Usando Tabela Genérica
// ========================================

class SetoresPage {
  constructor() {
    this.currentPage = 1
    this.searchTerm = ""
    this.editingItem = null
    this.table = null
    // Garantir modal fechada e listeners únicos
    const modal = document.getElementById("modalSetor");
    if (modal && !modal.classList.contains("hidden")) {
      modal.classList.add("hidden");
    }
    const btnCancelar = document.getElementById("btnCancelar");
    if (btnCancelar) btnCancelar.onclick = () => this.closeModal();
    if (modal) {
      modal.onclick = (e) => {
        if (e.target === modal) this.closeModal();
      };
    }
    this.init()
  }
  
  init() {
    this.setupEventListeners()
    this.createTable()
    this.loadData()
  }
  
  createTable() {
    const self = this;
    const tableConfig = {
      containerId: "setoresTableContainer",
      title: "Listagem de Setores",
      
      columns: [
        { field: "id", label: "ID" },
        { field: "nome", label: "Nome" },
      ],
      
      data: [],
      loading: true,
      
      pagination: {
        enabled: true,
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        pageSize: 10,
        onPageChange: (page) => this.handlePageChange(page)
      },
      
      addButton: {
        enabled: true,
        label: "Cadastrar",
        onClick: () => window.setoresPage && window.setoresPage.openAddModal()
      },
      
      search: {
        enabled: true,
        placeholder: "Buscar setores...",
        onSearch: (term) => this.handleSearch(term)
      },
      
      actions: {
        enabled: true,
        edit: {
          enabled: true,
          label: "Editar",
          icon: "fas fa-edit",
          onClick: (item) => this.openEditModal(item)
        },
        delete: {
          enabled: true,
          label: "Excluir",
          icon: "fas fa-trash",
          onClick: (item) => this.handleDelete(item)
        }
      },
      
      styling: {
        striped: true,
        hover: true,
        responsive: true
      }
    }
    
    this.table = new GenericTable(tableConfig)
  }
  
  setupEventListeners() {
    // Botão adicionar
    const btnAdicionar = document.getElementById("btnAdicionarSetor")
    if (btnAdicionar) {
      btnAdicionar.addEventListener("click", () => this.openAddModal())
    }
    
    // Modal
    this.setupModalListeners()
  }
  
  setupModalListeners() {
    const modal = document.getElementById("modalSetor")
    const btnClose = document.getElementById("modalClose")
    const btnCancelar = document.getElementById("btnCancelar")
    const form = document.getElementById("formSetor")
    
    if (btnClose) {
      btnClose.addEventListener("click", () => this.closeModal())
    }
    
    if (btnCancelar) {
      btnCancelar.addEventListener("click", () => this.closeModal())
    }
    
    if (modal) {
      modal.addEventListener("click", (e) => {
        if (e.target === e.currentTarget) this.closeModal()
      })
    }
    
    if (form) {
      form.addEventListener("submit", (e) => this.handleSubmit(e))
    }
  }
  
  async loadData() {
    try {
      this.table.setLoading(true)
      
      let url = `${window.API_CONFIG.ENDPOINTS.SETORES}/paged?page=${this.currentPage}&pageSize=10`
      if (this.searchTerm) {
        url += `&search=${encodeURIComponent(this.searchTerm)}`
      }
      
      const response = await window.API_CONFIG.authenticatedRequest(url)
      
      // Atualizar tabela
      this.table.updateData(response.Data || response.data || [])
      this.table.updatePagination({
        currentPage: response.Page || this.currentPage,
        totalPages: response.TotalPages || response.totalPages || 1,
        totalItems: response.TotalItems || response.totalItems || 0
      })
      
    } catch (error) {
      console.error("Erro ao carregar setores:", error)
      window.Utils?.showToast("Erro ao carregar setores", "error")
    } finally {
      this.table.setLoading(false)
    }
  }
  
  handlePageChange(page) {
    this.currentPage = page
    this.loadData()
  }
  
  handleSearch(term) {
    this.searchTerm = term
    this.currentPage = 1 // Voltar para primeira página
    this.loadData()
  }
  
  openAddModal() {
    this.editingItem = null
    this.updateModalTitle("Cadastrar Setor")
    this.clearForm()
    this.openModal()
  }
  
  openEditModal(item) {
    this.editingItem = item
    this.updateModalTitle("Editar Setor")
    this.fillForm(item)
    this.openModal()
  }
  
  openModal() {
    const modal = document.getElementById("modalSetor")
    modal?.classList.remove("hidden")
  }
  
  closeModal() {
    const modal = document.getElementById("modalSetor")
    modal?.classList.add("hidden")
    this.editingItem = null
    this.clearForm()
  }
  
  updateModalTitle(title) {
    const modalTitle = document.getElementById("modalTitle")
    if (modalTitle) {
      modalTitle.textContent = title
    }
  }
  
  fillForm(item) {
    const form = document.getElementById("formSetor")
    if (form && item) {
      form.nome.value = item.nome || ""
    }
  }
  
  clearForm() {
    const form = document.getElementById("formSetor")
    if (form) {
      form.reset()
    }
  }
  
  async handleSubmit(e) {
    e.preventDefault()
    
    const formData = new FormData(e.target)
    const data = {
      nome: formData.get("nome"),
      ativo: true
    }
    
    if (!data.nome) {
      window.Utils?.showToast("Nome é obrigatório", "error")
      return
    }
    
    try {
      this.showButtonLoading(true)
      
      if (this.editingItem) {
        // Atualizar
        await window.API_CONFIG.authenticatedRequest(window.API_CONFIG.ENDPOINTS.SETORES, {
          method: "PUT",
          body: JSON.stringify({ ...data, id: this.editingItem.id })
        })
        window.Utils?.showToast("Setor atualizado com sucesso!", "success")
      } else {
        // Criar
        await window.API_CONFIG.authenticatedRequest(window.API_CONFIG.ENDPOINTS.SETORES, {
          method: "POST",
          body: JSON.stringify(data)
        })
        window.Utils?.showToast("Setor criado com sucesso!", "success")
      }
      
      this.closeModal()
      this.loadData()
      
    } catch (error) {
      console.error("Erro ao salvar setor:", error)
      window.Utils?.showToast(error.message || "Erro ao salvar setor", "error")
    } finally {
      this.showButtonLoading(false)
    }
  }
  
  async handleDelete(item) {
    if (!confirm(`Deseja excluir o setor "${item.nome}"?`)) {
      return
    }
    
    try {
      await window.API_CONFIG.authenticatedRequest(`${window.API_CONFIG.ENDPOINTS.SETORES}/${item.id}`, {
        method: "DELETE"
      })
      
      window.Utils?.showToast("Setor excluído com sucesso!", "success")
      this.loadData()
      
    } catch (error) {
      console.error("Erro ao excluir setor:", error)
      window.Utils?.showToast("Erro ao excluir setor", "error")
    }
  }
  
  showButtonLoading(show) {
    const btn = document.getElementById("btnSalvar")
    const textSpan = btn?.querySelector("[data-text]")
    const loadingSpan = btn?.querySelector("[data-loading]")
    
    if (show) {
      textSpan?.classList.add("hidden")
      loadingSpan?.classList.remove("hidden")
      btn?.setAttribute("disabled", "true")
    } else {
      textSpan?.classList.remove("hidden")
      loadingSpan?.classList.add("hidden")
      btn?.removeAttribute("disabled")
    }
  }
}

// Inicializar quando DOM carregar
let setoresPage
window.addEventListener("DOMContentLoaded", async () => {
  // Safety: garantir que a modal comece fechada
  const modal = document.getElementById("modalSetor");
  if (modal && !modal.classList.contains("hidden")) {
    modal.classList.add("hidden");
  }
  // Aguardar dependências
  const checkDependencies = () => {
    if (window.Utils && window.API_CONFIG && window.GenericTable) {
      window.initAuthGuard()
      setoresPage = new SetoresPage()
      window.setoresPage = setoresPage
      setoresPage.setupModalListeners()
    } else {
      setTimeout(checkDependencies, 100)
    }
  }
  checkDependencies()
})

window.addEventListener("DOMContentLoaded", function() {
  setTimeout(function() {
    var modal = document.getElementById("modalSetor");
    if (modal && !modal.classList.contains("hidden")) {
      modal.classList.add("hidden");
    }
    // Patch: garantir listeners corretos
    var btnCancelar = document.getElementById("btnCancelar");
    if (btnCancelar) btnCancelar.onclick = function() { modal.classList.add("hidden"); };
    modal && modal.addEventListener("click", function(e) {
      if (e.target === e.currentTarget) modal.classList.add("hidden");
    });
  }, 100);
}); 