// --- Configuração da URL do Backend ---
// Use a URL do seu backend no Render quando fizer o deploy.
// Para testes locais, use 'http://localhost:3000'.
const backendUrl = 'http://localhost:3000'; 

// --- Lógica da Garagem (Funções de exemplo para integração) ---
// NOTA: Estas funções representam a lógica da garagem que já deveria existir.
// O foco aqui é na integração com as novas chamadas de API.
function abrirModalDetalhes(veiculo) {
    // 1. Lógica existente para preencher o modal com os dados do veículo...
    console.log(`Abrindo modal para o veículo tipo: ${veiculo.tipo}`);
    
    // 2. NOVA INTEGRAÇÃO: Buscar e exibir dicas específicas para o tipo do veículo.
    fetchDicasPorTipo(veiculo.tipo);
    
    // 3. Lógica para exibir o modal...
    // document.getElementById('modalDetalhesVeiculo').style.display = 'block';
}

// --- Funções para API de Dicas e Viagens ---

/**
 * Função genérica para buscar dados de um endpoint e exibi-los na UI.
 * @param {string} endpoint - O caminho do endpoint da API (ex: '/api/dicas-manutencao').
 * @param {string} containerId - O ID do elemento HTML onde os resultados serão inseridos.
 * @param {string} titulo - O título para a seção de resultados.
 * @param {function} renderItem - Uma função que recebe um item de dados e retorna uma string HTML para ele.
 */
async function fetchAndDisplayAPIContent(endpoint, containerId, titulo, renderItem) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const contentDiv = container.querySelector('.api-content');

    try {
        const response = await fetch(`${backendUrl}${endpoint}`);
        if (!response.ok) {
            throw new Error(`Erro ${response.status} ao buscar dados.`);
        }
        const data = await response.json();

        if (data && data.length > 0) {
            contentDiv.innerHTML = '<ul>' + data.map(renderItem).join('') + '</ul>';
        } else {
            contentDiv.innerHTML = '<p>Nenhuma informação encontrada.</p>';
        }

    } catch (error) {
        console.error(`Erro ao buscar dados de ${endpoint}:`, error);
        contentDiv.innerHTML = `<p class="error">Não foi possível carregar as informações. Tente novamente mais tarde.</p>`;
    }
}

/**
 * Busca e exibe dicas de manutenção específicas para um tipo de veículo no modal.
 * @param {string} tipoVeiculo - O tipo do veículo (ex: 'Carro', 'Caminhao').
 */
async function fetchDicasPorTipo(tipoVeiculo) {
    const container = document.getElementById('dicas-especificas-api');
    if (!container) return;

    container.innerHTML = '<h4><i class="fas fa-star"></i> Dicas para este Veículo</h4><p>Buscando dicas...</p>'; // Feedback inicial
    
    try {
        const response = await fetch(`${backendUrl}/api/dicas-manutencao/${tipoVeiculo.toLowerCase()}`);
        const data = await response.json();

        if (response.ok) {
             if (data && data.length > 0) {
                container.innerHTML += '<ul>' + data.map(item => `<li>${item.dica}</li>`).join('') + '</ul>';
                container.querySelector('p').remove(); // Remove o "Buscando dicas..."
            } else {
                container.innerHTML += '<p>Nenhuma dica específica encontrada para este tipo de veículo.</p>';
            }
        } else {
            throw new Error(data.error || 'Erro ao buscar dicas específicas.');
        }

    } catch (error) {
        console.error('Erro ao buscar dicas por tipo:', error);
        container.innerHTML += `<p class="error">${error.message}</p>`;
    }
}


// --- Funções da Previsão do Tempo (Lógica existente) ---

async function fetchPrevisaoDaAPI(cidade) {
    const previsaoUrl = `${backendUrl}/api/previsao/${encodeURIComponent(cidade)}`; // Assumindo que o backend tem essa rota
    // ... restante da lógica de previsão do tempo
}
// ... (O resto do seu código de previsão do tempo, processamento, renderização e event listeners permanecem aqui)


// --- Inicialização da Página e Event Listeners ---

document.addEventListener('DOMContentLoaded', () => {
    console.log("Garagem Inteligente Conectada inicializada.");

    // --- NOVA EXECUÇÃO: Carregar dicas e viagens na tela principal ---
    fetchAndDisplayAPIContent(
        '/api/dicas-manutencao', 
        'dicas-gerais-container', 
        'Dicas Gerais de Manutenção',
        (item) => `<li>${item.dica}</li>`
    );

    fetchAndDisplayAPIContent(
        '/api/viagens-populares',
        'viagens-populares-container',
        'Sugestões de Viagem',
        (item) => `<li><strong>${item.destino}:</strong> ${item.descricao}</li>`
    );


    // Lógica da Garagem (Adicionar Veículo, Listar, etc.)
    // ... Seu código existente da garagem iria aqui para inicializar ...

    // Exemplo de como a integração com o modal funcionaria:
    // Supondo que você tenha um evento que dispara ao clicar em um veículo na lista.
    /*
    document.getElementById('listaVeiculos').addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-detalhes')) {
            const veiculoId = e.target.dataset.id;
            // Você precisaria buscar o objeto do veículo pelo ID
            const veiculo = encontrarVeiculoPorId(veiculoId); 
            if (veiculo) {
                abrirModalDetalhes(veiculo); // A chamada que integra as dicas específicas
            }
        }
    });
    */


    // --- Event Listener para Previsão do Tempo (Lógica existente) ---
    const verificarClimaBtn = document.getElementById('verificar-clima-btn');
    if (verificarClimaBtn) {
        // ... seu event listener para o botão de clima ...
    }
});