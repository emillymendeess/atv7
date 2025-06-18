// server.js

// Usando a sintaxe de import do ES Modules, conforme definido no package.json
import express from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';

// Carrega as variáveis de ambiente do arquivo .env
dotenv.config();

// Inicializando o aplicativo Express
const app = express();
// Usa a porta fornecida pelo ambiente (ex: Render) ou a porta 3000 para desenvolvimento local
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors()); // Habilita o CORS para permitir que o frontend faça requisições
app.use(express.json()); // Permite que o servidor entenda requisições com corpo em JSON

// --- DADOS MOCKADOS (Simulando um Banco de Dados) ---

const dicasManutencaoGerais = [
    { id: 1, dica: "Verifique o nível do óleo do motor regularmente." },
    { id: 2, dica: "Calibre os pneus semanalmente, incluindo o estepe." },
    { id: 3, dica: "Confira o fluido de arrefecimento (água do radiador)." },
    { id: 4, dica: "Teste os freios para garantir que estão respondendo bem." },
    { id: 5, dica: "Mantenha os faróis e lanternas limpos e funcionando." }
];

const dicasPorTipo = {
    carro: [
        { id: 10, dica: "Faça o rodízio dos pneus a cada 10.000 km para um desgaste uniforme." },
        { id: 11, dica: "Verifique o alinhamento e balanceamento periodicamente." }
    ],
    carroesportivo: [
        { id: 15, dica: "Aqueça o motor por alguns minutos antes de exigir alto desempenho." },
        { id: 16, dica: "Use sempre combustível de alta octanagem recomendado pelo fabricante." }
    ],
    caminhao: [
        { id: 20, dica: "Verifique a pressão dos pneus de carga antes de cada viagem." },
        { id: 21, dica: "Inspecione o sistema de freios a ar com frequência." }
    ]
};

const viagensPopulares = [
    { id: 1, destino: "Serra Gaúcha, RS", descricao: "Aproveite o clima frio, vinhos e paisagens deslumbrantes." },
    { id: 2, destino: "Litoral Nordestino, BR", descricao: "Relaxe nas praias paradisíacas com sol o ano todo." },
    { id: 3, destino: "Rota 66, EUA", descricao: "Uma viagem clássica pela história e cultura americana." }
];

const proximasRevisoes = {
    'ABC-1234': {
        placa: 'ABC-1234', modelo: 'Sedan', proximaRevisao: '2024-12-15',
        itensVerificar: ['Troca de óleo', 'Filtro de ar', 'Alinhamento']
    },
    'XYZ-9876': {
        placa: 'XYZ-9876', modelo: 'Super Carro', proximaRevisao: '2025-02-10',
        itensVerificar: ['Fluidos de alta performance', 'Sistema de freios', 'Pneus esportivos']
    }
};


// --- DEFINIÇÃO DOS ENDPOINTS (ROTAS DA API) ---

/**
 * Endpoint Proxy para a API OpenWeatherMap.
 * Essencial para manter a chave da API segura no backend.
 */
app.get('/api/previsao/:cidade', async (req, res) => {
    const { cidade } = req.params;
    const apiKey = process.env.OPENWEATHER_API_KEY;

    if (!apiKey) {
        console.error("ERRO: A chave da API OpenWeatherMap não foi definida no arquivo .env");
        return res.status(500).json({ error: 'Erro de configuração no servidor: a chave da API não foi encontrada.' });
    }

    // Usando o endpoint de previsão de 5 dias / 3 horas, que o frontend espera.
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${cidade}&appid=${apiKey}&units=metric&lang=pt_br`;
    console.log(`[Backend] Recebida requisição para a cidade: ${cidade}. Chamando a API externa.`);

    try {
        const response = await axios.get(url);
        // Repassa a resposta da OpenWeatherMap diretamente para o frontend
        res.json(response.data);
    } catch (error) {
        console.error("[Backend] Erro ao chamar a API OpenWeatherMap:", error.response?.data || error.message);
        // Se a API externa retornou um erro (ex: cidade não encontrada), repassa o status e a mensagem
        if (error.response) {
            res.status(error.response.status).json({
                error: `Erro da API de clima: ${error.response.data.message}`
            });
        } else {
            // Se foi um erro de rede ou outro problema
            res.status(500).json({ error: 'Não foi possível conectar ao serviço de previsão do tempo.' });
        }
    }
});


// 1. Endpoint para Dicas de Manutenção Gerais
app.get('/api/dicas-manutencao', (req, res) => {
    console.log('Requisição recebida em /api/dicas-manutencao');
    res.json(dicasManutencaoGerais);
});

// 2. Endpoint para Dicas de Manutenção por Tipo de Veículo
app.get('/api/dicas-manutencao/:tipoVeiculo', (req, res) => {
    const { tipoVeiculo } = req.params;
    console.log(`Requisição recebida para o tipo de veículo: ${tipoVeiculo}`);
    const dicas = dicasPorTipo[tipoVeiculo.toLowerCase()];
    if (dicas) {
        res.json(dicas);
    } else {
        res.status(404).json({ error: `Nenhuma dica encontrada para o tipo: ${tipoVeiculo}` });
    }
});

// 3. Endpoint para Viagens Populares
app.get('/api/viagens-populares', (req, res) => {
    console.log('Requisição recebida em /api/viagens-populares');
    res.json(viagensPopulares);
});

// 4. (Bônus) Endpoint para Próxima Revisão por Placa
app.get('/api/veiculos/:placa/proxima-revisao', (req, res) => {
    const { placa } = req.params;
    console.log(`Buscando revisão para a placa: ${placa}`);
    const revisao = proximasRevisoes[placa.toUpperCase()];
    if (revisao) {
        res.json(revisao);
    } else {
        res.status(404).json({ message: `Nenhum registro de revisão encontrado para a placa: ${placa}` });
    }
});

// Rota raiz para testar se o servidor está no ar
app.get('/', (req, res) => {
    res.send('<h1>API da Garagem Inteligente Conectada está no ar!</h1>');
});

// Iniciando o servidor
app.listen(PORT, () => {
    console.log(`Servidor da Garagem Inteligente rodando em http://localhost:${PORT}`);
});