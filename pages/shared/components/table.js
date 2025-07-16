class GenericTable {
  constructor(config) {
    this.config = {
      containerId: config.containerId || "tableContainer",
      columns: config.columns || [],
      
      data: config.data || [],
      loading: config.loading || false,
      
      pagination: {
        enabled: config.pagination?.enabled !== false,
        currentPage: config.pagination?.currentPage || 1,
        totalPages: config.pagination?.totalPages || 1,
        totalItems: config.pagination?.totalItems || 0,
        pageSize: config.pagination?.pageSize || 10,
        onPageChange: config.pagination?.onPageChange || null
      },
      
      search: {
        enabled: config.search?.enabled !== false,
        placeholder: config.search?.placeholder || "Pesquisar...",
        onSearch: config.search?.onSearch || null
      },
      
      actions: {
        enabled: config.actions?.enabled !== false,
        edit: {
          enabled: config.actions?.edit?.enabled !== false,
          label: config.actions?.edit?.label || "Editar",
          icon: config.actions?.edit?.icon || "fas fa-edit",
          onClick: config.actions?.edit?.onClick || null
        },
        delete: {
          enabled: config.actions?.delete?.enabled !== false,
          label: config.actions?.delete?.label || "Excluir",
          icon: config.actions?.delete?.icon || "fas fa-trash",
          onClick: config.actions?.delete?.onClick || null
        },
        custom: config.actions?.custom || []
      },
      
      styling: {
        striped: config.styling?.striped !== false,
        hover: config.styling?.hover !== false,
        bordered: config.styling?.bordered !== false,
        compact: config.styling?.compact || false,
        responsive: config.styling?.responsive !== false
      },
      
      onRowClick: config.onRowClick || null,
      onEmpty: config.onEmpty || null,
      onLoading: config.onLoading || null,
      
      addButton: {
        enabled: config.addButton?.enabled !== false,
        label: config.addButton?.label || 'Adicionar',
        onClick: config.addButton?.onClick || null
      }
    }

    this.init()
  }

  init() {
    this.render()
    this.setupEventListeners()
  }

  render() {
    const container = document.getElementById(this.config.containerId)
    if (!container) {
      console.error(`Container com ID "${this.config.containerId}" não encontrado`)
      return
    }

    container.innerHTML = this.generateHTML()
    if (this.config.addButton && this.config.addButton.enabled && typeof this.config.addButton.onClick === 'function') {
      const addBtn = document.getElementById('tableAddButton')
      if (addBtn) {
        addBtn.addEventListener('click', this.config.addButton.onClick)
      }
    }
  }

  generateHTML() {
    return `
      <div class="relative flex flex-col min-w-0 break-words bg-white shadow-xl dark:bg-slate-850 dark:shadow-dark-xl rounded-2xl bg-clip-border">
        
        <!-- Header da Tabela -->
        ${this.generateHeader()}
        
        <!-- Conteúdo da Tabela -->
        <div class="flex-auto px-0 pt-0 pb-2">
          <div class="p-0 overflow-x-auto">
            ${this.generateTableContent()}
          </div>
          
          <!-- Footer com Paginação -->
          ${this.generatePagination()}
        </div>
      </div>
    `
  }

  generateHeader() {
    if (!this.config.search.enabled) return ""

    let addButtonHTML = ""
    if (this.config.addButton && this.config.addButton.enabled) {
      addButtonHTML = `
        <button type="button" id="tableAddButton" class="ml-4 inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200">
          <i class="fas fa-plus mr-2"></i>
          ${this.config.addButton.label || 'Adicionar'}
        </button>
      `
    }

    return `
      <div class="border-black/12.5 mb-0 rounded-t-2xl border-b-0 border-solid p-6 pt-4 pb-4">
        <div class="flex items-center justify-between">
          <h6 class="capitalize dark:text-white text-xl font-semibold">
            ${this.config.title || "Listagem"}
          </h6>
          
          <div class="flex items-center space-x-4">
            <!-- Pesquisar -->
            <div class="relative">
              <span class="text-sm ease leading-5.6 absolute z-50 -ml-px flex h-full items-center whitespace-nowrap rounded-lg rounded-tr-none rounded-br-none border border-r-0 border-transparent bg-transparent py-2 px-2.5 text-center font-normal text-slate-500 transition-all">
                <i class="fas fa-search"></i>
              </span>
              <input 
                type="text" 
                id="tableSearchInput"
                class="pl-9 text-sm focus:shadow-primary-outline ease w-64 leading-5.6 relative -ml-px block min-w-0 flex-auto rounded-lg border border-solid border-gray-300 dark:bg-slate-850 dark:text-white bg-white bg-clip-padding py-2 pr-3 text-gray-700 transition-all placeholder:text-gray-500 focus:border-blue-500 focus:outline-none focus:transition-shadow" 
                placeholder="${this.config.search.placeholder}" 
              />
            </div>
            ${addButtonHTML}
          </div>
        </div>
      </div>
    `
  }

  generateTableContent() {
    if (this.config.loading) {
      return this.generateLoading()
    }

    if (this.config.data.length === 0) {
      return this.generateEmptyState()
    }

    return `
      <div class="overflow-x-auto">
        <table class="w-full min-w-full">
          <!-- Header da Tabela -->
          <thead>
            <tr class="bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-gray-600">
              ${this.config.columns.map(column => `
                <th class="px-6 py-3 text-left text-xs font-bold text-gray-600 dark:text-white uppercase tracking-wider whitespace-nowrap">
                  ${column.label}
                </th>
              `).join('')}
              ${this.config.actions.enabled ? `
                <th class="px-6 py-3 text-left text-xs font-bold text-gray-600 dark:text-white uppercase tracking-wider whitespace-nowrap">
                  Ações
                </th>
              ` : ''}
            </tr>
          </thead>

          <!-- Corpo da Tabela -->
          <tbody class="divide-y divide-gray-200 dark:divide-gray-600">
            ${this.config.data.map((item, index) => this.generateTableRow(item, index)).join('')}
          </tbody>
        </table>
      </div>
    `
  }

  generateTableRow(item, index) {
    const rowClasses = [
      this.config.styling.hover ? "hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors duration-150 cursor-pointer" : "",
      this.config.styling.striped && index % 2 === 1 ? "bg-gray-50 dark:bg-slate-800" : ""
    ].filter(Boolean).join(" ")

    return `
      <tr class="${rowClasses}" ${this.config.onRowClick ? `onclick="window.currentTable.handleRowClick(${JSON.stringify(item).replace(/"/g, '&quot;')})"` : ""}>
        ${this.config.columns.map(column => `
          <td class="px-6 py-4 text-sm text-gray-900 dark:text-white align-middle">
            ${this.formatCellValue(item, column)}
          </td>
        `).join('')}
        
        ${this.config.actions.enabled ? `
          <td class="px-6 py-4 text-sm text-gray-900 dark:text-white align-middle">
            ${this.generateActionButtons(item)}
          </td>
        ` : ''}
      </tr>
    `
  }

  generateActionButtons(item) {
    const buttons = []

    if (this.config.actions.edit.enabled) {
      buttons.push(`
        <button 
          onclick="window.currentTable.handleEditClick(${JSON.stringify(item).replace(/"/g, '&quot;')})" 
          class="text-blue-600 hover:text-blue-800 text-xs mr-2"
        >
          <i class="${this.config.actions.edit.icon} mr-1"></i>${this.config.actions.edit.label}
        </button>
      `)
    }

    if (this.config.actions.delete.enabled) {
      buttons.push(`
        <button 
          onclick="window.currentTable.handleDeleteClick(${JSON.stringify(item).replace(/"/g, '&quot;')})" 
          class="text-red-600 hover:text-red-800 text-xs mr-2"
        >
          <i class="${this.config.actions.delete.icon} mr-1"></i>${this.config.actions.delete.label}
        </button>
      `)
    }

    this.config.actions.custom.forEach(action => {
      buttons.push(`
        <button 
          onclick="window.currentTable.handleCustomAction('${action.id}', ${JSON.stringify(item).replace(/"/g, '&quot;')})" 
          class="${action.class || 'text-gray-600 hover:text-gray-800'} text-xs mr-2"
        >
          <i class="${action.icon} mr-1"></i>${action.label}
        </button>
      `)
    })

    return `
      <div class="flex gap-2">
        ${buttons.join('')}
      </div>
    `
  }

  generateLoading() {
    return `
      <div class="text-center p-8">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <p class="mt-2 text-gray-600 dark:text-white">Carregando...</p>
      </div>
    `
  }

  generateEmptyState() {
    if (this.config.onEmpty) {
      return this.config.onEmpty()
    }

    return `
      <div class="text-center p-8">
        <i class="fas fa-inbox text-4xl text-gray-400 mb-4"></i>
        <p class="text-gray-600 dark:text-white">Nenhum item encontrado.</p>
      </div>
    `
  }

  generatePagination() {
    if (!this.config.pagination.enabled) return ""

    const { currentPage, totalPages, totalItems, pageSize } = this.config.pagination

    return `
      <div class="px-6 py-4 border-t border-gray-200 dark:border-gray-600">
        <div class="flex items-center justify-between">
          <div class="text-sm text-gray-600 dark:text-white">
            Mostrando ${Math.min(this.config.data.length, pageSize)} de ${totalItems} itens
          </div>
          <div class="flex items-center gap-2">
            <button 
              onclick="window.currentTable.handlePageChange(${currentPage - 1})" 
              ${currentPage <= 1 ? "disabled" : ""}
              class="px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            
            <span class="text-sm text-gray-600 dark:text-white">
              Página ${currentPage} de ${totalPages}
            </span>
            
            <button 
              onclick="window.currentTable.handlePageChange(${currentPage + 1})" 
              ${currentPage >= totalPages ? "disabled" : ""}
              class="px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Próxima
            </button>
          </div>
        </div>
      </div>
    `
  }

  setupEventListeners() {
    if (this.config.search.enabled) {
      const searchInput = document.getElementById("tableSearchInput")
      if (searchInput) {
        searchInput.addEventListener(
          "input",
          this.debounce((e) => this.handleSearch(e), 300)
        )
      }
    }
  }

  handleSearch(e) {
    const term = e.target.value.toLowerCase().trim()
    if (this.config.search.onSearch) {
      this.config.search.onSearch(term)
    }
  }

  handlePageChange(page) {
    if (page < 1 || page > this.config.pagination.totalPages) return
    if (this.config.pagination.onPageChange) {
      this.config.pagination.onPageChange(page)
    }
  }

  handleRowClick(item) {
    if (this.config.onRowClick) {
      this.config.onRowClick(item)
    }
  }

  handleEditClick(item) {
    if (this.config.actions.edit.onClick) {
      this.config.actions.edit.onClick(item)
    }
  }

  handleDeleteClick(item) {
    if (this.config.actions.delete.onClick) {
      this.config.actions.delete.onClick(item)
    }
  }

  handleCustomAction(actionId, item) {
    const action = this.config.actions.custom.find(a => a.id === actionId)
    if (action && action.onClick) {
      action.onClick(item)
    }
  }

  updateData(newData) {
    this.config.data = newData
    this.render()
  }

  updatePagination(paginationData) {
    this.config.pagination = { ...this.config.pagination, ...paginationData }
    this.render()
  }

  setLoading(loading) {
    this.config.loading = loading
    this.render()
  }

  refresh() {
    this.render()
  }

  getColumnCount() {
    const columnCount = this.config.columns.length + (this.config.actions.enabled ? 1 : 0)
    return Math.max(1, Math.min(12, columnCount))
  }

  formatCellValue(item, column) {
    const value = this.getNestedValue(item, column.field)
    
    if (column.format) {
      return column.format(value, item)
    }
    
    if (column.type === 'date') {
      return this.formatDate(value)
    }
    
    if (column.type === 'boolean') {
      return value ? 'Sim' : 'Não'
    }
    
    if (column.type === 'currency') {
      return this.formatCurrency(value)
    }
    
    return value || '-'
  }

  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => current && current[key], obj)
  }

  formatDate(date) {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('pt-BR')
  }

  formatCurrency(value) {
    if (!value) return '-'
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  debounce(func, wait) {
    let timeout
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout)
        func(...args)
      }
      clearTimeout(timeout)
      timeout = setTimeout(later, wait)
    }
  }
}

window.GenericTable = GenericTable 