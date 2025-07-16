class CategoriasPage {
  constructor() {
    this.searchTerm = ""
    this.editingItem = null
    this.table = null

    const modal = document.getElementById("modalCategoria")
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
      containerId: "categoriasTableContainer",
      title: "Listagem de Categorias",

      columns: [
        { field: "nome", label: "Nome" },
      ],

      data: [],
      loading: true,

      addButton: {
        enabled: true,
        label: "Nova Categoria",
        onClick: () => this.openAddModal(),
      },

      search: {
        enabled: true,
        placeholder: "Buscar categorias...",
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

    this.table = new ModernCategoriasTable(tableConfig)
  }

  setupEventListeners() {
    this.setupModalListeners()
  }

  setupModalListeners() {
    const modal = document.getElementById("modalCategoria")
    const btnCancelar = document.getElementById("btnCancelar")
    const form = document.getElementById("formCategoria")

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
      
      const response = await window.API_CONFIG.authenticatedRequest(window.API_CONFIG.ENDPOINTS.CATEGORIAS)
      let data = response.Data || response.data || []

      if (this.searchTerm) {
        const searchTerm = this.searchTerm.toLowerCase()
        data = data.filter(categoria => 
          categoria.nome.toLowerCase().includes(searchTerm)
        )
      }

      this.table.updateData(data)
    } catch (error) {
      console.error('Erro ao carregar categorias:', error)
      this.showToast('Erro ao carregar categorias', 'error')
    } finally {
      this.table.setLoading(false)
    }
  }

  handleSearch(term) {
    this.searchTerm = term
    this.loadData()
  }

  openAddModal() {
    this.editingItem = null
    this.updateModalTitle("Nova Categoria")
    this.clearForm()
    this.openModal()
  }

  openEditModal(item) {
    this.editingItem = item
    this.updateModalTitle("Editar Categoria")
    this.fillForm(item)
    this.openModal()
  }

  openModal() {
    const modal = document.getElementById("modalCategoria")
    if (modal) {
      modal.classList.remove("hidden")
      setTimeout(() => {
        const nomeInput = document.getElementById("nome")
        if (nomeInput) nomeInput.focus()
      }, 100)
    }
  }

  closeModal() {
    const modal = document.getElementById("modalCategoria")
    if (modal) {
      modal.classList.add("hidden")
    }
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
    const nomeInput = document.getElementById("nome")
    if (nomeInput && item) {
      nomeInput.value = item.nome || ""
    }
  }

  clearForm() {
    const nomeInput = document.getElementById("nome")
    if (nomeInput) {
      nomeInput.value = ""
    }
  }

  async handleSubmit(e) {
    e.preventDefault()
    
    const nomeInput = document.getElementById("nome")
    const nome = nomeInput?.value?.trim()

    if (!nome) {
      this.showToast("Nome é obrigatório", "error")
      return
    }

    this.showButtonLoading(true)

    try {
      let url = window.API_CONFIG.ENDPOINTS.CATEGORIAS
      let options
      if (this.editingItem) {
        options = {
          method: "PUT",
          body: JSON.stringify({ id: this.editingItem.id, nome }),
        }
      } else {
        options = {
          method: "POST",
          body: JSON.stringify({ nome }),
        }
      }

      const response = await window.API_CONFIG.authenticatedRequest(url, options)

      if (response.success !== false) {
        this.showToast(
          this.editingItem ? "Categoria atualizada com sucesso!" : "Categoria criada com sucesso!",
          "success"
        )
        this.closeModal()
        this.loadData()
      } else {
        this.showToast("Erro ao salvar categoria", "error")
      }
    } catch (error) {
      console.error("Erro ao salvar categoria:", error)
      this.showToast("Erro ao salvar categoria", "error")
    } finally {
      this.showButtonLoading(false)
    }
  }

  async handleDelete(item) {
    if (!confirm(`Tem certeza que deseja excluir a categoria "${item.nome}"?`)) {
      return
    }

    try {
      const response = await window.API_CONFIG.authenticatedRequest(
        `${window.API_CONFIG.ENDPOINTS.CATEGORIAS}/${item.id}`,
        "DELETE"
      )

      if (response.success !== false) {
        this.showToast("Categoria excluída com sucesso!", "success")
        this.loadData()
      } else {
        this.showToast("Erro ao excluir categoria", "error")
      }
    } catch (error) {
      console.error("Erro ao excluir categoria:", error)
      this.showToast("Erro ao excluir categoria", "error")
    }
  }

  showButtonLoading(show) {
    const btnSalvar = document.getElementById("btnSalvar")
    const btnSalvarText = btnSalvar?.querySelector('[data-text]')
    const btnSalvarLoading = btnSalvar?.querySelector('[data-loading]')

    if (btnSalvar && btnSalvarText && btnSalvarLoading) {
      if (show) {
        btnSalvar.disabled = true
        btnSalvarText.classList.add("hidden")
        btnSalvarLoading.classList.remove("hidden")
      } else {
        btnSalvar.disabled = false
        btnSalvarText.classList.remove("hidden")
        btnSalvarLoading.classList.add("hidden")
      }
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
        <i class="${this.getToastIcon(type)}"></i>
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
      success: "fas fa-check-circle",
      error: "fas fa-exclamation-circle",
      warning: "fas fa-exclamation-triangle",
      info: "fas fa-info-circle"
    }
    return icons[type] || icons.info
  }
}

class ModernCategoriasTable {
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
              <p class="text-gray-400 text-sm mt-1">Gerencie suas categorias</p>
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
              <span class="text-gray-300">Carregando categorias...</span>
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
        timeout = setTimeout(() => {
          if (this.config.search.onSearch) {
            this.config.search.onSearch(e.target.value)
          }
        }, 300)
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
          <i class="fas fa-tags text-4xl text-gray-500 mb-4"></i>
          <h3 class="text-lg font-semibold text-white mb-2">Nenhuma categoria encontrada</h3>
          <p class="text-gray-400">Comece criando sua primeira categoria</p>
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
                          <i class="fas fa-tags text-gray-900"></i>
                        </div>
                        <div>
                          <div class="text-white font-medium">${item[col.field]}</div>
                          <div class="text-xs text-gray-400">Categoria • ID: ${item.id}</div>
                        </div>
                      </div>
                    `
                        : col.format
                          ? col.format(item[col.field])
                          : `
                      <span class="text-gray-300">${item[col.field] || "-"}</span>
                    `
                    }
                  </td>
                `,
                  )
                  .join("")}
                <td class="px-6 py-4">
                  <div class="flex items-center justify-center space-x-2">
                    <button 
                      onclick="categoriasPage.openEditModal(${JSON.stringify(item).replace(/"/g, "&quot;")})"
                      class="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 hover:text-blue-300 transition-all"
                      title="Editar categoria"
                    >
                      <i class="fas fa-edit"></i>
                    </button>
                    <button 
                      onclick="categoriasPage.handleDelete(${JSON.stringify(item).replace(/"/g, "&quot;")})"
                      class="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 hover:text-red-300 transition-all"
                      title="Excluir categoria"
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
            <span>${this.config.data.length}</span> categorias encontradas
          </div>
          <div class="text-xs text-gray-500">
            Última atualização: ${new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
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
            <span class="text-gray-300">Carregando categorias...</span>
          </div>
        </div>
      `
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  if (window.initAuthGuard) window.initAuthGuard();
  window.categoriasPage = new CategoriasPage()
  if (window.Utils && typeof window.Utils.setupLogoutButton === 'function') {
    window.Utils.setupLogoutButton();
  }
})
