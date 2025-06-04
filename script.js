/**
 * Faz a chamada ao NOSSO BACKEND (hospedado no Render) para buscar a previsão detalhada.
 * O backend, por sua vez, chamará a API OpenWeatherMap.
 * @async
 * @param {string} cidade - O nome da cidade para buscar a previsão.
 * @returns {Promise<object>} Uma promessa que resolve com o objeto de dados completo da API OpenWeatherMap (repassado pelo nosso backend).
 * @throws {Error} Lança um erro se ocorrer um erro na chamada ao nosso backend ou se o backend retornar um erro.
 */
async function fetchPrevisaoDaAPI(cidade) {
    // ANTES (se estivesse configurado para local):
    // const backendUrl = `http://localhost:3001/api/previsao/${encodeURIComponent(cidade)}`;

    // DEPOIS (para usar o backend no Render):
    // IMPORTANTE: Substitua 'garagem-backend-seu-nome' pelo nome real do seu serviço no Render!
    const backendUrl = `https://garagem-backend-seu-nome.onrender.com/api/previsao/${encodeURIComponent(cidade)}`;
    // Exemplo se o nome do seu serviço no Render for "minha-garagem-api":
    // const backendUrl = `https://minha-garagem-api.onrender.com/api/previsao/${encodeURIComponent(cidade)}`;

    console.log(`[Frontend] Chamando backend em: ${backendUrl}`);

    try {
        const response = await fetch(backendUrl);
        
        // Tenta pegar a mensagem de erro do JSON, mesmo se !response.ok
        const data = await response.json().catch(() => ({})); 

        if (!response.ok) {
            // data.error é a mensagem que nosso backend envia no JSON de erro
            const erroMsg = data.error || `Erro ${response.status} ao buscar previsão no servidor.`;
            console.error(`[Frontend] Erro do backend: ${response.status} - ${erroMsg}`, data);
            throw new Error(erroMsg);
        }
        
        // Verifica se a estrutura dos dados recebidos do backend é a esperada (igual à da OpenWeatherMap)
        if (data.cod !== "200" || !data.list || !Array.isArray(data.list)) {
             console.error("[Frontend] Resposta do backend bem-sucedida, mas dados da OpenWeatherMap parecem inválidos ou incompletos:", data);
             let erroEstrutura = `Resposta do backend recebida, mas os dados da previsão parecem incompletos.`;
             if (data.message) erroEstrutura += ` Mensagem da API (via backend): ${data.message}`;
             else if (data.cod && data.cod !== "200") erroEstrutura += ` A API (via backend) retornou um código de erro: ${data.cod}.`;
             else if (!data.list) erroEstrutura += ` A lista de previsões ('list') não foi encontrada na resposta.`;

             throw new Error(erroEstrutura);
        }
        console.log("[Frontend] Dados da previsão recebidos do backend:", data);
        return data; // Retorna os dados da OpenWeatherMap repassados pelo backend

    } catch (error) {
        // Erros podem ser de rede (fetch falhou) ou o 'throw new Error' de cima.
        console.error("[Frontend] Falha ao buscar previsão via backend:", error.message);
        // Re-lança o erro para ser pego pelo event listener do botão
        throw error; 
    }
}

// --- Lógica da UI para Previsão do Tempo ---

const previsaoResultadoDiv = document.getElementById('previsao-tempo-resultado');
const destinoInput = document.getElementById('destino-viagem');
const verificarClimaBtn = document.getElementById('verificar-clima-btn');
const forecastControlsDiv = document.getElementById('forecast-interaction-controls');
const diasFilterOptionsDiv = document.getElementById('dias-filter-options');
const highlightFilterOptionsDiv = document.getElementById('highlight-filter-options');

let cachePrevisaoCompleta = null; // Para armazenar os dados da API e refiltrar

/**
 * Exibe mensagens de feedback (loading, error, success) na área de previsão.
 * @param {string} mensagem - A mensagem a ser exibida.
 * @param {'loading'|'error'|'success'} tipo - O tipo de mensagem.
 */
function exibirFeedbackClima(mensagem, tipo = 'loading') {
    if (!previsaoResultadoDiv) return;
    previsaoResultadoDiv.innerHTML = ''; // Limpa conteúdo anterior
    if (tipo === 'success' && !mensagem) { // Limpa feedback se sucesso e sem mensagem específica
        previsaoResultadoDiv.style.display = 'block'; // Garante que está visível para os cards
        return;
    }
    
    const feedbackDiv = document.createElement('div');
    feedbackDiv.className = `feedback-clima ${tipo}`;
    feedbackDiv.textContent = mensagem;
    previsaoResultadoDiv.appendChild(feedbackDiv);
    previsaoResultadoDiv.style.display = 'block';
}

/**
 * Processa os dados brutos da API OpenWeatherMap para agrupar por dia.
 * @param {object} apiData - Os dados retornados pela API (via backend).
 * @returns {Array<object>} Um array de objetos, cada um representando a previsão para um dia.
 */
function processarDadosPrevisao(apiData) {
    const previsoesPorDia = {};

    apiData.list.forEach(item => {
        const dia = item.dt_txt.split(' ')[0]; // "YYYY-MM-DD"
        if (!previsoesPorDia[dia]) {
            previsoesPorDia[dia] = {
                dataISO: dia,
                entradas: [],
                temp_min: item.main.temp_min,
                temp_max: item.main.temp_max,
                descricoes: {},
                icones: {},
                condicoesPrincipais: new Set() // Para checar chuva, etc.
            };
        }
        previsoesPorDia[dia].entradas.push(item);
        previsoesPorDia[dia].temp_min = Math.min(previsoesPorDia[dia].temp_min, item.main.temp_min);
        previsoesPorDia[dia].temp_max = Math.max(previsoesPorDia[dia].temp_max, item.main.temp_max);
        
        const descricao = item.weather[0].description;
        const icone = item.weather[0].icon;
        const condicaoPrincipal = item.weather[0].main.toLowerCase(); // Ex: "rain", "clouds"

        previsoesPorDia[dia].descricoes[descricao] = (previsoesPorDia[dia].descricoes[descricao] || 0) + 1;
        previsoesPorDia[dia].icones[icone] = (previsoesPorDia[dia].icones[icone] || 0) + 1;
        previsoesPorDia[dia].condicoesPrincipais.add(condicaoPrincipal);
    });

    return Object.values(previsoesPorDia).map(diaInfo => {
        // Escolher descrição e ícone representativos (ex: o mais frequente ou do meio-dia)
        let descRepresentativa = Object.keys(diaInfo.descricoes).reduce((a, b) => diaInfo.descricoes[a] > diaInfo.descricoes[b] ? a : b, '');
        let iconRepresentativo = Object.keys(diaInfo.icones).reduce((a, b) => diaInfo.icones[a] > diaInfo.icones[b] ? a : b, '');
        
        // Tenta pegar do meio-dia se disponível
        const entradaMeioDia = diaInfo.entradas.find(e => e.dt_txt.includes("12:00:00"));
        if (entradaMeioDia) {
            descRepresentativa = entradaMeioDia.weather[0].description;
            iconRepresentativo = entradaMeioDia.weather[0].icon;
        }

        // Formatar data para exibição
        const dataObj = new Date(diaInfo.dataISO + 'T00:00:00'); // Adiciona T00:00:00 para evitar problemas de fuso ao converter só a data
        const dataFormatada = dataObj.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' });

        return {
            data: dataFormatada,
            dataISO: diaInfo.dataISO,
            temp_min: Math.round(diaInfo.temp_min),
            temp_max: Math.round(diaInfo.temp_max),
            descricao: descRepresentativa,
            icone: `https://openweathermap.org/img/wn/${iconRepresentativo}@2x.png`,
            condicoes: Array.from(diaInfo.condicoesPrincipais) // Ex: ["clouds", "rain"]
        };
    }).slice(0, 5); // Garante no máximo 5 dias
}

/**
 * Renderiza os cards de previsão do tempo no HTML.
 */
function renderizarPrevisao() {
    if (!cachePrevisaoCompleta || !previsaoResultadoDiv) return;

    previsaoResultadoDiv.innerHTML = ''; // Limpa para renderizar novamente

    const tituloCidade = document.createElement('h4');
    tituloCidade.innerHTML = `<i class="fas fa-map-marker-alt"></i> Previsão para ${cachePrevisaoCompleta.city.name}`;
    previsaoResultadoDiv.appendChild(tituloCidade);

    const containerCards = document.createElement('div');
    containerCards.className = 'forecast-container';

    // Aplicar filtros de dias
    const diasSelecionadosBtn = diasFilterOptionsDiv.querySelector('button.active');
    const numDiasParaMostrar = diasSelecionadosBtn ? parseInt(diasSelecionadosBtn.dataset.dias) : 5;
    
    const dadosProcessados = processarDadosPrevisao(cachePrevisaoCompleta);
    const dadosFiltradosPorDia = dadosProcessados.slice(0, numDiasParaMostrar);

    // Aplicar filtros de destaque
    const destaqueChuva = document.getElementById('destaque-chuva').checked;
    const destaqueTempBaixa = document.getElementById('destaque-temp-baixa').checked;
    const destaqueTempAlta = document.getElementById('destaque-temp-alta').checked;

    dadosFiltradosPorDia.forEach(dia => {
        const card = document.createElement('div');
        card.className = 'forecast-day-card';

        let classesDestaque = [];
        if (destaqueChuva && dia.condicoes.some(c => ['rain', 'drizzle', 'thunderstorm'].includes(c))) {
            classesDestaque.push('highlight-chuva');
        }
        if (destaqueTempBaixa && dia.temp_min < 10) {
            classesDestaque.push('highlight-temp-baixa');
        }
        if (destaqueTempAlta && dia.temp_max > 30) {
            classesDestaque.push('highlight-temp-alta');
        }
        if (classesDestaque.length > 0) {
            card.classList.add(...classesDestaque);
        }

        card.innerHTML = `
            <p class="forecast-date"><strong>${dia.data}</strong></p>
            <img src="${dia.icone}" alt="${dia.descricao}" class="weather-icon-forecast">
            <p class="forecast-description">${dia.descricao.charAt(0).toUpperCase() + dia.descricao.slice(1)}</p>
            <p class="forecast-temp">
                <i class="fas fa-temperature-low"></i> ${dia.temp_min}°C / 
                <i class="fas fa-temperature-high"></i> ${dia.temp_max}°C
            </p>
        `;
        containerCards.appendChild(card);
    });

    previsaoResultadoDiv.appendChild(containerCards);
    previsaoResultadoDiv.style.display = 'block';
    forecastControlsDiv.style.display = 'flex'; // Mostra os controles de filtro
}


// --- Event Listeners ---
document.addEventListener('DOMContentLoaded', () => {
    console.log("Garagem Inteligente Conectada inicializada. Frontend consumindo backend na nuvem.");

    // Lógica da Garagem (Adicionar Veículo, Listar, Modal, Manutenção)
    // ... Seu código existente da garagem iria aqui ...
    // Exemplo (se você já tiver essa lógica em outro lugar ou for adicioná-la):
    // if (typeof inicializarAplicacaoGaragem === 'function') {
    //     inicializarAplicacaoGaragem(); // Chama a função principal da sua lógica de garagem
    // }


    // --- Event Listener para Previsão do Tempo ---
    if (verificarClimaBtn) {
        verificarClimaBtn.addEventListener('click', async () => {
            const cidade = destinoInput.value.trim();
            if (!cidade) {
                exibirFeedbackClima("Por favor, digite o nome da cidade.", "error");
                return;
            }

            exibirFeedbackClima(`Buscando previsão para ${cidade}...`, "loading");
            try {
                cachePrevisaoCompleta = await fetchPrevisaoDaAPI(cidade);
                exibirFeedbackClima("", "success"); // Limpa o loading
                renderizarPrevisao(); // Renderiza com base no cache e filtros atuais
            } catch (error) {
                exibirFeedbackClima(error.message || "Não foi possível buscar a previsão.", "error");
                forecastControlsDiv.style.display = 'none'; // Esconde controles se erro
            }
        });
    }

    // Event Listeners para os filtros de previsão
    if (diasFilterOptionsDiv) {
        diasFilterOptionsDiv.addEventListener('click', (e) => {
            if (e.target.tagName === 'BUTTON') {
                diasFilterOptionsDiv.querySelectorAll('button').forEach(btn => btn.classList.remove('active'));
                e.target.classList.add('active');
                if (cachePrevisaoCompleta) renderizarPrevisao(); // Re-renderiza se já houver dados
            }
        });
    }

    if (highlightFilterOptionsDiv) {
        highlightFilterOptionsDiv.addEventListener('change', (e) => {
            if (e.target.type === 'checkbox') {
                if (cachePrevisaoCompleta) renderizarPrevisao(); // Re-renderiza se já houver dados
            }
        });
    }

    // Inicializa o Flatpickr para os campos de data/hora
    // (Verifique se o elemento 'manutencaoData' existe e se flatpickr está carregado)
    try {
        if (document.getElementById('manutencaoData') && typeof flatpickr === 'function') {
            flatpickr("#manutencaoData", {
                enableTime: true,
                dateFormat: "Y-m-d H:i",
                locale: "pt" // Assegure-se que o script de localização pt.js está carregado no HTML
            });
        }
    } catch (e) {
        console.warn("Flatpickr não pôde ser inicializado. Verifique se o elemento e a biblioteca estão presentes.", e);
    }
});