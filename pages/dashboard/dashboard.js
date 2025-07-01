window.addEventListener('DOMContentLoaded', function() {
  initAuthGuard();

  // Aguardar o carregamento de todas as dependências
  Promise.all([
    new Promise(resolve => {
      const checkChart = () => (window.Chart ? resolve() : setTimeout(checkChart, 50));
      checkChart();
    }),
    new Promise(resolve => {
      const checkUtils = () => (window.Utils && window.API_CONFIG && window.AuthUtils ? resolve() : setTimeout(checkUtils, 50));
      checkUtils();
    })
  ]).then(() => {
    carregarRelatorioEmpresa();
    carregarEstatisticasPorSetor();
    inicializarGraficoPrincipal();
    setupLogout();
  });

  // Setup logout button
  function setupLogout() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (confirm('Tem certeza que deseja sair?')) {
          showToast('Logout realizado com sucesso!', 'info');
          setTimeout(() => {
            window.location.href = '/pages/auth/login.html';
          }, 1000);
        }
      });
    }
  }

  // Função para carregar os cards principais do relatório da empresa
  async function carregarRelatorioEmpresa() {
    try {
      const hoje = new Date();
      const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1).toISOString();
      const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).toISOString();
      
      const url = `${API_CONFIG.ENDPOINTS.RELATORIOS}/empresa?dataInicio=${inicioMes}&dataFim=${fimMes}`;
      const data = await API_CONFIG.authenticatedRequest(url);

      // Animar os números
      animateNumber('cardSetores', data.quantidadeSetores);
      animateNumber('cardEquipamentos', data.quantidadeEquipamentos);
      animateValue('cardTempoUso', data.tempoUsoTotal, 'h');
      animateValue('cardGastoEnergetico', data.gastoEnergeticoTotal, 'kWh');

    } catch (error) {
      console.error('Erro ao carregar relatório da empresa:', error);
      document.getElementById('cardSetores').textContent = 'Erro';
      document.getElementById('cardEquipamentos').textContent = 'Erro';
      document.getElementById('cardTempoUso').textContent = 'Erro';
      document.getElementById('cardGastoEnergetico').textContent = 'Erro';
      showToast('Não foi possível carregar os dados gerais.', 'error');
    }
  }

  // Função para animar números
  function animateNumber(elementId, finalValue) {
    const element = document.getElementById(elementId);
    let currentValue = 0;
    const increment = finalValue / 30;
    const timer = setInterval(() => {
      currentValue += increment;
      if (currentValue >= finalValue) {
        element.textContent = finalValue;
        clearInterval(timer);
      } else {
        element.textContent = Math.floor(currentValue);
      }
    }, 50);
  }

  // Função para animar valores com unidade
  function animateValue(elementId, finalValue, unit) {
    const element = document.getElementById(elementId);
    let currentValue = 0;
    const increment = finalValue / 30;
    const timer = setInterval(() => {
      currentValue += increment;
      if (currentValue >= finalValue) {
        element.textContent = `${finalValue.toFixed(2)} ${unit}`;
        clearInterval(timer);
      } else {
        element.textContent = `${currentValue.toFixed(2)} ${unit}`;
      }
    }, 50);
  }

  // Função para carregar a tabela de estatísticas por setor
  async function carregarEstatisticasPorSetor() {
    const tbody = document.getElementById('estatisticasSetoresBody');
    
    try {
      const resposta = await API_CONFIG.authenticatedRequest(API_CONFIG.ENDPOINTS.SETORES);
      const setores = resposta.Data || resposta.data || resposta || [];
      
      if (!setores || setores.length === 0) {
        tbody.innerHTML = `
          <tr>
            <td colspan="4" class="px-6 py-8 text-center">
              <div class="text-gray-400">
                <i class="fas fa-building text-2xl mb-2"></i>
                <p>Nenhum setor encontrado</p>
              </div>
            </td>
          </tr>
        `;
        return;
      }

      const hoje = new Date();
      const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1).toISOString();
      const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).toISOString();
      
      let content = '';
      for (const [index, setor] of setores.entries()) {
        try {
          const url = `${API_CONFIG.ENDPOINTS.RELATORIOS}/setor/${setor.id}?dataInicio=${inicioMes}&dataFim=${fimMes}`;
          const relatorio = await API_CONFIG.authenticatedRequest(url);
          
          content += `
            <tr class="hover:bg-white/5 transition-all duration-200" style="animation-delay: ${index * 0.1}s;">
              <td class="px-6 py-4">
                <div class="flex items-center space-x-3">
                  <div class="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <i class="fas fa-building text-white"></i>
                  </div>
                  <div>
                    <div class="text-white font-medium">${relatorio.nomeSetor}</div>
                    <div class="text-xs text-gray-400">Setor • ID: ${setor.id}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 text-center">
                <span class="text-white font-medium">${relatorio.quantidadeEquipamentos}</span>
              </td>
              <td class="px-6 py-4 text-center">
                <span class="text-white font-medium">${relatorio.tempoUsoTotal.toFixed(2)} h</span>
              </td>
              <td class="px-6 py-4 text-center">
                <span class="text-white font-medium">${relatorio.gastoEnergeticoTotal.toFixed(2)} kWh</span>
              </td>
            </tr>
          `;
        } catch (err) {
          console.error(`Falha ao carregar dados para o setor ${setor.nome}:`, err);
          content += `
            <tr class="hover:bg-white/5 transition-all duration-200">
              <td class="px-6 py-4">
                <div class="flex items-center space-x-3">
                  <div class="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                    <i class="fas fa-exclamation-triangle text-white"></i>
                  </div>
                  <div>
                    <div class="text-white font-medium">${setor.nome}</div>
                    <div class="text-xs text-red-400">Erro ao carregar</div>
                  </div>
                </div>
              </td>
              <td colspan="3" class="px-6 py-4 text-center text-red-400">
                Não foi possível carregar os dados
              </td>
            </tr>
          `;
        }
      }
      tbody.innerHTML = content;

    } catch (error) {
      console.error('Erro ao carregar estatísticas por setor:', error);
      tbody.innerHTML = `
        <tr>
          <td colspan="4" class="px-6 py-8 text-center">
            <div class="text-red-400">
              <i class="fas fa-exclamation-circle text-2xl mb-2"></i>
              <p>Erro ao carregar a lista de setores</p>
            </div>
          </td>
        </tr>
      `;
      showToast('Não foi possível carregar as estatísticas dos setores.', 'error');
    }
  }

  // Função para inicializar o gráfico principal
  function inicializarGraficoPrincipal() {
    const ctx = document.getElementById("chart-line").getContext("2d");
    
    // Criar gradiente
    const gradientStroke = ctx.createLinearGradient(0, 230, 0, 50);
    gradientStroke.addColorStop(1, 'rgba(255, 202, 28, 0.2)');
    gradientStroke.addColorStop(0.2, 'rgba(255, 202, 28, 0.1)');
    gradientStroke.addColorStop(0, 'rgba(255, 202, 28, 0)');
    
    new Chart(ctx, {
      type: "line",
      data: {
        labels: ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"],
        datasets: [{
          label: "Consumo (kWh)",
          tension: 0.4,
          borderWidth: 3,
          borderColor: "#FFCA1C",
          backgroundColor: gradientStroke,
          fill: true,
          data: [50, 40, 300, 220, 500, 250, 400, 230, 500, 320, 450, 600],
          pointBackgroundColor: "#FFCA1C",
          pointBorderColor: "#FFCA1C",
          pointBorderWidth: 2,
          pointRadius: 6,
          pointHoverRadius: 8,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { 
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(26, 27, 35, 0.9)',
            titleColor: '#FFFFFF',
            bodyColor: '#FFFFFF',
            borderColor: '#FFCA1C',
            borderWidth: 1,
            cornerRadius: 8,
          }
        },
        interaction: { intersect: false, mode: 'index' },
        scales: {
          y: {
            grid: { 
              drawBorder: false, 
              display: true, 
              drawOnChartArea: true, 
              drawTicks: false, 
              borderDash: [5, 5],
              color: 'rgba(255, 255, 255, 0.1)'
            },
            ticks: { 
              display: true, 
              padding: 10, 
              color: '#A1A1AA', 
              font: { size: 11, family: "Inter", style: 'normal', lineHeight: 2 } 
            }
          },
          x: {
            grid: { 
              drawBorder: false, 
              display: false, 
              drawOnChartArea: false, 
              drawTicks: false, 
              borderDash: [5, 5] 
            },
            ticks: { 
              display: true, 
              color: '#A1A1AA', 
              padding: 20, 
              font: { size: 11, family: "Inter", style: 'normal', lineHeight: 2 } 
            }
          },
        },
      },
    });
  }

  // Toast notification function
  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `fixed top-6 right-6 z-50 p-4 rounded-xl shadow-2xl transition-all duration-300 transform translate-x-full backdrop-blur-lg`;
    
    const colors = {
      success: 'bg-green-500/90 text-white',
      error: 'bg-red-500/90 text-white',
      warning: 'bg-yellow-500/90 text-black',
      info: 'bg-blue-500/90 text-white'
    };
    
    toast.className += ` ${colors[type] || colors.info}`;
    toast.innerHTML = `
      <div class="flex items-center space-x-2">
        <i class="fas ${getToastIcon(type)}"></i>
        <span>${message}</span>
      </div>
    `;
    
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.remove('translate-x-full'), 100);
    setTimeout(() => {
      toast.classList.add('translate-x-full');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  function getToastIcon(type) {
    const icons = {
      success: 'fa-check-circle',
      error: 'fa-exclamation-circle',
      warning: 'fa-exclamation-triangle',
      info: 'fa-info-circle'
    };
    return icons[type] || icons.info;
  }
});