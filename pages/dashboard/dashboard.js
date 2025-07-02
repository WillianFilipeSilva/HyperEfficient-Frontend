// Configuração dos endpoints de relatórios
if (!window.API_CONFIG.ENDPOINTS.RELATORIOS) {
  window.API_CONFIG.ENDPOINTS.RELATORIOS = "/relatorios"
}



  window.addEventListener("DOMContentLoaded", () => {
    if (!window.AuthUtils) {
      console.error("AuthUtils não está disponível!")
      return
    }
    
    const initAuthGuard = window.AuthUtils.initAuthGuard
    if (initAuthGuard) {
      initAuthGuard()
    }

  // Aguardar o carregamento de todas as dependências
      Promise.all([
      new Promise((resolve) => {
        const checkChart = () => {
          if (window.Chart) {
            resolve()
          } else {
            setTimeout(checkChart, 50)
          }
        }
        checkChart()
      }),
      new Promise((resolve) => {
        const checkUtils = () => {
          if (window.API_CONFIG && window.AuthUtils) {
            resolve()
          } else {
            setTimeout(checkUtils, 50)
          }
        }
        checkUtils()
      }),
    ]).then(() => {
      inicializarDashboard()
      setupLogout()
      setupPageUnload()
    }).catch((error) => {
      console.error("Erro ao carregar dependências:", error)
    })

  function inicializarDashboard() {
    // Carregar filtro do sessionStorage ou definir período padrão (mês atual completo)
    const filtroPeriodo = sessionStorage.getItem("filtroPeriodo")
    
    let dataInicio, dataFim
    
    if (filtroPeriodo) {
      const filtro = JSON.parse(filtroPeriodo)
      dataInicio = filtro.dataInicio
      dataFim = filtro.dataFim
    } else {
      const hoje = new Date()
      const primeiroDiaMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1)
      const ultimoDiaMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0)
      
      dataInicio = primeiroDiaMes.toISOString().split("T")[0]
      dataFim = ultimoDiaMes.toISOString().split("T")[0]
      
      // Salvar período padrão no sessionStorage
      salvarFiltroPeriodo(dataInicio, dataFim)
    }

    // Definir valores nos campos de data
    document.getElementById("dataInicio").value = dataInicio
    document.getElementById("dataFim").value = dataFim

    // Event listeners
    document.getElementById("btnAtualizarRelatorio").addEventListener("click", atualizarRelatorios)
    
    // Adicionar listeners para mudança de data
    document.getElementById("dataInicio").addEventListener("change", onPeriodoChange)
    document.getElementById("dataFim").addEventListener("change", onPeriodoChange)

    // Carregar dados automaticamente do período atual ao inicializar
    console.log("Carregando dados do período atual...")
    const inicioFormatado = new Date(dataInicio).toLocaleDateString("pt-BR")
    const fimFormatado = new Date(dataFim).toLocaleDateString("pt-BR")
    showToast(
      `Carregando dados de ${inicioFormatado} a ${fimFormatado}`,
      "info",
    )

    // Carregar dados imediatamente
    atualizarRelatorios()
  }

  // Função para salvar filtro no sessionStorage
  function salvarFiltroPeriodo(dataInicio, dataFim) {
    const filtro = {
      dataInicio: dataInicio,
      dataFim: dataFim
    }
    sessionStorage.setItem("filtroPeriodo", JSON.stringify(filtro))
  }

  // Função para limpar filtro do sessionStorage
  function limparFiltroPeriodo() {
    sessionStorage.removeItem("filtroPeriodo")
  }

  // Função chamada quando o período é alterado
  function onPeriodoChange() {
    const dataInicio = document.getElementById("dataInicio").value
    const dataFim = document.getElementById("dataFim").value
    
    if (dataInicio && dataFim) {
      salvarFiltroPeriodo(dataInicio, dataFim)
    }
  }

  // Setup para limpar sessionStorage quando sair da página
  function setupPageUnload() {
    window.addEventListener("beforeunload", () => {
      limparFiltroPeriodo()
    })
    
    // Também limpar quando navegar para outras páginas
    window.addEventListener("pagehide", () => {
      limparFiltroPeriodo()
    })
  }

  // Setup logout button
  function setupLogout() {
    const logoutBtn = document.getElementById("logoutBtn")
    if (logoutBtn) {
      logoutBtn.addEventListener("click", (e) => {
        e.preventDefault()
        if (confirm("Tem certeza que deseja sair?")) {
          limparFiltroPeriodo()
          showToast("Logout realizado com sucesso!", "info")
          setTimeout(() => {
            window.location.href = "/pages/auth/login.html"
          }, 1000)
        }
      })
    }
  }

  async function atualizarRelatorios() {
    const dataInicio = document.getElementById("dataInicio").value
    const dataFim = document.getElementById("dataFim").value

    if (!dataInicio || !dataFim) {
      showToast("Por favor, selecione o período completo", "warning")
      return
    }

    if (new Date(dataInicio) > new Date(dataFim)) {
      showToast("Data inicial deve ser anterior à data final", "error")
      return
    }

    // Atualizar filtro no sessionStorage
    salvarFiltroPeriodo(dataInicio, dataFim)

    // Mostrar feedback do período selecionado
    const inicioFormatado = new Date(dataInicio).toLocaleDateString("pt-BR")
    const fimFormatado = new Date(dataFim).toLocaleDateString("pt-BR")
    showToast(`Atualizando dados: ${inicioFormatado} a ${fimFormatado}`, "info")

    try {
      await Promise.all([
        carregarRelatorioEmpresa(dataInicio, dataFim),
        carregarEstatisticasSetores(dataInicio, dataFim),
        carregarEstatisticasCategorias(dataInicio, dataFim),
      ])

      showToast("Relatórios atualizados com sucesso!", "success")
    } catch (error) {
      console.error("Erro ao atualizar relatórios:", error)
      showToast("Erro ao atualizar alguns dados", "error")
    }
  }

  async function carregarRelatorioEmpresa(dataInicio, dataFim) {
    try {
      const inicioISO = new Date(dataInicio + "T00:00:00").toISOString()
      const fimISO = new Date(dataFim + "T23:59:59").toISOString()

      const url = `/relatorios/empresa?dataInicio=${encodeURIComponent(inicioISO)}&dataFim=${encodeURIComponent(fimISO)}`
      const data = await window.API_CONFIG.authenticatedRequest(url)

      // Animar os números
      animateNumber("cardSetores", data.quantidadeSetores || 0)
      animateNumber("cardEquipamentos", data.quantidadeEquipamentos || 0)
      animateValue("cardTempoUso", data.tempoUsoTotal || 0, "h")
      animateValue("cardGastoEnergetico", data.gastoEnergeticoTotal || 0, "kWh")

      // Atualizar gráfico com dados reais
      atualizarGraficoComDadosReais(data, dataInicio, dataFim)

      showToast("Dados gerais carregados com sucesso!", "success")
    } catch (error) {
      console.error("Erro ao carregar relatório da empresa:", error)
      document.getElementById("cardSetores").textContent = "0"
      document.getElementById("cardEquipamentos").textContent = "0"
      document.getElementById("cardTempoUso").textContent = "0h"
      document.getElementById("cardGastoEnergetico").textContent = "0 kWh"
      showToast("Erro ao carregar dados gerais", "error")
    }
  }

  async function carregarEstatisticasSetores(dataInicio, dataFim) {
    const setoresLoading = document.getElementById("setoresLoading")
    const setoresList = document.getElementById("setoresList")

    try {
      setoresLoading.classList.remove("hidden")
      setoresList.classList.add("hidden")

      // Buscar todos os setores
      const setoresResponse = await window.API_CONFIG.authenticatedRequest("/setores")
      const setores = setoresResponse.Data || setoresResponse.data || setoresResponse || []

      if (!setores || setores.length === 0) {
        setoresList.innerHTML = `
        <div class="p-8 text-center">
          <div class="text-gray-400">
            <i class="fas fa-building text-2xl mb-2"></i>
            <p>Nenhum setor encontrado</p>
          </div>
        </div>
      `
        setoresLoading.classList.add("hidden")
        setoresList.classList.remove("hidden")
        return
      }

      const inicioISO = new Date(dataInicio + "T00:00:00").toISOString()
      const fimISO = new Date(dataFim + "T23:59:59").toISOString()

      const setoresComGasto = []

      // Buscar relatório de cada setor
      for (const setor of setores) {
        try {
          const url = `/relatorios/setor/${setor.id}?dataInicio=${encodeURIComponent(inicioISO)}&dataFim=${encodeURIComponent(fimISO)}`
          const relatorio = await window.API_CONFIG.authenticatedRequest(url)

          setoresComGasto.push({
            id: setor.id,
            nome: setor.nome,
            gastoTotal: relatorio.gastoEnergeticoTotal || 0,
            quantidadeEquipamentos: relatorio.quantidadeEquipamentos || 0,
            tempoUsoTotal: relatorio.tempoUsoTotal || 0,
          })
        } catch (err) {
          console.error(`Erro ao carregar dados do setor ${setor.nome}:`, err)
          // Incluir setor mesmo com erro, mas com valores zerados
          setoresComGasto.push({
            id: setor.id,
            nome: setor.nome,
            gastoTotal: 0,
            quantidadeEquipamentos: 0,
            tempoUsoTotal: 0,
            erro: true,
          })
        }
      }

      // Ordenar por gasto total (decrescente)
      setoresComGasto.sort((a, b) => b.gastoTotal - a.gastoTotal)

      // Renderizar lista
      setoresList.innerHTML = setoresComGasto
        .map(
          (setor, index) => `
        <div class="p-4 border-b border-white/5 hover:bg-white/5 transition-all duration-200 animate-fade-in-up" style="animation-delay: ${index * 0.1}s;">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                <i class="fas fa-building text-white text-sm"></i>
              </div>
              <div>
                <div class="text-white font-medium">${setor.nome}</div>
                <div class="text-xs text-gray-400">
                  ${setor.quantidadeEquipamentos} equipamentos • ${setor.tempoUsoTotal.toFixed(1)}h uso
                </div>
              </div>
            </div>
            <div class="text-right">
              <div class="text-white font-semibold">${setor.gastoTotal.toFixed(2)} kWh</div>
              ${setor.erro ? '<div class="text-xs text-red-400">Dados indisponíveis</div>' : ""}
            </div>
          </div>
        </div>
      `,
        )
        .join("")

      showToast(`${setoresComGasto.length} setores carregados`, "success")
    } catch (error) {
      console.error("Erro ao carregar estatísticas dos setores:", error)
      setoresList.innerHTML = `
      <div class="p-8 text-center">
        <div class="text-red-400">
          <i class="fas fa-exclamation-circle text-2xl mb-2"></i>
          <p>Erro ao carregar setores</p>
        </div>
      </div>
    `
      showToast("Erro ao carregar setores", "error")
    } finally {
      setoresLoading.classList.add("hidden")
      setoresList.classList.remove("hidden")
    }
  }

  async function carregarEstatisticasCategorias(dataInicio, dataFim) {
    const categoriasLoading = document.getElementById("categoriasLoading")
    const categoriasList = document.getElementById("categoriasList")

    try {
      categoriasLoading.classList.remove("hidden")
      categoriasList.classList.add("hidden")

      // Buscar todas as categorias e equipamentos em paralelo
      const [categoriasResponse, equipamentosResponse] = await Promise.all([
        window.API_CONFIG.authenticatedRequest("/categorias"),
        window.API_CONFIG.authenticatedRequest("/equipamentos"),
      ])

      const categorias = categoriasResponse.Data || categoriasResponse.data || categoriasResponse || []
      const equipamentos = equipamentosResponse.Data || equipamentosResponse.data || equipamentosResponse || []

      if (!categorias || categorias.length === 0) {
        categoriasList.innerHTML = `
        <div class="p-8 text-center">
          <div class="text-gray-400">
            <i class="fas fa-tags text-2xl mb-2"></i>
            <p>Nenhuma categoria encontrada</p>
          </div>
        </div>
      `
        categoriasLoading.classList.add("hidden")
        categoriasList.classList.remove("hidden")
        return
      }

      const inicioISO = new Date(dataInicio + "T00:00:00").toISOString()
      const fimISO = new Date(dataFim + "T23:59:59").toISOString()

      const categoriasComGasto = []

      for (const categoria of categorias) {
        // Filtrar equipamentos desta categoria
        const equipamentosCategoria = equipamentos.filter((eq) => eq.categoriaId === categoria.id && eq.ativo)

        let gastoTotalCategoria = 0
        let tempoUsoTotal = 0

        // Para cada equipamento da categoria, buscar seu relatório individual
        for (const equipamento of equipamentosCategoria) {
          try {
            const url = `/relatorios/equipamento/${equipamento.id}?dataInicio=${encodeURIComponent(inicioISO)}&dataFim=${encodeURIComponent(fimISO)}`
            const relatorioEquip = await window.API_CONFIG.authenticatedRequest(url)

            gastoTotalCategoria += relatorioEquip.gastoEnergeticoTotal || 0
            tempoUsoTotal += relatorioEquip.tempoUsoTotal || 0
          } catch (err) {
            console.error(`Erro ao carregar dados do equipamento ${equipamento.nome}:`, err)
            // Se não conseguir buscar o relatório, usar uma estimativa baseada no gasto kWh
            gastoTotalCategoria += equipamento.gastokwh || 0
          }
        }

        categoriasComGasto.push({
          id: categoria.id,
          nome: categoria.nome,
          gastoTotal: gastoTotalCategoria,
          quantidadeEquipamentos: equipamentosCategoria.length,
          tempoUsoTotal: tempoUsoTotal,
        })
      }

      // Ordenar por gasto total (decrescente)
      categoriasComGasto.sort((a, b) => b.gastoTotal - a.gastoTotal)

      // Renderizar lista
      categoriasList.innerHTML = categoriasComGasto
        .map(
          (categoria, index) => `
        <div class="p-4 border-b border-white/5 hover:bg-white/5 transition-all duration-200 animate-fade-in-up" style="animation-delay: ${index * 0.1}s;">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-xl flex items-center justify-center">
                <i class="fas fa-tag text-gray-900 text-sm"></i>
              </div>
              <div>
                <div class="text-white font-medium">${categoria.nome}</div>
                <div class="text-xs text-gray-400">
                  ${categoria.quantidadeEquipamentos} equipamentos • ${categoria.tempoUsoTotal.toFixed(1)}h uso
                </div>
              </div>
            </div>
            <div class="text-right">
              <div class="text-white font-semibold">${categoria.gastoTotal.toFixed(2)} kWh</div>
            </div>
          </div>
        </div>
      `,
        )
        .join("")

      showToast(`${categoriasComGasto.length} categorias carregadas`, "success")
    } catch (error) {
      console.error("Erro ao carregar estatísticas das categorias:", error)
      categoriasList.innerHTML = `
      <div class="p-8 text-center">
        <div class="text-red-400">
          <i class="fas fa-exclamation-circle text-2xl mb-2"></i>
          <p>Erro ao carregar categorias</p>
        </div>
      </div>
    `
      showToast("Erro ao carregar categorias", "error")
    } finally {
      categoriasLoading.classList.add("hidden")
      categoriasList.classList.remove("hidden")
    }
  }

  // Função para animar números
  function animateNumber(elementId, finalValue) {
    const element = document.getElementById(elementId)
    let currentValue = 0
    const increment = finalValue / 30
    const timer = setInterval(() => {
      currentValue += increment
      if (currentValue >= finalValue) {
        element.textContent = finalValue
        clearInterval(timer)
      } else {
        element.textContent = Math.floor(currentValue)
      }
    }, 50)
  }

  // Função para animar valores com unidade
  function animateValue(elementId, finalValue, unit) {
    const element = document.getElementById(elementId)
    let currentValue = 0
    const increment = finalValue / 30
    const timer = setInterval(() => {
      currentValue += increment
      if (currentValue >= finalValue) {
        element.textContent = `${finalValue.toFixed(2)} ${unit}`
        clearInterval(timer)
      } else {
        element.textContent = `${currentValue.toFixed(2)} ${unit}`
      }
    }, 50)
  }

  // Toast notification function
  function showToast(message, type = "info") {
    // Se Utils estiver disponível, usar ele
    if (window.Utils && window.Utils.showToast) {
      window.Utils.showToast(message, type)
      return
    }
    
    // Fallback local
    const toast = document.createElement("div")
    toast.className = `fixed top-6 right-6 z-50 p-4 rounded-xl shadow-2xl transition-all duration-300 transform translate-x-full backdrop-blur-lg`

    const colors = {
      success: "bg-green-500/90 text-white",
      error: "bg-red-500/90 text-white",
      warning: "bg-yellow-500/90 text-black",
      info: "bg-blue-500/90 text-white",
    }

    toast.className += ` ${colors[type] || colors.info}`
    toast.innerHTML = `
      <div class="flex items-center space-x-2">
        <i class="fas ${getToastIcon(type)}"></i>
        <span>${message}</span>
      </div>
    `

    document.body.appendChild(toast)
    setTimeout(() => toast.classList.remove("translate-x-full"), 100)
    setTimeout(() => {
      toast.classList.add("translate-x-full")
      setTimeout(() => toast.remove(), 300)
    }, 3000)
  }

  function getToastIcon(type) {
    const icons = {
      success: "fa-check-circle",
      error: "fa-exclamation-circle",
      warning: "fa-exclamation-triangle",
      info: "fa-info-circle",
    }
    return icons[type] || icons.info
  }



  // Função para atualizar o gráfico com dados reais
  function atualizarGraficoComDadosReais(data, dataInicio, dataFim) {
    const canvas = document.getElementById("chart-line")
    const ctx = canvas.getContext("2d")
    
    // Destruir gráfico existente se houver
    if (window.dashboardChart) {
      window.dashboardChart.destroy()
    }

    // Criar gradiente
    const gradientStroke = ctx.createLinearGradient(0, 230, 0, 50)
    gradientStroke.addColorStop(1, "rgba(255, 202, 28, 0.2)")
    gradientStroke.addColorStop(0.2, "rgba(255, 202, 28, 0.1)")
    gradientStroke.addColorStop(0, "rgba(255, 202, 28, 0)")

    // Gerar dados do gráfico baseado no período selecionado
    const dadosGrafico = gerarDadosGrafico(data, dataInicio, dataFim)

    window.dashboardChart = new Chart(ctx, {
      type: "line",
      data: {
        labels: dadosGrafico.labels,
        datasets: [
          {
            label: "Consumo (kWh)",
            tension: 0.4,
            borderWidth: 3,
            borderColor: "#FFCA1C",
            backgroundColor: gradientStroke,
            fill: true,
            data: dadosGrafico.dados,
            pointBackgroundColor: "#FFCA1C",
            pointBorderColor: "#FFCA1C",
            pointBorderWidth: 2,
            pointRadius: 6,
            pointHoverRadius: 8,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: "rgba(26, 27, 35, 0.9)",
            titleColor: "#FFFFFF",
            bodyColor: "#FFFFFF",
            borderColor: "#FFCA1C",
            borderWidth: 1,
            cornerRadius: 8,
          },
        },
        interaction: { intersect: false, mode: "index" },
        scales: {
          y: {
            grid: {
              drawBorder: false,
              display: true,
              drawOnChartArea: true,
              drawTicks: false,
              borderDash: [5, 5],
              color: "rgba(255, 255, 255, 0.1)",
            },
            ticks: {
              display: true,
              padding: 10,
              color: "#A1A1AA",
              font: { size: 11, family: "Inter", style: "normal", lineHeight: 2 },
            },
          },
          x: {
            grid: {
              drawBorder: false,
              display: false,
              drawOnChartArea: false,
              drawTicks: false,
              borderDash: [5, 5],
            },
            ticks: {
              display: true,
              color: "#A1A1AA",
              padding: 20,
              font: { size: 11, family: "Inter", style: "normal", lineHeight: 2 },
            },
          },
        },
      },
    })
  }

  // Função para gerar dados do gráfico baseado no período
  function gerarDadosGrafico(data, dataInicio, dataFim) {
    const inicio = new Date(dataInicio)
    const fim = new Date(dataFim)
    
    // Se for o mesmo mês, mostrar dias
    if (inicio.getMonth() === fim.getMonth() && inicio.getFullYear() === fim.getFullYear()) {
      const dias = []
      const dados = []
      const dataAtual = new Date(inicio)
      
      while (dataAtual <= fim) {
        dias.push(dataAtual.getDate().toString().padStart(2, '0'))
        // Usar dados reais se disponíveis, senão usar uma distribuição do gasto total
        const gastoDiario = data.gastoEnergeticoTotal ? (data.gastoEnergeticoTotal / (fim.getDate() - inicio.getDate() + 1)) : 0
        dados.push(gastoDiario)
        dataAtual.setDate(dataAtual.getDate() + 1)
      }
      
      return { labels: dias, dados: dados }
    } else {
      // Se for período maior, mostrar meses
      const meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"]
      const dados = [
        data.consumoJan || 0,
        data.consumoFev || 0,
        data.consumoMar || 0,
        data.consumoAbr || 0,
        data.consumoMai || 0,
        data.consumoJun || 0,
        data.consumoJul || 0,
        data.consumoAgo || 0,
        data.consumoSet || 0,
        data.consumoOut || 0,
        data.consumoNov || 0,
        data.consumoDez || 0
      ]
      
      return { labels: meses, dados: dados }
    }
  }
})
