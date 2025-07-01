class CategoriasPageImproved {
  constructor() {
    this.categorias = []
    this.filteredCategorias = []
    this.editingItem = null
    this.isLoading = false

    this.elements = {
      searchInput: document.getElementById("searchInput"),
      btnAdicionar: document.getElementById("btnAdicionar"),
      modal: document.getElementById("modal"),
      modalTitle: document.getElementById("modalTitle"),
      categoriaForm: document.getElementById("categoriaForm"),
      nomeInput: document.getElementById("nomeInput"),
      btnCancelar: document.getElementById("btnCancelar"),
      btnSalvar: document.getElementById("btnSalvar"),
      btnSalvarText: document.getElementById("btnSalvarText"),
      btnSalvarLoading: document.getElementById("btnSalvarLoading"),
      loadingState: document.getElementById("loadingState"),
      emptyState: document.getElementById("emptyState"),
      emptyMessage: document.getElementById("emptyMessage"),
      tableContainer: document.getElementById("tableContainer"),
      tableBody: document.getElementById("tableBody"),
      tableFooter: document.getElementById("tableFooter"),
      itemCount: document.getElementById("itemCount"),
      lastUpdate: document.getElementById("lastUpdate"),
      logoutBtn: document.getElementById("logoutBtn"),
    }

    this.init()
  }

  init() {
    this.setupEventListeners()
    this.loadCategorias()
    this.updateLastUpdate()
  }

  setupEventListeners() {
    // Search with debounce
    let searchTimeout
    this.elements.searchInput.addEventListener("input", (e) => {
      clearTimeout(searchTimeout)
      searchTimeout = setTimeout(() => this.handleSearch(e.target.value), 300)
    })

    this.elements.btnAdicionar.addEventListener("click", () => this.openAddModal())
    this.elements.btnCancelar.addEventListener("click", () => this.closeModal())
    this.elements.modal.addEventListener("click", (e) => {
      if (e.target === this.elements.modal) this.closeModal()
    })
    this.elements.categoriaForm.addEventListener("submit", (e) => this.handleSubmit(e))
    this.elements.logoutBtn.addEventListener("click", (e) => {
      e.preventDefault()
      this.handleLogout()
    })

    // ESC key
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !this.elements.modal.classList.contains("hidden")) {
        this.closeModal()
      }
    })
  }

  async loadCategorias() {
    try {
      this.setLoading(true)
      const response = await this.apiRequest("/categorias")
      this.categorias = response.data || response.Data || []
      this.filteredCategorias = [...this.categorias]
      this.renderTable()
      this.updateLastUpdate()
      this.showToast("Categorias carregadas com sucesso!", "success")
    } catch (error) {
      console.error("Erro ao carregar categorias:", error)
      this.showToast("Erro ao carregar categorias", "error")
      this.showEmptyState("Erro ao carregar dados")
    } finally {
      this.setLoading(false)
    }
  }

  handleSearch(term) {
    const searchTerm = term.toLowerCase().trim()
    if (!searchTerm) {
      this.filteredCategorias = [...this.categorias]
    } else {
      this.filteredCategorias = this.categorias.filter((categoria) => categoria.nome.toLowerCase().includes(searchTerm))
    }
    this.renderTable()
  }

  renderTable() {
    if (this.filteredCategorias.length === 0) {
      const message = this.elements.searchInput.value.trim()
        ? "Nenhuma categoria encontrada para sua busca."
        : "Nenhuma categoria cadastrada. Que tal criar a primeira?"
      this.showEmptyState(message)
      return
    }

    this.showTable()
    this.elements.tableBody.innerHTML = this.filteredCategorias
      .map(
        (categoria, index) => `
        <tr class="table-row" style="animation-delay: ${index * 0.05}s;">
          <td class="px-6 py-4">
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-xl flex items-center justify-center">
                <i class="fas fa-tag text-gray-900"></i>
              </div>
              <div>
                <div class="text-white font-medium">${categoria.nome}</div>
                <div class="text-xs text-gray-400">Categoria • ID: ${categoria.id}</div>
              </div>
            </div>
          </td>
          <td class="px-6 py-4">
            <div class="flex items-center justify-center space-x-2">
              <button 
                onclick="categoriasPage.openEditModal(${JSON.stringify(categoria).replace(/"/g, "&quot;")})"
                class="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 hover:text-blue-300 transition-all hover-glow"
                title="Editar categoria"
              >
                <i class="fas fa-edit"></i>
              </button>
              <button 
                onclick="categoriasPage.handleDelete(${JSON.stringify(categoria).replace(/"/g, "&quot;")})"
                class="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 hover:text-red-300 transition-all hover-glow"
                title="Excluir categoria"
              >
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </td>
        </tr>
      `,
      )
      .join("")

    this.elements.itemCount.textContent = this.filteredCategorias.length
  }

  setLoading(loading) {
    this.isLoading = loading
    if (loading) {
      this.elements.loadingState.classList.remove("hidden")
      this.elements.emptyState.classList.add("hidden")
      this.elements.tableContainer.classList.add("hidden")
    } else {
      this.elements.loadingState.classList.add("hidden")
    }
  }

  showEmptyState(message) {
    this.elements.emptyMessage.textContent = message
    this.elements.emptyState.classList.remove("hidden")
    this.elements.tableContainer.classList.add("hidden")
  }

  showTable() {
    this.elements.emptyState.classList.add("hidden")
    this.elements.tableContainer.classList.remove("hidden")
  }

  openAddModal() {
    this.editingItem = null
    this.elements.modalTitle.textContent = "Nova Categoria"
    this.elements.nomeInput.value = ""
    this.openModal()
  }

  openEditModal(categoria) {
    this.editingItem = categoria
    this.elements.modalTitle.textContent = "Editar Categoria"
    this.elements.nomeInput.value = categoria.nome
    this.openModal()
  }

  openModal() {
    this.elements.modal.classList.remove("hidden")
    setTimeout(() => this.elements.nomeInput.focus(), 100)
  }

  closeModal() {
    this.elements.modal.classList.add("hidden")
    this.editingItem = null
    this.elements.categoriaForm.reset()
  }

  async handleSubmit(e) {
    e.preventDefault()
    const nome = this.elements.nomeInput.value.trim()

    if (!nome) {
      this.showToast("Nome é obrigatório", "error")
      return
    }

    try {
      this.setButtonLoading(true)

      if (this.editingItem) {
        await this.apiRequest(`/categorias`, "PUT", {
          id: this.editingItem.id,
          nome: nome,
        })

        const index = this.categorias.findIndex((c) => c.id === this.editingItem.id)
        if (index !== -1) {
          this.categorias[index].nome = nome
        }
        this.showToast("Categoria atualizada com sucesso!", "success")
      } else {
        const response = await this.apiRequest("/categorias", "POST", { nome: nome })
        const newCategoria = response.data || response
        if (newCategoria) {
          this.categorias.push(newCategoria)
        } else {
          await this.loadCategorias()
          this.closeModal()
          return
        }
        this.showToast("Categoria criada com sucesso!", "success")
      }

      this.filteredCategorias = [...this.categorias]
      this.renderTable()
      this.updateLastUpdate()
      this.closeModal()
    } catch (error) {
      console.error("Erro ao salvar categoria:", error)
      this.showToast(error.message || "Erro ao salvar categoria", "error")
    } finally {
      this.setButtonLoading(false)
    }
  }

  async handleDelete(categoria) {
    if (
      !confirm(`Tem certeza que deseja excluir a categoria "${categoria.nome}"?\n\nEsta ação não pode ser desfeita.`)
    ) {
      return
    }

    try {
      await this.apiRequest(`/categorias/${categoria.id}`, "DELETE")
      this.categorias = this.categorias.filter((c) => c.id !== categoria.id)
      this.filteredCategorias = this.filteredCategorias.filter((c) => c.id !== categoria.id)
      this.renderTable()
      this.updateLastUpdate()
      this.showToast("Categoria excluída com sucesso!", "success")
    } catch (error) {
      console.error("Erro ao excluir categoria:", error)
      this.showToast(error.message || "Erro ao excluir categoria", "error")
    }
  }

  handleLogout() {
    if (confirm("Tem certeza que deseja sair?")) {
      this.showToast("Logout realizado com sucesso!", "info")
      setTimeout(() => {
        window.location.href = "/pages/auth/login.html"
      }, 1000)
    }
  }

  setButtonLoading(loading) {
    if (loading) {
      this.elements.btnSalvarText.classList.add("hidden")
      this.elements.btnSalvarLoading.classList.remove("hidden")
      this.elements.btnSalvar.disabled = true
    } else {
      this.elements.btnSalvarText.classList.remove("hidden")
      this.elements.btnSalvarLoading.classList.add("hidden")
      this.elements.btnSalvar.disabled = false
    }
  }

  updateLastUpdate() {
    if (this.elements.lastUpdate) {
      this.elements.lastUpdate.textContent = new Date().toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      })
    }
  }

  showToast(message, type = "info") {
    const toast = document.createElement("div")
    toast.className = `toast ${type}`
    toast.innerHTML = `
      <div class="flex items-center space-x-2">
        <i class="fas ${this.getToastIcon(type)}"></i>
        <span>${message}</span>
      </div>
    `

    document.body.appendChild(toast)
    setTimeout(() => toast.classList.add("show"), 100)
    setTimeout(() => {
      toast.classList.remove("show")
      setTimeout(() => toast.remove(), 300)
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

  async apiRequest(endpoint, method = "GET", data = null) {
    const token = localStorage.getItem("token")
    const headers = { "Content-Type": "application/json" }

    if (token) {
      headers.Authorization = `Bearer ${token.replace(/^"|"$/g, "")}`
    }

    const config = { method, headers }
    if (data) config.body = JSON.stringify(data)

    const response = await fetch(`http://localhost:5205${endpoint}`, config)

    if (!response.ok) {
      let errorMessage = `Erro na requisição: ${response.status}`
      try {
        const errorData = await response.json()
        errorMessage = errorData.message || errorData.Message || errorMessage
      } catch (e) {}
      throw new Error(errorMessage)
    }

    return response.json()
  }
}

let categoriasPage
document.addEventListener("DOMContentLoaded", () => {
  categoriasPage = new CategoriasPageImproved()
  window.categoriasPage = categoriasPage
})
