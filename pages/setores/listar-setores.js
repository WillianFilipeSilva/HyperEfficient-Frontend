class SetoresPage {
  constructor() {
    this.currentPage = 1
    this.searchTerm = ""
    this.editingItem = null
    this.table = null

    const modal = document.getElementById("modalSetor")
    if (modal && !modal.classList.contains("hidden")) {
      modal.classList.add("hidden")
    }

    this.init()
  }

  init() {
    this.setupEventListeners()
    this.createTable()
    this.loadData()
  }

  createTable() {
    const tableConfig = {
      containerId: "setoresTableContainer",
      title: "Listagem de Setores",

      columns: [
        { field: "nome", label: "Nome" },
        { field: "descricao", label: "Descrição" },
      ],

      data: [],
      loading: true,

      pagination: {
        enabled: true,
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        pageSize: 10,
        onPageChange: (page) => this.handlePageChange(page),
      },

      addButton: {
        enabled: true,
        label: "Novo Setor",
        onClick: () => this.openAddModal(),
      },

      search: {
        enabled: true,
        placeholder: "Buscar setores...",
        onSearch: (term) => this.handleSearch(term),
      },

      actions: {
        enabled: true,
        edit: {
          enabled: true,
          label: "Editar",
          icon: "fas fa-edit",
          onClick: (item) => this.openEditModal(item),
        },
        delete: {
          enabled: true,
          label: "Excluir",
          icon: "fas fa-trash",
          onClick: (item) => this.handleDelete(item),
        },
      },

      styling: {
        striped: true,
        hover: true,
        responsive: true,
      },
    }

    this.table = new ModernTable(tableConfig)
  }

  setupEventListeners() {
    this.setupModalListeners()
  }

  setupModalListeners() {
    const modal = document.getElementById("modalSetor")
    const btnCancelar = document.getElementById("btnCancelar")
    const form = document.getElementById("formSetor")

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

      this.table.updateData(response.Data || response.data || [])
      this.table.updatePagination({
        currentPage: response.Page || this.currentPage,
        totalPages: response.TotalPages || response.totalPages || 1,
        totalItems: response.TotalItems || response.totalItems || 0,
      })
    } catch (error) {
      console.error("Erro ao carregar setores:", error)
      this.showToast("Erro ao carregar setores", "error")
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
    this.currentPage = 1
    this.loadData()
  }

  openAddModal() {
    this.editingItem = null
    this.updateModalTitle("Novo Setor")
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
      form.descricao.value = item.descricao || ""
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
      descricao: formData.get("descricao"),
    }

    if (!data.nome) {
      this.showToast("Nome é obrigatório", "error")
      return
    }

    try {
      this.showButtonLoading(true)

      if (this.editingItem) {
        await window.API_CONFIG.authenticatedRequest(window.API_CONFIG.ENDPOINTS.SETORES, {
          method: "PUT",
          body: JSON.stringify({ ...data, id: this.editingItem.id }),
        })
        this.showToast("Setor atualizado com sucesso!", "success")
      } else {
        await window.API_CONFIG.authenticatedRequest(window.API_CONFIG.ENDPOINTS.SETORES, {
          method: "POST",
          body: JSON.stringify(data),
        })
        this.showToast("Setor criado com sucesso!", "success")
      }

      this.closeModal()
      this.loadData()
    } catch (error) {
      console.error("Erro ao salvar setor:", error)
      this.showToast(error.message || "Erro ao salvar setor", "error")
    } finally {
      this.showButtonLoading(false)
    }
  }

  async handleDelete(item) {
    if (!confirm(`Deseja excluir o setor "${item.nome}"?\n\nEsta ação não pode ser desfeita.`)) {
      return
    }

    try {
      await window.API_CONFIG.authenticatedRequest(`${window.API_CONFIG.ENDPOINTS.SETORES}/${item.id}`, {
        method: "DELETE",
      })

      this.showToast("Setor excluído com sucesso!", "success")
      this.loadData()
    } catch (error) {
      console.error("Erro ao excluir setor:", error)
      this.showToast("Erro ao excluir setor", "error")
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

  showToast(message, type = "info") {
    if (window.Utils && window.Utils.showToast) {
      window.Utils.showToast(message, type)
      return
    }
    
    const toastCounter = window.toastCounter || 0
    window.toastCounter = toastCounter + 1
    
    const toast = document.createElement("div")
    const topPosition = 24 + (toastCounter) * 80
    toast.className = `fixed right-4 z-50 p-4 rounded-xl shadow-2xl transition-all duration-300 transform translate-x-full backdrop-blur-lg`
    toast.style.top = `${topPosition}px`

    const colors = {
      success: "bg-green-500/90 text-white",
      error: "bg-red-500/90 text-white",
      warning: "bg-yellow-500/90 text-black",
      info: "bg-blue-500/90 text-white",
    }

    toast.className += ` ${colors[type] || colors.info}`
    toast.innerHTML = `
      <div class="flex items-center space-x-2">
        <i class="fas ${this.getToastIcon(type)}"></i>
        <span>${message}</span>
      </div>
    `

    document.body.appendChild(toast)
    setTimeout(() => toast.classList.remove("translate-x-full"), 100)
    setTimeout(() => {
      toast.classList.add("translate-x-full")
      setTimeout(() => {
        toast.remove()
        window.toastCounter = Math.max(0, (window.toastCounter || 1) - 1)
      }, 300)
    }, 3000)
  }

  getToastIcon(type) {
    const icons = {
      success: "fa-check-circle",
      error: "fa-exclamation-circle",
      warning: "fa-exclamation-triangle",
      info: "fa-info-circle",
    }
    return icons[type] || icons.info
  }
}

class ModernTable {
  constructor(config) {
    this.config = config
    this.render()
  }

  render() {
    const container = document.getElementById(this.config.containerId)
    if (!container) return

    container.innerHTML = `
      <div class="glass rounded-2xl overflow-hidden">
        <div class="p-6 border-b border-white/10">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-xl font-semibold text-white">${this.config.title}</h2>
              <p class="text-gray-400 text-sm mt-1">Gerencie seus setores</p>
            </div>
            <div class="flex items-center space-x-4">
              <div class="relative">
                <i class="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                <input 
                  type="text" 
                  id="tableSearch"
                  placeholder="${this.config.search.placeholder}" 
                  class="pl-10 pr-4 py-3 w-80 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition-all"
                />
              </div>
              <button 
                id="tableAddBtn"
                class="btn-primary px-6 py-3 rounded-xl flex items-center space-x-2 hover-lift"
              >
                <i class="fas fa-plus"></i>
                <span>${this.config.addButton.label}</span>
              </button>
            </div>
          </div>
        </div>

        <div id="tableContent">
          <div id="loadingState" class="p-12 text-center">
            <div class="inline-flex items-center space-x-3">
              <div class="w-6 h-6 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
              <span class="text-gray-300">Carregando...</span>
            </div>
          </div>
        </div>
      </div>
    `

    this.setupEventListeners()
  }

  setupEventListeners() {
    const searchInput = document.getElementById("tableSearch")
    const addBtn = document.getElementById("tableAddBtn")

    if (searchInput) {
      let timeout
      searchInput.addEventListener("input", (e) => {
        clearTimeout(timeout)
        timeout = setTimeout(() => this.config.search.onSearch(e.target.value), 300)
      })
    }

    if (addBtn && this.config.addButton.onClick) {
      addBtn.addEventListener("click", this.config.addButton.onClick)
    }
  }

  updateData(data) {
    this.config.data = data
    this.renderTable()
  }

  renderTable() {
    const content = document.getElementById("tableContent")
    if (!content) return

    if (this.config.data.length === 0) {
      content.innerHTML = `
        <div class="p-12 text-center">
          <i class="fas fa-building text-4xl text-gray-500 mb-4"></i>
          <h3 class="text-lg font-semibold text-white mb-2">Nenhum setor encontrado</h3>
          <p class="text-gray-400">Comece criando seu primeiro setor</p>
        </div>
      `
      return
    }

    content.innerHTML = `
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-white/10">
              ${this.config.columns
                .map(
                  (col) => `
                <th class="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  ${col.label}
                </th>
              `,
                )
                .join("")}
              <th class="px-6 py-4 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-white/5">
            ${this.config.data
              .map(
                (item, index) => `
              <tr class="hover:bg-white/5 transition-all duration-200" style="animation-delay: ${index * 0.05}s;">
                ${this.config.columns
                  .map(
                    (col) => `
                  <td class="px-6 py-4">
                    ${
                      col.field === "nome"
                        ? `
                      <div class="flex items-center space-x-3">
                        <div class="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-xl flex items-center justify-center">
                          <i class="fas fa-building text-gray-900"></i>
                        </div>
                        <div>
                          <div class="text-white font-medium">${item[col.field]}</div>
                          <div class="text-xs text-gray-400">Setor • ID: ${item.id}</div>
                        </div>
                      </div>
                    `
                        : `
                      <span class="text-gray-300">${item[col.field]}</span>
                    `
                    }
                  </td>
                `,
                  )
                  .join("")}
                <td class="px-6 py-4">
                  <div class="flex items-center justify-center space-x-2">
                    <button 
                      onclick="setoresPage.openEditModal(${JSON.stringify(item).replace(/"/g, "&quot;")})"
                      class="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 hover:text-blue-300 transition-all"
                      title="Editar setor"
                    >
                      <i class="fas fa-edit"></i>
                    </button>
                    <button 
                      onclick="setoresPage.handleDelete(${JSON.stringify(item).replace(/"/g, "&quot;")})"
                      class="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 hover:text-red-300 transition-all"
                      title="Excluir setor"
                    >
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            `,
              )
              .join("")}
          </tbody>
        </table>
      </div>
      
      <div class="px-6 py-4 border-t border-white/10 bg-white/5">
        <div class="flex items-center justify-between">
          <div class="text-sm text-gray-400">
            <span>${this.config.data.length}</span> setores encontrados
          </div>
          <div class="text-xs text-gray-500">
            Última atualização: ${new Date().toLocaleTimeString("pt-BR", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        </div>
      </div>
    `
  }

  setLoading(loading) {
    const content = document.getElementById("tableContent")
    if (!content) return

    if (loading) {
      content.innerHTML = `
        <div class="p-12 text-center">
          <div class="inline-flex items-center space-x-3">
            <div class="w-6 h-6 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
            <span class="text-gray-300">Carregando setores...</span>
          </div>
        </div>
      `
    }
  }

  updatePagination(data) {
  }
}

let setoresPage
window.addEventListener("DOMContentLoaded", async () => {
  const modal = document.getElementById("modalSetor")
  if (modal && !modal.classList.contains("hidden")) {
    modal.classList.add("hidden")
  }

  const checkDependencies = () => {
    if (window.Utils && window.API_CONFIG) {
      window.initAuthGuard()
      setoresPage = new SetoresPage()
      window.setoresPage = setoresPage
      if (window.Utils && typeof window.Utils.setupLogoutButton === 'function') {
        window.Utils.setupLogoutButton();
      }
    } else {
      setTimeout(checkDependencies, 100)
    }
  }
  checkDependencies()
})
