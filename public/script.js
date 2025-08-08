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
    
    // NOVO: Adiciona o listener para o formulário de edição
    document.getElementById('formEditarVeiculo').addEventListener('submit', handleEditarVeiculo);
});

function inicializarApp() {
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

        listaDiv.innerHTML = ''; 

        if (veiculos.length === 0) {
            listaDiv.innerHTML = '<p>Nenhum veículo na garagem. Adicione um acima!</p>';
            return;
        }

        veiculos.forEach(veiculo => {
            const item = document.createElement('div');
            item.className = 'vehicle-item';
            // ATUALIZADO: Adicionados os botões "Editar" e "Excluir" com o _id do veículo
            item.innerHTML = `
                <span>
                    <i class="fas fa-car-side"></i>
                    <strong>${veiculo.marca} ${veiculo.modelo}</strong> (${veiculo.ano} - ${veiculo.placa})
                </span>
                <div class="actions">
                    <button class="info" onclick="handleAbrirModalEdicao('${veiculo._id}')">Editar</button>
                    <button class="warning" onclick="handleRemoverVeiculo('${veiculo._id}', '${veiculo.modelo}')">Excluir</button>
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
            throw new Error(resultado.error || 'Erro desconhecido ao salvar veículo.');
        }

        mostrarNotificacao(`Veículo '${resultado.modelo}' adicionado com sucesso!`, 'success');
        e.target.reset();
        renderizarListaVeiculos(); 

    } catch (error) {
        console.error("Erro ao adicionar veículo:", error);
        mostrarNotificacao(`Erro: ${error.message}`, 'error');
    }
}

/**
 * [DELETE] Lida com o clique no botão para remover um veículo.
 * ATUALIZADO: Agora usa o método DELETE e o ID correto.
 */
async function handleRemoverVeiculo(veiculoId, veiculoModelo) {
    // Mostra um pop-up de confirmação antes de deletar
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
        
        // Atualiza a lista na tela para refletir a remoção
        renderizarListaVeiculos();

    } catch (error) {
        console.error("Erro ao remover veículo:", error);
        mostrarNotificacao(`Erro: ${error.message}`, 'error');
    }
}

/**
 * NOVO: [EDIT - Passo 1] Abre o modal de edição e preenche com os dados do veículo.
 */
async function handleAbrirModalEdicao(veiculoId) {
    try {
        // Busca os dados mais recentes do veículo na API
        const response = await fetch(`${API_URL}/veiculos/${veiculoId}`);
        if (!response.ok) {
            throw new Error('Falha ao buscar dados do veículo para edição.');
        }
        const veiculo = await response.json();

        // Preenche os campos do formulário de edição no modal
        document.getElementById('editVeiculoId').value = veiculo._id;
        document.getElementById('editPlacaVeiculo').value = veiculo.placa;
        document.getElementById('editMarcaVeiculo').value = veiculo.marca;
        document.getElementById('editModeloVeiculo').value = veiculo.modelo;
        document.getElementById('editAnoVeiculo').value = veiculo.ano;
        document.getElementById('editCorVeiculo').value = veiculo.cor;

        // Exibe o modal
        document.getElementById('modalEdicao').style.display = 'block';

    } catch (error) {
        console.error("Erro ao abrir modal de edição:", error);
        mostrarNotificacao(`Erro: ${error.message}`, 'error');
    }
}

/**
 * NOVO: [EDIT - Passo 2] Pega os dados do formulário e envia a requisição PUT.
 */
async function handleEditarVeiculo(e) {
    e.preventDefault();

    const veiculoId = document.getElementById('editVeiculoId').value;
    
    const veiculoData = {
        placa: document.getElementById('editPlacaVeiculo').value,
        marca: document.getElementById('editMarcaVeiculo').value,
        modelo: document.getElementById('editModeloVeiculo').value,
        ano: parseInt(document.getElementById('editAnoVeiculo').value),
        cor: document.getElementById('editCorVeiculo').value
    };

    try {
        const response = await fetch(`${API_URL}/veiculos/${veiculoId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(veiculoData),
        });

        const resultado = await response.json();

        if (!response.ok) {
            throw new Error(resultado.error || 'Erro desconhecido ao atualizar veículo.');
        }

        // Esconde o modal
        document.getElementById('modalEdicao').style.display = 'none';
        
        mostrarNotificacao(`Veículo '${resultado.modelo}' atualizado com sucesso!`, 'success');
        
        // Atualiza a lista na tela para mostrar os dados novos
        renderizarListaVeiculos();

    } catch (error) {
        console.error("Erro ao editar veículo:", error);
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