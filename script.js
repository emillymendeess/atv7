// script.js - VERSÃO ATUALIZADA COM LÓGICA DE AUTENTICAÇÃO INTEGRADA

// =======================================================================
// SEÇÃO 1: FUNÇÕES DE PONTE COM auth.js E CONTROLE DE ESTADO
// =======================================================================

/**
 * Função auxiliar para obter o token e montar o cabeçalho de autorização.
 * <<< MUDANÇA: Centraliza a obtenção do token para todas as requisições.
 */
// Adicione esta função no início do seu arquivo
function getUserIdFromToken() {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
        // Decodifica o payload do token (a parte do meio)
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.id; // Retorna o ID do usuário que está no token
    } catch (e) {
        console.error('Erro ao decodificar token:', e);
        return null;
    }
}

function getAuthHeaders() {
    const token = localStorage.getItem('authToken');
    // Se o token não existir, o usuário será deslogado pela função checkAuthState do auth.js
    if (!token) {
        console.error("Tentativa de fazer requisição sem token.");
        return null;
    }
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
}

/**
 * Função chamada pelo auth.js para limpar a interface quando o usuário desloga.
 * <<< MUDANÇA: Garante que nenhum dado do usuário anterior permaneça na tela.
 */
function limparDadosDaGaragem() {
    document.getElementById('listaVeiculos').innerHTML = '<p>Faça login para ver seus veículos.</p>';
    document.getElementById('listaManutencoes').innerHTML = '';
    document.getElementById('listaAgendamentosFuturos').innerHTML = '<p>Nenhum agendamento futuro encontrado.</p>';
    document.getElementById('formAdicionarVeiculo').reset();
    console.log("Interface da garagem limpa para o estado deslogado.");
}

/**
 * Função chamada pelo auth.js após o login bem-sucedido.
 * É o ponto de partida para carregar todos os dados do usuário.
 * <<< MUDANÇA: Inicia o carregamento de dados da garagem.
 */
async function carregarTudoDoUsuarioLogado() {
    console.log("Usuário logado. Carregando dados da garagem...");
    await carregarVeiculos();
    // Se houver outras funções para carregar dados iniciais, chame-as aqui.
}


// =======================================================================
// SEÇÃO 2: LÓGICA DE CRUD (Create, Read, Update, Delete) PARA VEÍCULOS
// =======================================================================

/**
 * Busca os veículos do usuário no backend e os renderiza na tela.
 */
async function carregarVeiculos() {
    const headers = getAuthHeaders();
    if (!headers) return; // Interrompe se o usuário não estiver logado

    try {
        const response = await fetch('/api/veiculos', { headers });

        if (!response.ok) {
            // Se o token for inválido/expirado, o backend retornará 401 ou 403
            if (response.status === 401 || response.status === 403) {
                // handleLogout() é uma função do auth.js
                if(typeof handleLogout === 'function') handleLogout();
            }
            throw new Error(`Erro ao buscar veículos: ${response.statusText}`);
        }

        const veiculos = await response.json();
        renderizarListaVeiculos(veiculos);
    } catch (error) {
        console.error("Falha ao carregar veículos:", error);
        document.getElementById('listaVeiculos').innerHTML = '<p class="erro">Não foi possível carregar seus veículos. Tente recarregar a página.</p>';
    }
}

// public/script.js

/**
 * Renderiza a lista de veículos na div #listaVeiculos.
 * <<< VERSÃO ATUALIZADA COM LÓGICA DE COMPARTILHAMENTO >>>
 */
function renderizarListaVeiculos(veiculos) {
    const listaDiv = document.getElementById('listaVeiculos');
    listaDiv.innerHTML = ''; 

    if (veiculos.length === 0) {
        listaDiv.innerHTML = '<p>Nenhum veículo na garagem. Adicione um acima!</p>';
        return;
    }

    // <<< PASSO 1: Obter o ID do usuário que está logado no site >>>
    const userIdLogado = getUserIdFromToken();

    veiculos.forEach(v => {
        // <<< PASSO 2: Preparar a etiqueta de compartilhamento (começa vazia) >>>
        let etiquetaCompartilhadoHTML = '';

        // <<< PASSO 3: Verificar se o veículo é compartilhado >>>
        // A API agora envia o 'owner' como um objeto com _id e email.
        // Se o ID do dono do veículo for DIFERENTE do ID do usuário logado, é compartilhado!
        if (v.owner && v.owner._id !== userIdLogado) {
            etiquetaCompartilhadoHTML = `
                <small class="etiqueta-compartilhado">
                    <i class="fas fa-share-alt"></i> Compartilhado por: ${v.owner.email}
                </small>
            `;
        }

        const veiculoCard = document.createElement('div');
        veiculoCard.className = 'veiculo-card';
        veiculoCard.setAttribute('data-id', v._id);

        // <<< PASSO 4: Inserir a etiqueta no HTML do card >>>
        veiculoCard.innerHTML = `
            <div class="card-header">
                <h3>${v.marca} ${v.modelo} (${v.ano})</h3>
                <span class="placa">${v.placa}</span>
            </div>
            ${etiquetaCompartilhadoHTML} 
            <p>Cor: ${v.cor || 'Não informada'}</p>
            <div class="card-actions">
                <button class="btn-detalhes"><i class="fas fa-wrench"></i> Manutenção</button>
                <button class="btn-editar"><i class="fas fa-edit"></i> Editar</button>
                <button class="btn-remover"><i class="fas fa-trash"></i> Remover</button>
            </div>
        `;
        listaDiv.appendChild(veiculoCard);
    });
}

/**
 * Adiciona um novo veículo.
 */
async function adicionarVeiculo(event) {
    event.preventDefault();
    const headers = getAuthHeaders();
    if (!headers) return;

    const novoVeiculo = {
        placa: document.getElementById('placaVeiculo').value,
        marca: document.getElementById('marcaVeiculo').value,
        modelo: document.getElementById('modeloVeiculo').value,
        ano: document.getElementById('anoVeiculo').value,
        cor: document.getElementById('corVeiculo').value,
    };

    try {
        const response = await fetch('/api/veiculos', {
            method: 'POST',
            headers,
            body: JSON.stringify(novoVeiculo)
        });

        if (response.ok) {
            await carregarVeiculos(); // Recarrega a lista para mostrar o novo veículo
            event.target.reset();
        } else {
            const erro = await response.json();
            alert(`Erro ao adicionar veículo: ${erro.error || 'Verifique os dados.'}`);
        }
    } catch (error) {
        console.error("Erro na requisição para adicionar veículo:", error);
    }
}

/**
 * Remove um veículo.
 */
async function removerVeiculo(id) {
    if (!confirm('Tem certeza que deseja remover este veículo e todo o seu histórico?')) {
        return;
    }
    const headers = getAuthHeaders();
    if (!headers) return;

    try {
        const response = await fetch(`/api/veiculos/${id}`, {
            method: 'DELETE',
            headers
        });

        if (response.ok) {
            await carregarVeiculos(); // Recarrega a lista
        } else {
            const erro = await response.json();
            alert(`Erro ao remover veículo: ${erro.error}`);
        }
    } catch (error) {
        console.error('Erro na requisição para remover veículo:', error);
    }
}

// =======================================================================
// SEÇÃO 3: LÓGICA DOS MODAIS (EDIÇÃO E DETALHES/MANUTENÇÃO)
// =======================================================================

// A lógica para abrir modais, preencher formulários, etc. continua a mesma.
// Apenas as chamadas `fetch` dentro delas precisam ser atualizadas.

// Exemplo para o formulário de EDIÇÃO.
async function salvarEdicaoVeiculo(event) {
    event.preventDefault();
    const headers = getAuthHeaders();
    if (!headers) return;

    const id = document.getElementById('editVeiculoId').value;
    const dadosAtualizados = {
        placa: document.getElementById('editPlacaVeiculo').value,
        marca: document.getElementById('editMarcaVeiculo').value,
        modelo: document.getElementById('editModeloVeiculo').value,
        ano: document.getElementById('editAnoVeiculo').value,
        cor: document.getElementById('editCorVeiculo').value,
    };
    
    // Supondo que você tenha a rota PUT /api/veiculos/:id no backend
    try {
        const response = await fetch(`/api/veiculos/${id}`, {
            method: 'PUT', // Assumindo método PUT para atualização
            headers,
            body: JSON.stringify(dadosAtualizados)
        });

        if (response.ok) {
            document.getElementById('modalEdicao').style.display = 'none';
            await carregarVeiculos(); // Recarrega a lista para refletir as mudanças
        } else {
            const erro = await response.json();
            alert(`Erro ao salvar alterações: ${erro.error}`);
        }
    } catch (error) {
        console.error('Erro na requisição para editar veículo:', error);
    }
}

// ... Sua lógica para abrir o modal de edição e preencher os dados ...
function abrirModalEdicao(veiculo) {
    // preenche os campos do form de edição...
    document.getElementById('editVeiculoId').value = veiculo._id;
    document.getElementById('editPlacaVeiculo').value = veiculo.placa;
    document.getElementById('editMarcaVeiculo').value = veiculo.marca;
    // ...etc
    document.getElementById('modalEdicao').style.display = 'block';
}


// =======================================================================
// SEÇÃO 4: LÓGICA DE MANUTENÇÃO
// =======================================================================

// ... Sua lógica para o CRUD de Manutenções, agora com autenticação ...

async function carregarHistoricoManutencao(veiculoId) {
    const headers = getAuthHeaders();
    if (!headers) return;
    
    const containerHistorico = document.getElementById('modalHistoricoManutencao');
    containerHistorico.innerHTML = '<p>Carregando...</p>';

    try {
        const response = await fetch(`/api/veiculos/${veiculoId}/manutencoes`, { headers });
        if(!response.ok) throw new Error('Falha ao buscar histórico.');
        
        const historico = await response.json();
        // ... sua lógica para renderizar o histórico no modal ...

    } catch(error) {
        console.error(error);
        containerHistorico.innerHTML = '<p class="erro">Não foi possível carregar o histórico.</p>';
    }
}


// =======================================================================
// SEÇÃO 5: PLANEJADOR DE VIAGEM E OUTRAS APIs
// =======================================================================

// A sua lógica para a API OpenWeatherMap não precisa de autenticação com o seu backend,
// então ela pode permanecer exatamente como está.
// Apenas certifique-se de que a chave da API esteja configurada.

const OPENWEATHER_API_KEY = "SUA_CHAVE_OPENWEATHERMAP_AQUI"; // <-- SUBSTITUA PELA SUA CHAVE

async function buscarPrevisaoTempo() {
    const cidade = document.getElementById('destino-viagem').value;
    if (!cidade) {
        alert('Por favor, digite uma cidade.');
        return;
    }
    if (OPENWEATHER_API_KEY === "SUA_CHAVE_OPENWEATHERMAP_AQUI") {
        alert("ERRO: A chave da API OpenWeatherMap não foi configurada no script.js");
        return;
    }
    // ... O resto da sua função fetch para a API do clima continua aqui ...
}


// =======================================================================
// SEÇÃO 6: EVENT LISTENERS
// =======================================================================

document.addEventListener('DOMContentLoaded', () => {
    // Listener para o formulário de ADICIONAR VEÍCULO
    const formAdicionar = document.getElementById('formAdicionarVeiculo');
    if (formAdicionar) {
        formAdicionar.addEventListener('submit', adicionarVeiculo);
    }

    // Listener para o formulário de EDITAR VEÍCULO
    const formEditar = document.getElementById('formEditarVeiculo');
    if(formEditar) {
        formEditar.addEventListener('submit', salvarEdicaoVeiculo);
    }

    // Listener para o botão de verificar clima
    const btnClima = document.getElementById('verificar-clima-btn');
    if(btnClima) {
        btnClima.addEventListener('click', buscarPrevisaoTempo);
    }

    // <<< MUDANÇA: Usar delegação de eventos para botões na lista de veículos
    const listaVeiculosDiv = document.getElementById('listaVeiculos');
    listaVeiculosDiv.addEventListener('click', (event) => {
        const target = event.target.closest('button');
        if (!target) return;

        const card = target.closest('.veiculo-card');
        const veiculoId = card.getAttribute('data-id');

        if (target.classList.contains('btn-remover')) {
            removerVeiculo(veiculoId);
        }
        if (target.classList.contains('btn-editar')) {
            // Para editar, precisamos dos dados completos do veículo.
            // O ideal seria buscar do backend ou de um array já carregado.
            // Exemplo simples:
            console.log("Abrir edição para o veículo ID:", veiculoId);
            // Você precisará de uma função para buscar os dados do veículo por ID
            // e então chamar abrirModalEdicao(dadosDoVeiculo);
        }
        if (target.classList.contains('btn-detalhes')) {
            console.log("Abrir detalhes/manutenção para o veículo ID:", veiculoId);
            // Chame sua função que abre o modal de detalhes
            // Ex: abrirModalDetalhes(veiculoId);
        }
    });

    // ... Adicione aqui outros event listeners que você já tinha ...
});