class EquipamentosPage {
  constructor() {
    this.currentPage = 1;
    this.searchTerm = "";
    this.editingItem = null;
    this.table = null;

    const modal = document.getElementById("modalEquipamento");
    if (modal && !modal.classList.contains("hidden")) {
      modal.classList.add("hidden");
    }

    this.init();
  }

  init() {
    this.setupEventListeners();
    this.createTable();
    this.loadData();
  }

  createTable() {
    const tableConfig = {
      containerId: "equipamentosTableContainer",
      title: "Listagem de Equipamentos",

      columns: [
        { field: "nome", label: "Nome" },
        { field: "descricao", label: "Descrição" },
        {
          field: "categoria",
          label: "Categoria",
          format: (v) => v?.nome ?? "-",
        },
        { field: "setor", label: "Setor", format: (v) => v?.nome ?? "-" },
        {
          field: "potenciaKwh",
          label: "Potência kW/h",
          format: (value) => (value ? `${value} kW/h` : "-"),
        },
        {
          field: "ativo",
          label: "Status",
          format: (value, item) =>
            `<span class="px-2 py-1 text-xs rounded-full status-toggle cursor-pointer select-none ${
              value
                ? "bg-green-500/20 text-green-400 hover:bg-green-500/40"
                : "bg-red-500/20 text-red-400 hover:bg-red-500/40"
            }" data-equipamento-id="${
              item.id
            }" title="Clique para registrar uso">
              ${value ? "Ativo" : "Inativo"}
            </span>`,
        },
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
        label: "Novo Equipamento",
        onClick: () => this.openAddModal(),
      },

      search: {
        enabled: true,
        placeholder: "Buscar equipamentos...",
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
    };

    this.table = new ModernEquipamentosTable(tableConfig);
  }

  setupEventListeners() {
    this.setupModalListeners();
  }

  setupModalListeners() {
    const modal = document.getElementById("modalEquipamento");
    const btnCancelar = document.getElementById("btnCancelar");
    const form = document.getElementById("formEquipamento");

    if (btnCancelar) {
      btnCancelar.addEventListener("click", () => this.closeModal());
    }

    if (modal) {
      modal.addEventListener("click", (e) => {
        if (e.target === e.currentTarget) this.closeModal();
      });
    }

    if (form) {
      form.addEventListener("submit", (e) => this.handleSubmit(e));
    }
  }

  async loadData() {
    try {
      this.table.setLoading(true);
      let url = `${window.API_CONFIG.ENDPOINTS.EQUIPAMENTOS}/paged?page=${this.currentPage}&pageSize=10`;
      if (this.searchTerm)
        url += `&search=${encodeURIComponent(this.searchTerm)}`;

      const response = await window.API_CONFIG.authenticatedRequest(url);
      const data = (response.Data || response.data || []).map((item) => ({
        ...item,
        categoriaId: item.categoriaId ?? item.categoria?.id ?? null,
        setorId: item.setorId ?? item.setor?.id ?? null,
      }));

      this.table.updateData(data);
      this.table.updatePagination({
        currentPage: response.Page || this.currentPage,
        totalPages: response.TotalPages || response.totalPages || 1,
        totalItems: response.TotalItems || response.totalItems || data.length,
      });
    } catch (error) {
      this.showToast("Erro ao carregar equipamentos", "error");
    } finally {
      this.table.setLoading(false);
    }
  }

  handlePageChange(page) {
    this.currentPage = page;
    this.loadData();
  }

  handleSearch(term) {
    this.searchTerm = term;
    this.currentPage = 1;
    this.loadData();
  }

  async fetchAndPopulateCategorias() {
    const select = document.getElementById("categoriaId");
    if (!select) return;
    select.innerHTML = '<option value="">Selecione uma categoria</option>';
    try {
      const response = await window.API_CONFIG.authenticatedRequest(
        window.API_CONFIG.ENDPOINTS.CATEGORIAS
      );
      const categorias = response.Data || response.data || [];
      categorias.forEach((cat) => {
        const option = document.createElement("option");
        option.value = cat.id;
        option.textContent = cat.nome;
        select.appendChild(option);
      });
    } catch (e) {
      this.showToast("Erro ao carregar categorias", "error");
    }
  }

  async fetchAndPopulateSetores() {
    const select = document.getElementById("setorId");
    if (!select) return;
    select.innerHTML = '<option value="">Selecione um setor</option>';
    try {
      const response = await window.API_CONFIG.authenticatedRequest(
        window.API_CONFIG.ENDPOINTS.SETORES
      );
      const setores = response.Data || response.data || [];
      setores.forEach((setor) => {
        const option = document.createElement("option");
        option.value = setor.id;
        option.textContent = setor.nome;
        select.appendChild(option);
      });
    } catch (e) {
      this.showToast("Erro ao carregar setores", "error");
    }
  }

  async openAddModal() {
    this.editingItem = null;
    this.updateModalTitle("Novo Equipamento");
    this.clearForm();
    await this.fetchAndPopulateCategorias();
    await this.fetchAndPopulateSetores();
    this.openModal();
  }

  async openEditModal(item) {
    this.editingItem = item;
    this.updateModalTitle("Editar Equipamento");
    await this.fetchAndPopulateCategorias();
    await this.fetchAndPopulateSetores();
    this.fillForm(item);
    this.openModal();
  }

  openModal() {
    const modal = document.getElementById("modalEquipamento");
    modal?.classList.remove("hidden");
  }

  closeModal() {
    const modal = document.getElementById("modalEquipamento");
    modal?.classList.add("hidden");
    this.editingItem = null;
    this.clearForm();
  }

  updateModalTitle(title) {
    const modalTitle = document.getElementById("modalTitle");
    if (modalTitle) {
      modalTitle.textContent = title;
    }
  }

  fillForm(item) {
    const form = document.getElementById("formEquipamento");
    if (form && item) {
      form.nome.value = item.nome || "";
      form.categoriaId.value = item.categoriaId || "";
      form.setorId.value = item.setorId || "";
      form.potenciaKwh.value = item.potenciaKwh || "";
      form.deviceIdIntegration.value = item.deviceIdIntegration || "";
      form.descricao.value = item.descricao || "";
    }
  }

  clearForm() {
    const form = document.getElementById("formEquipamento");
    if (form) {
      form.reset();
    }
  }

  async handleSubmit(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const data = {
      nome: formData.get("nome"),
      categoriaId: Number.parseInt(formData.get("categoriaId")),
      setorId: Number.parseInt(formData.get("setorId")),
      potenciaKwh: Number.parseFloat(formData.get("potenciaKwh")) || 0,
      deviceIdIntegration: formData.get("deviceIdIntegration"),
      descricao: formData.get("descricao"),
      ativo: true,
    };

    if (!data.nome || !data.categoriaId || !data.setorId) {
      this.showToast("Preencha todos os campos obrigatórios", "error");
      return;
    }

    try {
      this.showButtonLoading(true);

      if (this.editingItem) {
        await window.API_CONFIG.authenticatedRequest(
          window.API_CONFIG.ENDPOINTS.EQUIPAMENTOS,
          {
            method: "PUT",
            body: JSON.stringify({ ...data, id: this.editingItem.id }),
          }
        );
        this.showToast("Equipamento atualizado com sucesso!", "success");
      } else {
        await window.API_CONFIG.authenticatedRequest(
          window.API_CONFIG.ENDPOINTS.EQUIPAMENTOS,
          {
            method: "POST",
            body: JSON.stringify(data),
          }
        );
        this.showToast("Equipamento criado com sucesso!", "success");
      }

      this.closeModal();
      this.loadData();
    } catch (error) {
      this.showToast("Erro ao salvar equipamento", "error");
    } finally {
      this.showButtonLoading(false);
    }
  }

  async handleDelete(item) {
    if (window.Utils && typeof window.Utils.showModal === "function") {
      window.Utils.showModal({
        title: "Confirmar Exclusão",
        message: `Deseja excluir o equipamento "${item.nome}"?\n\nEsta ação não pode ser desfeita.`,
        confirmText: "Excluir",
        cancelText: "Cancelar",
        onConfirm: async () => {
          try {
            await window.API_CONFIG.authenticatedRequest(
              `${window.API_CONFIG.ENDPOINTS.EQUIPAMENTOS}/${item.id}`,
              {
                method: "DELETE",
              }
            );

            this.showToast("Equipamento excluído com sucesso!", "success");
            this.loadData();
          } catch (error) {
            this.showToast("Erro ao excluir equipamento", "error");
          }
        },
        onCancel: () => {},
      });
    } else {
      if (
        !confirm(
          `Deseja excluir o equipamento "${item.nome}"?\n\nEsta ação não pode ser desfeita.`
        )
      ) {
        return;
      }

      try {
        await window.API_CONFIG.authenticatedRequest(
          `${window.API_CONFIG.ENDPOINTS.EQUIPAMENTOS}/${item.id}`,
          {
            method: "DELETE",
          }
        );

        this.showToast("Equipamento excluído com sucesso!", "success");
        this.loadData();
      } catch (error) {
        this.showToast("Erro ao excluir equipamento", "error");
      }
    }
  }

  showButtonLoading(show) {
    const btn = document.getElementById("btnSalvar");
    const textSpan = btn?.querySelector("[data-text]");
    const loadingSpan = btn?.querySelector("[data-loading]");

    if (show) {
      textSpan?.classList.add("hidden");
      loadingSpan?.classList.remove("hidden");
      btn?.setAttribute("disabled", "true");
    } else {
      textSpan?.classList.remove("hidden");
      loadingSpan?.classList.add("hidden");
      btn?.removeAttribute("disabled");
    }
  }

  showToast(message, type = "info") {
    if (window.Utils && window.Utils.showToast) {
      window.Utils.showToast(message, type);
      return;
    }

    const toastCounter = window.toastCounter || 0;
    window.toastCounter = toastCounter + 1;

    const toast = document.createElement("div");
    const topPosition = 24 + toastCounter * 80;
    toast.className = `fixed right-4 z-50 p-4 rounded-xl shadow-2xl transition-all duration-300 transform translate-x-full backdrop-blur-lg`;
    toast.style.top = `${topPosition}px`;

    const colors = {
      success: "bg-green-500/90 text-white",
      error: "bg-red-500/90 text-white",
      warning: "bg-yellow-500/90 text-black",
      info: "bg-blue-500/90 text-white",
    };

    toast.className += ` ${colors[type] || colors.info}`;
    toast.innerHTML = `
      <div class="flex items-center space-x-2">
        <i class="fas ${this.getToastIcon(type)}"></i>
        <span>${message}</span>
      </div>
    `;

    document.body.appendChild(toast);
    setTimeout(() => toast.classList.remove("translate-x-full"), 100);
    setTimeout(() => {
      toast.classList.add("translate-x-full");
      setTimeout(() => {
        toast.remove();
        window.toastCounter = Math.max(0, (window.toastCounter || 1) - 1);
      }, 300);
    }, 3000);
  }

  getToastIcon(type) {
    const icons = {
      success: "fa-check-circle",
      error: "fa-exclamation-circle",
      warning: "fa-exclamation-triangle",
      info: "fa-info-circle",
    };
    return icons[type] || icons.info;
  }

  async registrarEquipamento(equipamentoId) {
    try {
      await window.API_CONFIG.authenticatedRequest(
        `/registros/registrar/${equipamentoId}`,
        {
          method: "POST",
        }
      );
      setTimeout(() => {
        this.showToast("Registro de uso realizado com sucesso!", "success");
        this.loadData();
      }, 1000);
    } catch (error) {
      this.showToast(
        error.message || "Erro ao registrar uso do equipamento",
        "error"
      );
    }
  }
}

class ModernEquipamentosTable {
  constructor(config) {
    this.config = config;
    this.render();
  }

  render() {
    const container = document.getElementById(this.config.containerId);
    if (!container) return;

    container.innerHTML = `
      <div class="glass rounded-2xl overflow-hidden">
        <div class="p-6 border-b border-white/10">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-xl font-semibold text-white">${this.config.title}</h2>
              <p class="text-gray-400 text-sm mt-1">Gerencie seus equipamentos</p>
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
              <span class="text-gray-300">Carregando equipamentos...</span>
            </div>
          </div>
        </div>
      </div>
    `;

    this.setupEventListeners();
  }

  setupEventListeners() {
    const searchInput = document.getElementById("tableSearch");
    const addBtn = document.getElementById("tableAddBtn");

    if (searchInput) {
      let timeout;
      searchInput.addEventListener("input", (e) => {
        clearTimeout(timeout);
        timeout = setTimeout(
          () => this.config.search.onSearch(e.target.value),
          300
        );
      });
    }

    if (addBtn && this.config.addButton.onClick) {
      addBtn.addEventListener("click", this.config.addButton.onClick);
    }
  }

  updateData(data) {
    this.config.data = data;
    this.renderTable();
  }

  renderTable() {
    const content = document.getElementById("tableContent");
    if (!content) return;

    if (this.config.data.length === 0) {
      content.innerHTML = `
        <div class="p-12 text-center">
          <i class="fas fa-cogs text-4xl text-gray-500 mb-4"></i>
          <h3 class="text-lg font-semibold text-white mb-2">Nenhum equipamento encontrado</h3>
          <p class="text-gray-400">Comece criando seu primeiro equipamento</p>
        </div>
      `;
      return;
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
              `
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
              <tr class="hover:bg-white/5 transition-all duration-200" style="animation-delay: ${
                index * 0.05
              }s;">
                ${this.config.columns
                  .map(
                    (col) => `
                  <td class="px-6 py-4">
                    ${
                      col.field === "nome"
                        ? `
                      <div class="flex items-center space-x-3">
                        <div class="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                          <i class="fas fa-cogs text-white"></i>
                        </div>
                        <div>
                          <div class="text-white font-medium">${
                            item[col.field]
                          }</div>
                          <div class="text-xs text-gray-400">Equipamento • ID: ${
                            item.id
                          }</div>
                        </div>
                      </div>
                    `
                        : col.format
                        ? col.format(item[col.field], item)
                        : `
                      <span class="text-gray-300">${
                        item[col.field] || "-"
                      }</span>
                    `
                    }
                  </td>
                `
                  )
                  .join("")}
                <td class="px-6 py-4">
                  <div class="flex items-center justify-center space-x-2">
                    <button 
                      onclick="equipamentosPage.openEditModal(${JSON.stringify(
                        item
                      ).replace(/"/g, "&quot;")})"
                      class="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 hover:text-blue-300 transition-all"
                      title="Editar equipamento"
                    >
                      <i class="fas fa-edit"></i>
                    </button>
                    <button 
                      onclick="equipamentosPage.handleDelete(${JSON.stringify(
                        item
                      ).replace(/"/g, "&quot;")})"
                      class="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 hover:text-red-300 transition-all"
                      title="Excluir equipamento"
                    >
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
      </div>
      
      <div class="px-6 py-4 border-t border-white/10 bg-white/5">
        <div class="flex items-center justify-between">
          <div class="text-sm text-gray-400">
            <span>${this.config.data.length}</span> equipamentos encontrados
          </div>
          <div class="text-xs text-gray-500">
            Última atualização: ${new Date().toLocaleTimeString("pt-BR", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        </div>
      </div>
    `;

    setTimeout(() => {
      const statusEls = content.querySelectorAll(".status-toggle");
      statusEls.forEach((el) => {
        el.addEventListener("click", (e) => {
          const equipamentoId = el.getAttribute("data-equipamento-id");
          if (
            equipamentoId &&
            window.equipamentosPage &&
            typeof window.equipamentosPage.registrarEquipamento === "function"
          ) {
            window.equipamentosPage.registrarEquipamento(equipamentoId);
          }
        });
      });
    }, 0);
  }

  setLoading(loading) {
    const content = document.getElementById("tableContent");
    if (!content) return;

    if (loading) {
      content.innerHTML = `
        <div class="p-12 text-center">
          <div class="inline-flex items-center space-x-3">
            <div class="w-6 h-6 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
            <span class="text-gray-300">Carregando equipamentos...</span>
          </div>
        </div>
      `;
    }
  }

  updatePagination(data) {}
}

let equipamentosPage;
window.addEventListener("DOMContentLoaded", async () => {
  const modal = document.getElementById("modalEquipamento");
  if (modal && !modal.classList.contains("hidden")) {
    modal.classList.add("hidden");
  }

  const checkDependencies = () => {
    if (window.Utils && window.API_CONFIG) {
      window.initAuthGuard();
      equipamentosPage = new EquipamentosPage();
      window.equipamentosPage = equipamentosPage;
      if (
        window.Utils &&
        typeof window.Utils.setupLogoutButton === "function"
      ) {
        window.Utils.setupLogoutButton();
      }
    } else {
      setTimeout(checkDependencies, 100);
    }
  };
  checkDependencies();
});
