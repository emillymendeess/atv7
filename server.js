// server.js modificado para usar MongoDB Atlas
import express from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';
import { MongoClient, ObjectId } from 'mongodb'; // <-- 1. IMPORTAR o MongoClient

// Configuração inicial
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// --- VARIÁVEIS DE CONEXÃO E BANCO DE DADOS ---
const mongoUrl = process.env.DATABASE_URL;
const dbName = 'garagemDB'; // O nome do banco que você definiu na string de conexão
let veiculosCollection; // Variável para acessar a coleção de veículos

// --- FUNÇÃO PARA CONECTAR AO MONGODB ATLAS ---
const connectToDb = async () => {
    try {
        const client = new MongoClient(mongoUrl);
        await client.connect();
        console.log('✅ Conectado com sucesso ao MongoDB Atlas!');
        const db = client.db(dbName);
        veiculosCollection = db.collection('veiculos'); // Aponta para a coleção "veiculos"
    } catch (error) {
        console.error('❌ Erro ao conectar com o MongoDB Atlas:', error);
        process.exit(1); // Encerra a aplicação se não conseguir conectar ao DB
    }
};

// --- ENDPOINTS (Rotas da API) ---

/**
 * Rota Principal
 */
app.get('/', (req, res) => {
    res.send('<h1>API da Garagem Inteligente Conectada está no ar e conectada ao DB!</h1>');
});

/**
 * ROTA TEMPORÁRIA PARA POPULAR O BANCO DE DADOS (SEED)
 * Chame esta rota UMA VEZ para inserir os dados iniciais no seu banco.
 * Exemplo: acesse http://localhost:3001/api/seed no seu navegador.
 */
app.get('/api/seed', async (req, res) => {
    const dadosIniciais = [
        {
            // O ID agora é gerenciado pelo MongoDB (_id), mas mantemos um ID amigável.
            id_veiculo: "veh-lxhq4v7a-9z3b1c8e", 
            valorFipe: "R$ 45.000,00",
            recallPendente: false,
            recallInfo: "Nenhum recall pendente.",
            proximaRevisaoKm: 80000,
            dicaManutencao: "Verificar nível do óleo a cada 5.000km."
        },
        {
            id_veiculo: "veh-ly0a9b8f-d4e5f6g7",
            valorFipe: "R$ 180.000,00",
            recallPendente: true,
            recallInfo: "Recall pendente: Substituição do módulo do airbag do passageiro.",
            proximaRevisaoKm: 50000,
            dicaManutencao: "Manter pneus calibrados conforme especificação para melhor performance."
        }
    ];

    try {
        // Limpa a coleção para evitar duplicatas ao chamar a rota novamente
        await veiculosCollection.deleteMany({}); 
        // Insere os novos dados
        const resultado = await veiculosCollection.insertMany(dadosIniciais);
        console.log(`[SEED] Banco de dados populado com ${resultado.insertedCount} veículos.`);
        res.status(201).json({ message: `Banco de dados populado com sucesso com ${resultado.insertedCount} veículos.` });
    } catch (error) {
        console.error('[SEED] Erro ao popular o banco de dados:', error);
        res.status(500).json({ error: 'Falha ao popular o banco de dados.' });
    }
});


/**
 * Endpoint para buscar detalhes de um veículo específico do MongoDB.
 * A busca agora é feita pelo campo "id_veiculo" que criamos.
 */
app.get('/api/veiculo/:id', async (req, res) => { // <-- Rota agora é async
    const { id } = req.params;

    try {
        // Busca no banco de dados pelo campo 'id_veiculo'
        const detalhes = await veiculosCollection.findOne({ id_veiculo: id });

        if (detalhes) {
            console.log(`[Backend DB] Detalhes encontrados para o veículo ID: ${id}`);
            res.json(detalhes);
        } else {
            console.warn(`[Backend DB] Nenhum detalhe encontrado para o veículo ID: ${id}`);
            res.status(404).json({ error: 'Detalhes do veículo não encontrados.' });
        }
    } catch (error) {
        console.error(`[Backend DB] Erro ao buscar veículo ID ${id}:`, error);
        res.status(500).json({ error: 'Erro interno do servidor ao buscar dados do veículo.' });
    }
});

/**
 * Rota Proxy para a API OpenWeatherMap (Permanece igual)
 */
app.get('/api/previsao/:cidade', async (req, res) => {
    // ... (este código não muda, então foi omitido para brevidade, mantenha o seu original)
    const { cidade } = req.params;
    const apiKey = process.env.OPENWEATHER_API_KEY;

    if (!apiKey) {
        console.error('[Backend] ERRO: OPENWEATHER_API_KEY não definida no arquivo .env');
        return res.status(500).json({ error: 'Chave da API de clima não configurada no servidor.' });
    }

    const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${cidade}&appid=${apiKey}&units=metric&lang=pt_br`;

    try {
        console.log(`[Backend] Buscando previsão para '${cidade}' na API OpenWeatherMap.`);
        const response = await axios.get(apiUrl);
        res.json(response.data);
    } catch (error) {
        const status = error.response ? error.response.status : 500;
        const message = error.response ? error.response.data.message : 'Erro ao conectar com a API de clima.';
        console.error(`[Backend] Falha ao buscar previsão para '${cidade}': ${status} - ${message}`);
        res.status(status).json({ error: `Falha ao buscar previsão: ${message}` });
    }
});

// --- INICIALIZAÇÃO DO SERVIDOR ---
// Primeiro conecta ao DB, depois inicia o servidor Express
connectToDb().then(() => {
    app.listen(PORT, () => {
        console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
        console.log('----------------------------------------------------');
        console.log('IMPORTANTE: Acesse http://localhost:3001/api/seed UMA VEZ para popular o banco de dados.');
        console.log('----------------------------------------------------');
    });
}).catch(console.error);
