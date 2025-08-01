/**
 * @file script.js
 * Lógica principal do Frontend para a Garagem Inteligente Conectada.
 * - Gerencia veículos (CRUD) via API do Backend.
 * - Controla a interface do usuário (UI).
 */

// URL base da sua API de backend
const API_URL = 'http://localhost:3001/api';

// --- MANIPULAÇÃO DA UI (Interface do Usuário) ---

document.addEventListener('DOMContentLoaded', () => {
    inicializarApp();
    document.getElementById('formAdicionarVeiculo').addEventListener('submit', handleAdicionarVeiculo);
});

function inicializarApp() {
    // Agora a inicialização apenas chama a função que busca os dados da API
    renderizarListaVeiculos();
}

/**
 * [READ] Busca todos os veículos da API e os renderiza na tela.
 */
async function renderizarListaVeiculos() {
    const listaDiv = document.getElementById('listaVeiculos');
    listaDiv.innerHTML = '<p>Carregando veículos do banco de dados...</p>';

    try {
        const response = await fetch(`${API_URL}/veiculos`);
        if (!response.ok) {
            throw new Error('Não foi possível buscar os veículos.');
        }
        const veiculos = await response.json();

        listaDiv.innerHTML = ''; // Limpa a mensagem de "carregando"

        if (veiculos.length === 0) {
            listaDiv.innerHTML = '<p>Nenhum veículo na garagem. Adicione um acima!</p>';
            return;
        }

        veiculos.forEach(veiculo => {
            const item = document.createElement('div');
            item.className = 'vehicle-item';
            // Usamos veiculo._id que vem do MongoDB
            item.innerHTML = `
                <span>
                    <i class="fas fa-car-side"></i>
                    <strong>${veiculo.marca} ${veiculo.modelo}</strong> (${veiculo.ano} - ${veiculo.placa})
                </span>
                <div class="actions">
                    <button onclick="alert('Funcionalidade de detalhes a ser implementada!')">Detalhes</button>
                    <button class="warning" onclick="handleRemoverVeiculo('${veiculo._id}', '${veiculo.modelo}')">Remover</button>
                </div>
            `;
            listaDiv.appendChild(item);
        });

    } catch (error) {
        console.error("Erro ao buscar veículos:", error);
        listaDiv.innerHTML = '<p class="error">Falha ao carregar veículos. Verifique se o servidor backend está rodando.</p>';
    }
}

/**
 * [CREATE] Lida com o envio do formulário para adicionar um novo veículo.
 */
async function handleAdicionarVeiculo(e) {
    e.preventDefault();
    
    const veiculoData = {
        placa: document.getElementById('placaVeiculo').value,
        marca: document.getElementById('marcaVeiculo').value,
        modelo: document.getElementById('modeloVeiculo').value,
        ano: parseInt(document.getElementById('anoVeiculo').value),
        cor: document.getElementById('corVeiculo').value
    };

    try {
        const response = await fetch(`${API_URL}/veiculos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(veiculoData),
        });

        const resultado = await response.json();

        if (!response.ok) {
            // Usa a mensagem de erro vinda do backend
            throw new Error(resultado.error || 'Erro desconhecido ao salvar veículo.');
        }

        mostrarNotificacao(`Veículo '${resultado.modelo}' adicionado com sucesso!`, 'success');
        e.target.reset();
        
        // Melhoria Chave: Atualiza a lista na tela automaticamente!
        renderizarListaVeiculos(); 

    } catch (error) {
        console.error("Erro ao adicionar veículo:", error);
        mostrarNotificacao(`Erro: ${error.message}`, 'error');
    }
}

/**
 * [DELETE] Lida com o clique no botão para remover um veículo.
 */
async function handleRemoverVeiculo(veiculoId, veiculoModelo) {
    if (!confirm(`Tem certeza que deseja remover o veículo ${veiculoModelo}?`)) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/veiculos/${veiculoId}`, {
            method: 'DELETE',
        });

        const resultado = await response.json();

        if (!response.ok) {
            throw new Error(resultado.error || 'Erro desconhecido ao remover veículo.');
        }

        mostrarNotificacao(`Veículo '${veiculoModelo}' removido.`, 'warning');
        
        // Atualiza a lista na tela
        renderizarListaVeiculos();

    } catch (error) {
        console.error("Erro ao remover veículo:", error);
        mostrarNotificacao(`Erro: ${error.message}`, 'error');
    }
}

/**
 * Exibe uma notificação flutuante na tela.
 */
function mostrarNotificacao(mensagem, tipo = 'info') {
    const notificacaoDiv = document.getElementById('notificacoes');
    if (!notificacaoDiv) return;
    
    notificacaoDiv.textContent = mensagem;
    notificacaoDiv.className = `show ${tipo}`;
    
    setTimeout(() => {
        notificacaoDiv.className = notificacaoDiv.className.replace('show', '');
    }, 3001);
}


// Funções do Modal
function renderizarAcoesVeiculoModal(veiculo) {
    const acoesDiv = document.getElementById('modalAcoesVeiculo');
    let acoesHTML = `
        <button onclick="executarAcao('${veiculo.id}', 'ligar')">Ligar</button>
        <button onclick="executarAcao('${veiculo.id}', 'desligar')">Desligar</button>
        <button onclick="executarAcao('${veiculo.id}', 'acelerar')">Acelerar</button>
        <button onclick="executarAcao('${veiculo.id}', 'frear')">Frear</button>
        <button onclick="executarAcao('${veiculo.id}', 'buzinar')">Buzinar</button>
    `;
    if (veiculo instanceof CarroEsportivo) {
        acoesHTML += `<button onclick="executarAcao('${veiculo.id}', 'ativarTurbo')">Ativar Turbo</button>`;
        acoesHTML += `<button onclick="executarAcao('${veiculo.id}', 'desativarTurbo')">Desativar Turbo</button>`;
    }
    if (veiculo instanceof Caminhao) {
        const peso = prompt("Digite o peso para carregar (em kg):", "1000");
        if (peso) {
             acoesHTML += `<button onclick="executarAcao('${veiculo.id}', 'carregar', ${parseInt(peso)})">Carregar Carga</button>`;
        }
    }
    acoesDiv.innerHTML = acoesHTML;
}

function executarAcao(veiculoId, acao, valor = null) {
    const veiculo = garagem.encontrarVeiculo(veiculoId);
    if (!veiculo) return;

    let resultado = '';
    if (typeof veiculo[acao] === 'function') {
        resultado = veiculo[acao](valor);
    }

    mostrarNotificacao(resultado, 'info');
    garagem.salvarVeiculos();
    renderizarInfoVeiculoModal(veiculo);
    renderizarAcoesVeiculoModal(veiculo); // Recria botões, útil para o caminhão
}


// Manutenção
function renderizarHistoricoManutencaoModal(veiculo) {
    const historicoDiv = document.getElementById('modalHistoricoManutencao');
    historicoDiv.innerHTML = '';
    const agora = new Date();

    const historico = veiculo.historicoManutencao.filter(m => new Date(m.data) <= agora);
    const agendamentos = veiculo.historicoManutencao.filter(m => new Date(m.data) > agora);
    
    if (historico.length === 0 && agendamentos.length === 0) {
        historicoDiv.innerHTML = '<p>Nenhum registro de manutenção para este veículo.</p>';
        return;
    }

    if(historico.length > 0) {
        historicoDiv.innerHTML += '<h4>Histórico Passado</h4>';
        historico.forEach(m => {
             historicoDiv.innerHTML += `<p>${new Date(m.data).toLocaleString('pt-BR')}: ${m.tipo} - R$ ${m.custo}</p>`;
        });
    }

    if(agendamentos.length > 0) {
        historicoDiv.innerHTML += '<h4>Agendamentos Futuros</h4>';
        agendamentos.forEach(m => {
             historicoDiv.innerHTML += `<p>${new Date(m.data).toLocaleString('pt-BR')}: ${m.tipo} - R$ ${m.custo}</p>`;
        });
    }
}

function handleAdicionarManutencao(e) {
    e.preventDefault();
    const veiculoId = document.getElementById('manutencaoVeiculoId').value;
    const veiculo = garagem.encontrarVeiculo(veiculoId);
    if (!veiculo) return;

    const [dia, mes, anoHora] = document.getElementById('manutencaoData').value.split('/');
    const [ano, hora] = anoHora.split(' ');
    const dataISO = `${ano}-${mes}-${dia}T${hora}`;

    const novaManutencao = {
        id: `maint-${Date.now()}`,
        data: new Date(dataISO).toISOString(),
        tipo: document.getElementById('manutencaoTipo').value,
        custo: parseFloat(document.getElementById('manutencaoCusto').value),
        descricao: document.getElementById('manutencaoDescricao').value
    };

    veiculo.historicoManutencao.push(novaManutencao);
    veiculo.historicoManutencao.sort((a,b) => new Date(a.data) - new Date(b.data));

    garagem.salvarVeiculos();
    mostrarNotificacao('Manutenção/Agendamento salvo!', 'success');
    renderizarHistoricoManutencaoModal(veiculo);
    renderizarAgendamentosFuturos();
    e.target.reset();
}

function renderizarAgendamentosFuturos() {
    const listaDiv = document.getElementById('listaAgendamentosFuturos');
    listaDiv.innerHTML = '';
    const agora = new Date();
    let todosAgendamentos = [];

    garagem.veiculos.forEach(v => {
        v.historicoManutencao
            .filter(m => new Date(m.data) > agora)
            .forEach(m => todosAgendamentos.push({ ...m, veiculo: v }));
    });
    
    todosAgendamentos.sort((a,b) => new Date(a.data) - new Date(b.data));

    if(todosAgendamentos.length === 0) {
        listaDiv.innerHTML = '<p>Nenhum agendamento futuro encontrado.</p>';
        return;
    }

    todosAgendamentos.forEach(agendamento => {
        const item = document.createElement('div');
        item.className = 'schedule-item';
        item.innerHTML = `
            <span>
                <strong>${agendamento.veiculo.modelo}</strong>: ${agendamento.tipo} em 
                ${new Date(agendamento.data).toLocaleDateString('pt-BR')}
            </span>
        `;
        listaDiv.appendChild(item);
    });
}

// Detalhes extras via API
async function renderizarDetalhesExtrasAPI(veiculoId) {
    const contentDiv = document.getElementById('detalhes-extras-api-content');
    contentDiv.innerHTML = '<p class="loading">Buscando detalhes extras...</p>';

    try {
        const response = await fetch(`/api/veiculo/${veiculoId}`);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || `Erro ${response.status}`);
        }
        
        contentDiv.innerHTML = `
            <h4><i class="fas fa-file-invoice-dollar"></i> Detalhes Adicionais</h4>
            <p><strong>Valor FIPE:</strong> ${data.valorFipe}</p>
            <p><strong>Recall Pendente:</strong> ${data.recallPendente ? `<span style="color:red;font-weight:bold;">SIM</span>` : 'Não'}</p>
            <p><strong>Info Recall:</strong> ${data.recallInfo}</p>
            <p><strong>Próxima Revisão (km):</strong> ${data.proximaRevisaoKm.toLocaleString('pt-BR')}</p>
            <p><strong>Dica de Manutenção:</strong> ${data.dicaManutencao}</p>
        `;

    } catch (error) {
        contentDiv.innerHTML = `<p class="error">Não foi possível carregar os detalhes extras: ${error.message}</p>`;
    }
}

// Funções do clima
function exibirFeedbackClima(mensagem, tipo = 'loading') {
    const previsaoResultadoDiv = document.getElementById('previsao-tempo-resultado');
    previsaoResultadoDiv.innerHTML = `<div class="feedback-clima ${tipo}">${mensagem}</div>`;
    previsaoResultadoDiv.style.display = 'block';
}

function processarDadosPrevisao(apiData) {
    const previsoesPorDia = {};
    apiData.list.forEach(item => {
        const dia = item.dt_txt.split(' ')[0];
        if (!previsoesPorDia[dia]) {
            previsoesPorDia[dia] = {
                dataISO: dia,
                entradas: [],
                temp_min: item.main.temp_min,
                temp_max: item.main.temp_max,
                descricoes: {},
                icones: {},
                condicoesPrincipais: new Set()
            };
        }
        previsoesPorDia[dia].entradas.push(item);
        previsoesPorDia[dia].temp_min = Math.min(previsoesPorDia[dia].temp_min, item.main.temp_min);
        previsoesPorDia[dia].temp_max = Math.max(previsoesPorDia[dia].temp_max, item.main.temp_max);
        
        previsoesPorDia[dia].descricoes[item.weather[0].description] = (previsoesPorDia[dia].descricoes[item.weather[0].description] || 0) + 1;
        previsoesPorDia[dia].icones[item.weather[0].icon] = (previsoesPorDia[dia].icones[item.weather[0].icon] || 0) + 1;
        previsoesPorDia[dia].condicoesPrincipais.add(item.weather[0].main.toLowerCase());
    });

    return Object.values(previsoesPorDia).map(diaInfo => {
        const entradaMeioDia = diaInfo.entradas.find(e => e.dt_txt.includes("12:00:00"));
        const descRepresentativa = entradaMeioDia ? entradaMeioDia.weather[0].description : Object.keys(diaInfo.descricoes).reduce((a, b) => diaInfo.descricoes[a] > diaInfo.descricoes[b] ? a : b);
        const iconRepresentativo = entradaMeioDia ? entradaMeioDia.weather[0].icon : Object.keys(diaInfo.icones).reduce((a, b) => diaInfo.icones[a] > diaInfo.icones[b] ? a : b);
        const dataObj = new Date(diaInfo.dataISO + 'T12:00:00');

        return {
            data: dataObj.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' }),
            temp_min: Math.round(diaInfo.temp_min),
            temp_max: Math.round(diaInfo.temp_max),
            descricao: descRepresentativa,
            icone: `https://openweathermap.org/img/wn/${iconRepresentativo}@2x.png`,
            condicoes: Array.from(diaInfo.condicoesPrincipais)
        };
    });
}

function criarCardPrevisao(dia) {
    const card = document.createElement('div');
    card.className = 'forecast-day-card';

    const destaqueChuva = document.getElementById('destaque-chuva').checked;
    const destaqueTempBaixa = document.getElementById('destaque-temp-baixa').checked;
    const destaqueTempAlta = document.getElementById('destaque-temp-alta').checked;

    if (destaqueChuva && dia.condicoes.some(c => ['rain', 'drizzle', 'thunderstorm'].includes(c))) card.classList.add('highlight-chuva');
    if (destaqueTempBaixa && dia.temp_min < 10) card.classList.add('highlight-temp-baixa');
    if (destaqueTempAlta && dia.temp_max > 30) card.classList.add('highlight-temp-alta');

    card.innerHTML = `
        <p class="forecast-date"><strong>${dia.data}</strong></p>
        <img src="${dia.icone}" alt="${dia.descricao}" class="weather-icon-forecast">
        <p class="forecast-description">${dia.descricao.charAt(0).toUpperCase() + dia.descricao.slice(1)}</p>
        <p class="forecast-temp">
            <i class="fas fa-temperature-low"></i> ${dia.temp_min}°C / 
            <i class="fas fa-temperature-high"></i> ${dia.temp_max}°C
        </p>
    `;
    return card;
}

function handleFiltroDias(e) {
    if (e.target.tagName === 'BUTTON') {
        document.querySelectorAll('#dias-filter-options button').forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
        if (cachePrevisaoCompleta) renderizarPrevisao();
    }
}

function handleFiltroDestaque() {
    if (cachePrevisaoCompleta) renderizarPrevisao();
}