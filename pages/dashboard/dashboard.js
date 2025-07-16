if (!window.API_CONFIG.ENDPOINTS.RELATORIOS) {
  window.API_CONFIG.ENDPOINTS.RELATORIOS = "/relatorios"
}



  window.addEventListener("DOMContentLoaded", () => {
    if (window.initAuthGuard) window.initAuthGuard();

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
      
      salvarFiltroPeriodo(dataInicio, dataFim)
    }

    document.getElementById("dataInicio").value = dataInicio
    document.getElementById("dataFim").value = dataFim

    document.getElementById("btnAtualizarRelatorio").addEventListener("click", atualizarRelatorios)
    
    document.getElementById("dataInicio").addEventListener("change", onPeriodoChange)
    document.getElementById("dataFim").addEventListener("change", onPeriodoChange)

    console.log("Carregando dados do período atual...")

    atualizarRelatorios()
  }

  function salvarFiltroPeriodo(dataInicio, dataFim) {
    const filtro = {
      dataInicio: dataInicio,
      dataFim: dataFim
    }
    sessionStorage.setItem("filtroPeriodo", JSON.stringify(filtro))
  }

  function limparFiltroPeriodo() {
    sessionStorage.removeItem("filtroPeriodo")
  }

  function onPeriodoChange() {
    const dataInicio = document.getElementById("dataInicio").value
    const dataFim = document.getElementById("dataFim").value
    
    if (dataInicio && dataFim) {
      const dataInicioObj = new Date(dataInicio)
      const dataFimObj = new Date(dataFim)
      const diffEmDias = (dataFimObj - dataInicioObj) / (1000 * 60 * 60 * 24)
      
      const btnAtualizar = document.getElementById("btnAtualizarRelatorio")
      
      if (diffEmDias > 365) {
        btnAtualizar.disabled = true
        btnAtualizar.classList.add("opacity-50", "cursor-not-allowed")
        showToast("Período máximo permitido é de 1 ano", "warning")
      } else if (dataInicioObj > dataFimObj) {
        btnAtualizar.disabled = true
        btnAtualizar.classList.add("opacity-50", "cursor-not-allowed")
        showToast("Data inicial deve ser anterior à data final", "error")
      } else {
        btnAtualizar.disabled = false
        btnAtualizar.classList.remove("opacity-50", "cursor-not-allowed")
      }
      
      salvarFiltroPeriodo(dataInicio, dataFim)
    }
  }

  function setupPageUnload() {
    window.addEventListener("beforeunload", () => {
      limparFiltroPeriodo()
    })
    
    window.addEventListener("pagehide", () => {
      limparFiltroPeriodo()
    })
  }

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

    const dataInicioObj = new Date(dataInicio)
    const dataFimObj = new Date(dataFim)
    const diffEmDias = (dataFimObj - dataInicioObj) / (1000 * 60 * 60 * 24)
    
    if (diffEmDias > 365) {
      showToast("Período máximo permitido é de 1 ano", "warning")
      return
    }

    salvarFiltroPeriodo(dataInicio, dataFim)

    try {
      await carregarDashboard(dataInicio, dataFim)
    } catch (error) {
      console.error("Erro ao atualizar relatórios:", error)
      showToast("Erro ao atualizar alguns dados", "error")
    }
  }

  async function carregarDashboard(dataInicio, dataFim) {
    try {
      const inicioISO = new Date(dataInicio + "T00:00:00").toISOString()
      const fimISO = new Date(dataFim + "T23:59:59").toISOString()

      const url = `/relatorios/empresa?dataInicio=${encodeURIComponent(inicioISO)}&dataFim=${encodeURIComponent(fimISO)}`
      const data = await window.API_CONFIG.authenticatedRequest(url)

      if (data.totalizadores) {
        animateNumber("cardSetores", data.totalizadores.quantidadeSetores || 0)
        animateNumber("cardEquipamentos", data.totalizadores.quantidadeEquipamentos || 0)
        animateValue("cardTempoUso", data.totalizadores.tempoUsoTotal || 0, "h")
        animateValue("cardGastoEnergetico", data.totalizadores.gastoEnergeticoTotal || 0, "kWh")
      } else {
        animateNumber("cardSetores", data.quantidadeSetores || 0)
        animateNumber("cardEquipamentos", data.quantidadeEquipamentos || 0)
        animateValue("cardTempoUso", data.tempoUsoTotal || 0, "h")
        animateValue("cardGastoEnergetico", data.gastoEnergeticoTotal || 0, "kWh")
      }

      atualizarGraficoComDadosReais(data, dataInicio, dataFim)

      if (data.setores) {
        atualizarListaSetores(data.setores)
      }
      
      if (data.categorias) {
        atualizarListaCategorias(data.categorias)
      }

    } catch (error) {
      console.error("Erro ao carregar dashboard:", error)
      document.getElementById("cardSetores").textContent = "0"
      document.getElementById("cardEquipamentos").textContent = "0"
      document.getElementById("cardTempoUso").textContent = "0h"
      document.getElementById("cardGastoEnergetico").textContent = "0 kWh"
      showToast("Erro ao carregar dados do dashboard", "error")
    }
  }

  function atualizarListaSetores(setores) {
    const setoresLoading = document.getElementById("setoresLoading")
    const setoresList = document.getElementById("setoresList")

    if (!setoresList) return

    setoresLoading?.classList.add("hidden")
    setoresList.classList.remove("hidden")

    if (!setores || setores.length === 0) {
      setoresList.innerHTML = `
        <div class="p-8 text-center">
          <div class="text-gray-400">
            <i class="fas fa-building text-2xl mb-2"></i>
            <p>Nenhum setor encontrado</p>
          </div>
        </div>
      `
      return
    }

    setores.sort((a, b) => b.gastoTotal - a.gastoTotal)

    setoresList.innerHTML = setores
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
                  ${setor.quantidadeEquipamentos} equipamentos • ${setor.tempoUsoTotal?.toFixed(1) || 0}h uso
                </div>
              </div>
            </div>
            <div class="text-right">
              <div class="text-white font-semibold">${setor.gastoTotal?.toFixed(2) || 0} kWh</div>
            </div>
          </div>
        </div>
      `,
      )
      .join("")
  }

  function atualizarListaCategorias(categorias) {
    const categoriasLoading = document.getElementById("categoriasLoading")
    const categoriasList = document.getElementById("categoriasList")

    if (!categoriasList) return

    categoriasLoading?.classList.add("hidden")
    categoriasList.classList.remove("hidden")

    if (!categorias || categorias.length === 0) {
      categoriasList.innerHTML = `
        <div class="p-8 text-center">
          <div class="text-gray-400">
            <i class="fas fa-tags text-2xl mb-2"></i>
            <p>Nenhuma categoria encontrada</p>
          </div>
        </div>
      `
      return
    }

    categorias.sort((a, b) => b.gastoTotal - a.gastoTotal)

    categoriasList.innerHTML = categorias
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
                  ${categoria.quantidadeEquipamentos} equipamentos • ${categoria.tempoUsoTotal?.toFixed(1) || 0}h uso
                </div>
              </div>
            </div>
            <div class="text-right">
              <div class="text-white font-semibold">${categoria.gastoTotal?.toFixed(2) || 0} kWh</div>
            </div>
          </div>
        </div>
      `,
      )
      .join("")
  }

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

  function showToast(message, type = "info") {
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
        <i class="fas ${getToastIcon(type)}"></i>
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

  function getToastIcon(type) {
    const icons = {
      success: "fa-check-circle",
      error: "fa-exclamation-circle",
      warning: "fa-exclamation-triangle",
      info: "fa-info-circle",
    }
    return icons[type] || icons.info
  }

  function atualizarGraficoComDadosReais(data, dataInicio, dataFim) {
    const canvas = document.getElementById("chart-line")
    const ctx = canvas.getContext("2d")
    
    if (window.dashboardChart) {
      window.dashboardChart.destroy()
    }

    const gradientStroke = ctx.createLinearGradient(0, 230, 0, 50)
    gradientStroke.addColorStop(1, "rgba(255, 202, 28, 0.2)")
    gradientStroke.addColorStop(0.2, "rgba(255, 202, 28, 0.1)")
    gradientStroke.addColorStop(0, "rgba(255, 202, 28, 0)")

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

  function gerarDadosGrafico(data, dataInicio, dataFim) {
    if (data.dadosMensais && data.dadosMensais.length > 0) {
      const labels = data.dadosMensais.map(item => item.mesAbreviado)
      const dados = data.dadosMensais.map(item => item.consumoKwh || 0)
      
      return { labels, dados }
    }
    
    const inicio = new Date(dataInicio)
    const fim = new Date(dataFim)
    
    if (inicio.getMonth() === fim.getMonth() && inicio.getFullYear() === fim.getFullYear()) {
      const dias = []
      const dados = []
      const dataAtual = new Date(inicio)
      
      while (dataAtual <= fim) {
        dias.push(dataAtual.getDate().toString().padStart(2, '0'))
        const gastoDiario = data.gastoEnergeticoTotal ? 
          (data.gastoEnergeticoTotal / (fim.getDate() - inicio.getDate() + 1)) : 0
        dados.push(gastoDiario)
        dataAtual.setDate(dataAtual.getDate() + 1)
      }
      
      return { labels: dias, dados: dados }
    } else {
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
