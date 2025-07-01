// ========================================
// PÁGINA DE EQUIPAMENTOS - Usando Tabela Genérica
// ========================================

class EquipamentosPage {
  constructor() {
    this.currentPage = 1
    this.searchTerm = ""
    this.editingItem = null
    this.table = null
    
    // Garantir modal fechada e listeners únicos
    const modal = document.getElementById("modalEquipamento");
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
      containerId: "equipamentosTableContainer",
      title: "Listagem de Equipamentos",
      
      columns: [
        { field: "id", label: "ID" },
        { field: "nome", label: "Nome" },
        { field: "categoria", label: "Categoria" },
        { field: "setor", label: "Setor" },
        { 
          field: "gastokwh", 
          label: "Gasto kW/h",
          format: (value) => value ? `${value} kW/h` : '-'
        },
        { 
          field: "ativo", 
          label: "Status",
          format: (value) => value ? 
            '<span class="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Ativo</span>' : 
            '<span class="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">Inativo</span>'
        },
        { field: "patrimonio", label: "Patrimônio" },
        { field: "dataAquisicao", label: "Data de Aquisição" }
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
        onClick: () => window.equipamentosPage && window.equipamentosPage.openAddModal()
      },
      
      search: {
        enabled: true,
        placeholder: "Buscar equipamentos...",
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
    const btnAdicionar = document.getElementById("btnAdicionarEquipamento")
    if (btnAdicionar) {
      btnAdicionar.addEventListener("click", () => this.openAddModal())
    }
    
    // Modal
    this.setupModalListeners()
  }
  
  setupModalListeners() {
    const modal = document.getElementById("modalEquipamento")
    const btnClose = document.getElementById("modalClose")
    const btnCancelar = document.getElementById("btnCancelar")
    const form = document.getElementById("formEquipamento")
    
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
      
      let url = `${window.API_CONFIG.ENDPOINTS.EQUIPAMENTOS}/paged?page=${this.currentPage}&pageSize=10`
      if (this.searchTerm) {
        url += `&search=${encodeURIComponent(this.searchTerm)}`
      }
      
      const response = await window.API_CONFIG.authenticatedRequest(url)
      
      // Processar dados para exibir nomes de categoria e setor
      const data = (response.Data || response.data || []).map(item => ({
        ...item,
        categoria: item.categoriaId === 1 ? "Industrial" : 
                  item.categoriaId === 2 ? "Comercial" : 
                  item.categoriaId === 3 ? "Residencial" : "N/A",
        setor: item.setorId === 1 ? "Produção" : 
               item.setorId === 2 ? "Administrativo" : 
               item.setorId === 3 ? "Manutenção" : "N/A"
      }))
      
      // Atualizar tabela
      this.table.updateData(data)
      this.table.updatePagination({
        currentPage: response.Page || this.currentPage,
        totalPages: response.TotalPages || response.totalPages || 1,
        totalItems: response.TotalItems || response.totalItems || data.length
      })
      
    } catch (error) {
      console.error("Erro ao carregar equipamentos:", error)
      window.Utils?.showToast("Erro ao carregar equipamentos", "error")
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
    this.updateModalTitle("Cadastrar Equipamento")
    this.clearForm()
    this.openModal()
  }
  
  openEditModal(item) {
    this.editingItem = item
    this.updateModalTitle("Editar Equipamento")
    this.fillForm(item)
    this.openModal()
  }
  
  openModal() {
    const modal = document.getElementById("modalEquipamento")
    modal?.classList.remove("hidden")
  }
  
  closeModal() {
    const modal = document.getElementById("modalEquipamento")
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
    const form = document.getElementById("formEquipamento")
    if (form && item) {
      form.nome.value = item.nome || ""
      form.categoriaId.value = item.categoriaId || ""
      form.setorId.value = item.setorId || ""
      form.gastokwh.value = item.gastokwh || ""
      form.descricao.value = item.descricao || ""
    }
  }
  
  clearForm() {
    const form = document.getElementById("formEquipamento")
    if (form) {
      form.reset()
    }
  }
  
  async handleSubmit(e) {
    e.preventDefault()
    
    const formData = new FormData(e.target)
    const data = {
      nome: formData.get("nome"),
      categoriaId: parseInt(formData.get("categoriaId")),
      setorId: parseInt(formData.get("setorId")),
      gastokwh: parseFloat(formData.get("gastokwh")),
      descricao: formData.get("descricao"),
      ativo: true
    }
    
    // Validação básica
    if (!data.nome || !data.categoriaId || !data.setorId || !data.gastokwh) {
      window.Utils?.showToast("Preencha todos os campos obrigatórios", "error")
      return
    }
    
    try {
      this.showButtonLoading(true)
      
      if (this.editingItem) {
        // Atualizar
        await window.API_CONFIG.authenticatedRequest(window.API_CONFIG.ENDPOINTS.EQUIPAMENTOS, {
          method: "PUT",
          body: JSON.stringify({ ...data, id: this.editingItem.id })
        })
        window.Utils?.showToast("Equipamento atualizado com sucesso!", "success")
      } else {
        // Criar
        await window.API_CONFIG.authenticatedRequest(window.API_CONFIG.ENDPOINTS.EQUIPAMENTOS, {
          method: "POST",
          body: JSON.stringify(data)
        })
        window.Utils?.showToast("Equipamento criado com sucesso!", "success")
      }
      
      this.closeModal()
      this.loadData()
      
    } catch (error) {
      console.error("Erro ao salvar equipamento:", error)
      window.Utils?.showToast("Erro ao salvar equipamento", "error")
    } finally {
      this.showButtonLoading(false)
    }
  }
  
  async handleDelete(item) {
    if (!confirm(`Deseja excluir o equipamento "${item.nome}"?`)) {
      return
    }
    
    try {
      await window.API_CONFIG.authenticatedRequest(`${window.API_CONFIG.ENDPOINTS.EQUIPAMENTOS}/${item.id}`, {
        method: "DELETE"
      })
      
      window.Utils?.showToast("Equipamento excluído com sucesso!", "success")
      this.loadData()
      
    } catch (error) {
      console.error("Erro ao excluir equipamento:", error)
      window.Utils?.showToast("Erro ao excluir equipamento", "error")
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
let equipamentosPage
window.addEventListener("DOMContentLoaded", function() {
  setTimeout(function() {
    var modal = document.getElementById("modalEquipamento");
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