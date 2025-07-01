// ========================================
// PÁGINA DE CATEGORIAS - Usando Tabela Genérica
// ========================================

class CategoriasPage {
  constructor() {
    this.currentPage = 1
    this.searchTerm = ""
    this.editingItem = null
    this.table = null
    this.allCategorias = null
    this.filteredCategorias = null
    // Garantir modal fechada e listeners únicos
    const modal = document.getElementById("modalCategoria");
    if (modal && !modal.classList.contains("hidden")) {
      modal.classList.add("hidden");
    }
    const btnCancelar = document.getElementById("btnCancelarCategoria");
    if (btnCancelar) btnCancelar.onclick = () => this.closeModal();
    if (modal) {
      modal.onclick = (e) => {
        if (e.target === modal) this.closeModal();
      };
    }
    this.init()
  }
  init() {
    this.createTable()
    this.loadData()
  }
  createTable() {
    const tableConfig = {
      containerId: "categoriasTableContainer",
      title: "Listagem de Categorias",
      columns: [
        { field: "id", label: "ID" },
        { field: "nome", label: "Nome" },
      ],
      data: [],
      loading: true,
      pagination: {
        enabled: false
      },
      addButton: {
        enabled: true,
        label: "Cadastrar",
        onClick: () => window.categoriasPage && window.categoriasPage.openAddModal()
      },
      search: {
        enabled: true,
        placeholder: "Buscar categorias...",
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
  async loadData() {
    try {
      this.table.setLoading(true)
      const response = await window.API_CONFIG.authenticatedRequest(window.API_CONFIG.ENDPOINTS.CATEGORIAS)
      this.allCategorias = response.Data || response.data || response || []
      this.filteredCategorias = this.allCategorias
      this.table.updateData(this.filteredCategorias)
    } catch (error) {
      console.error("Erro ao carregar categorias:", error)
      window.Utils?.showToast("Erro ao carregar categorias", "error")
    } finally {
      this.table.setLoading(false)
    }
  }
  handleSearch(term) {
    if (!this.allCategorias) return
    const lowerTerm = term.toLowerCase()
    this.filteredCategorias = this.allCategorias.filter(cat =>
      cat.nome && cat.nome.toLowerCase().includes(lowerTerm)
    )
    this.table.updateData(this.filteredCategorias)
  }
  handlePageChange(page) {
  }
  openAddModal() {
    this.editingItem = null;
    this.updateModalTitle("Cadastrar Categoria");
    this.clearForm();
    this.openModal();
  }
  openEditModal(item) {
    this.editingItem = item;
    this.updateModalTitle("Editar Categoria");
    this.fillForm(item);
    this.openModal();
  }
  openModal() {
    const modal = document.getElementById("modalCategoria");
    modal?.classList.remove("hidden");
  }
  closeModal() {
    const modal = document.getElementById("modalCategoria");
    modal?.classList.add("hidden");
    this.editingItem = null;
    this.clearForm();
  }
  updateModalTitle(title) {
    const modalTitle = document.getElementById("modalTitleCategoria");
    if (modalTitle) {
      modalTitle.textContent = title;
    }
  }
  fillForm(item) {
    const form = document.getElementById("formCategoria");
    if (form && item) {
      form.nome.value = item.nome || "";
    }
  }
  clearForm() {
    const form = document.getElementById("formCategoria");
    if (form) {
      form.reset();
    }
  }
  async handleSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      nome: formData.get("nome"),
    };
    if (!data.nome) {
      window.Utils?.showToast("Nome é obrigatório", "error");
      return;
    }
    try {
      this.showButtonLoading(true);
      if (this.editingItem) {
        // Atualizar categoria
        await window.API_CONFIG.authenticatedRequest(window.API_CONFIG.ENDPOINTS.CATEGORIAS, {
          method: "PUT",
          body: JSON.stringify({ ...data, id: this.editingItem.id })
        });
        window.Utils?.showToast("Categoria atualizada com sucesso!", "success");
      } else {
        // Criar categoria
        await window.API_CONFIG.authenticatedRequest(window.API_CONFIG.ENDPOINTS.CATEGORIAS, {
          method: "POST",
          body: JSON.stringify(data)
        });
        window.Utils?.showToast("Categoria criada com sucesso!", "success");
      }
      this.closeModal();
      this.loadData();
    } catch (error) {
      window.Utils?.showToast(error.message || "Erro ao salvar categoria", "error");
    } finally {
      this.showButtonLoading(false);
    }
  }
  showButtonLoading(show) {
    const btn = document.getElementById("btnSalvarCategoria");
    if (!btn) return;
    const textSpan = btn.querySelector('[data-text]');
    const loadingSpan = btn.querySelector('[data-loading]');
    if (show) {
      textSpan?.classList.add("hidden");
      loadingSpan?.classList.remove("hidden");
      btn.disabled = true;
    } else {
      textSpan?.classList.remove("hidden");
      loadingSpan?.classList.add("hidden");
      btn.disabled = false;
    }
  }
  setupModalListeners() {
    const modal = document.getElementById("modalCategoria");
    const btnCancelar = document.getElementById("btnCancelarCategoria");
    const form = document.getElementById("formCategoria");
    if (btnCancelar) btnCancelar.addEventListener("click", () => this.closeModal());
    if (modal) {
      modal.addEventListener("click", (e) => {
        if (e.target === e.currentTarget) this.closeModal();
      });
    }
    if (form) {
      form.addEventListener("submit", (e) => this.handleSubmit(e));
    }
  }
  handleDelete(item) {
    // Implemente a exclusão se desejar
    window.Utils?.showToast("Funcionalidade de exclusão ainda não implementada.", "info")
  }
}

// Inicializar quando DOM carregar
let categoriasPage
window.addEventListener("DOMContentLoaded", async () => {
  // Safety: garantir que a modal comece fechada
  const modal = document.getElementById("modalCategoria");
  if (modal && !modal.classList.contains("hidden")) {
    modal.classList.add("hidden");
  }
  const checkDependencies = () => {
    if (window.Utils && window.API_CONFIG && window.GenericTable) {
      window.initAuthGuard()
      categoriasPage = new CategoriasPage()
      window.categoriasPage = categoriasPage
      categoriasPage.setupModalListeners()
    } else {
      setTimeout(checkDependencies, 100)
    }
  }
  checkDependencies()
}) 