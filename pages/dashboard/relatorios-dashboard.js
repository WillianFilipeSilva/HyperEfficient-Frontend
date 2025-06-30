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
  });

  // Função para carregar os cards principais do relatório da empresa
  async function carregarRelatorioEmpresa() {
    try {
      const hoje = new Date();
      const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1).toISOString();
      const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).toISOString();
      
      const url = `${API_CONFIG.ENDPOINTS.RELATORIOS}/empresa?dataInicio=${inicioMes}&dataFim=${fimMes}`;
      const data = await API_CONFIG.authenticatedRequest(url);

      document.getElementById('cardSetores').textContent = data.quantidadeSetores;
      document.getElementById('cardEquipamentos').textContent = data.quantidadeEquipamentos;
      document.getElementById('cardTempoUso').textContent = `${data.tempoUsoTotal.toFixed(2)} h`;
      document.getElementById('cardGastoEnergetico').textContent = `${data.gastoEnergeticoTotal.toFixed(2)} kWh`;

    } catch (error) {
      console.error('Erro ao carregar relatório da empresa:', error);
      document.getElementById('cardSetores').textContent = 'Erro';
      document.getElementById('cardEquipamentos').textContent = 'Erro';
      document.getElementById('cardTempoUso').textContent = 'Erro';
      document.getElementById('cardGastoEnergetico').textContent = 'Erro';
      Utils.showToast('Não foi possível carregar os dados gerais.', 'error');
    }
  }

  // Função para carregar a tabela de estatísticas por setor
  async function carregarEstatisticasPorSetor() {
    const tbody = document.getElementById('estatisticasSetoresBody');
    tbody.innerHTML = '<tr><td colspan="4" class="text-center p-4">Carregando...</td></tr>';
    
    try {
      const setores = await API_CONFIG.authenticatedRequest(API_CONFIG.ENDPOINTS.SETORES);
      
      if (!setores || setores.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center p-4">Nenhum setor encontrado.</td></tr>';
        return;
      }

      const hoje = new Date();
      const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1).toISOString();
      const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).toISOString();
      
      let content = '';
      for (const setor of setores) {
        try {
          const url = `${API_CONFIG.ENDPOINTS.RELATORIOS}/setor/${setor.id}?dataInicio=${inicioMes}&dataFim=${fimMes}`;
          const relatorio = await API_CONFIG.authenticatedRequest(url);
          
          content += `
            <tr class="border-b dark:border-white/40">
              <td class="p-2 align-middle bg-transparent w-3/10 whitespace-nowrap">
                <div class="flex items-center px-2 py-1">
                  <div class="ml-6">
                    <h6 class="mb-0 text-sm leading-normal dark:text-white">${relatorio.nomeSetor}</h6>
                  </div>
                </div>
              </td>
              <td class="p-2 align-middle bg-transparent whitespace-nowrap text-center">
                <h6 class="mb-0 text-sm leading-normal dark:text-white">${relatorio.quantidadeEquipamentos}</h6>
              </td>
              <td class="p-2 align-middle bg-transparent whitespace-nowrap text-center">
                 <h6 class="mb-0 text-sm leading-normal dark:text-white">${relatorio.tempoUsoTotal.toFixed(2)} h</h6>
              </td>
              <td class="p-2 text-sm leading-normal align-middle bg-transparent whitespace-nowrap text-center">
                <h6 class="mb-0 text-sm leading-normal dark:text-white">${relatorio.gastoEnergeticoTotal.toFixed(2)} kWh</h6>
              </td>
            </tr>`;
        } catch (err) {
          console.error(`Falha ao carregar dados para o setor ${setor.nome}:`, err);
          // Adiciona uma linha indicando erro para este setor específico
          content += `
            <tr class="border-b dark:border-white/40">
              <td class="p-2 align-middle bg-transparent"><h6 class="mb-0 text-sm leading-normal dark:text-white">${setor.nome}</h6></td>
              <td colspan="3" class="p-2 text-center text-red-500">Não foi possível carregar os dados</td>
            </tr>`;
        }
      }
      tbody.innerHTML = content;

    } catch (error) {
      console.error('Erro ao carregar estatísticas por setor:', error);
      tbody.innerHTML = `<tr><td colspan="4" class="text-center p-4 text-red-500">Erro ao carregar a lista de setores.</td></tr>`;
      Utils.showToast('Não foi possível carregar as estatísticas dos setores.', 'error');
    }
  }

  // Função para inicializar o gráfico principal (exemplo)
  function inicializarGraficoPrincipal() {
    var ctx = document.getElementById("chart-line").getContext("2d");
    var gradientStroke1 = ctx.createLinearGradient(0, 230, 0, 50);
    gradientStroke1.addColorStop(1, 'rgba(94, 114, 228, 0.2)');
    gradientStroke1.addColorStop(0.2, 'rgba(94, 114, 228, 0.0)');
    gradientStroke1.addColorStop(0, 'rgba(94, 114, 228, 0)');
    
    new Chart(ctx, {
      type: "line",
      data: {
        labels: ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"],
        datasets: [{
          label: "Gasto (kWh)",
          tension: 0.4,
          borderWidth: 3,
          borderColor: "#5e72e4",
          backgroundColor: gradientStroke1,
          fill: true,
          data: [50, 40, 300, 220, 500, 250, 400, 230, 500, 320, 450, 600], // Dados de exemplo
          maxBarThickness: 6
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        interaction: { intersect: false, mode: 'index' },
        scales: {
          y: {
            grid: { drawBorder: false, display: true, drawOnChartArea: true, drawTicks: false, borderDash: [5, 5] },
            ticks: { display: true, padding: 10, color: '#fbfbfb', font: { size: 11, family: "Open Sans", style: 'normal', lineHeight: 2 } }
          },
          x: {
            grid: { drawBorder: false, display: false, drawOnChartArea: false, drawTicks: false, borderDash: [5, 5] },
            ticks: { display: true, color: '#ccc', padding: 20, font: { size: 11, family: "Open Sans", style: 'normal', lineHeight: 2 } }
          },
        },
      },
    });
  }
}); 