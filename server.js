// server.js (Ordem de execução corrigida)

// --- 1. Importações ---
import express from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv'; // dotenv precisa ser importado
import mongoose from 'mongoose';
import Veiculo from "./models/veiculo.js"; 

// --- 2. Configuração de Variáveis de Ambiente ---
// GARANTA QUE ESTA LINHA SEJA EXECUTADA IMEDIATAMENTE APÓS AS IMPORTAÇÕES!
dotenv.config(); 

// --- 3. Constantes e Configuração Inicial ---
const app = express();
const PORT = process.env.PORT || 3001;
// Esta linha agora vai ler a variável DEPOIS que o dotenv.config() já rodou.
const mongoUrl = process.env.DATABASE_URL; 

// --- 4. Middlewares ---
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// --- 5. Conexão com o Banco de Dados (via Mongoose) ---
// Verifica se a mongoUrl foi carregada antes de tentar conectar
if (!mongoUrl) {
    console.error("❌ ERRO: A variável de ambiente DATABASE_URL não foi encontrada. Verifique seu arquivo .env.");
    process.exit(1); // Encerra o processo se a URL do DB não estiver disponível
}

mongoose.connect(mongoUrl)
  .then(() => {
    console.log('✅ Conectado com sucesso ao MongoDB Atlas via Mongoose!');
    app.listen(PORT, () => {
        console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('❌ Erro ao conectar com o MongoDB Atlas:', error.message);
    process.exit(1);
  });
// --- 5. Endpoints (Rotas da API) ---

/**
 * Rota Principal (Boas-vindas)
 */
app.get('/', (req, res) => {
    res.send('<h1>API da Garagem Inteligente Conectada está no ar!</h1>');
});


// --- ENDPOINTS CRUD PARA VEÍCULOS ---

/**
 * [CREATE] POST /api/veiculos
 * Endpoint para criar um novo veículo.
 */
app.post('/api/veiculos', async (req, res) => {
    try {
        const novoVeiculoData = req.body;
        const veiculoCriado = await Veiculo.create(novoVeiculoData);
        
        console.log('[Servidor] Veículo criado com sucesso:', veiculoCriado);
        res.status(201).json(veiculoCriado);

    } catch (error) {
        console.error("[Servidor] Erro ao criar veículo:", error);
        
        if (error.code === 11000) {
            return res.status(409).json({ error: 'Veículo com esta placa já existe.' });
        }
        if (error.name === 'ValidationError') {
             const messages = Object.values(error.errors).map(val => val.message);
             return res.status(400).json({ error: messages.join(' ') });
        }
        
        res.status(500).json({ error: 'Erro interno ao criar veículo.' });
    }
});

/**
 * [READ ALL] GET /api/veiculos
 * Endpoint para buscar todos os veículos.
 */
app.get('/api/veiculos', async (req, res) => {
    try {
        const veiculos = await Veiculo.find();
        console.log(`[Servidor] ${veiculos.length} veículos encontrados.`);
        res.status(200).json(veiculos);
    } catch (error) {
        console.error("[Servidor] Erro ao buscar veículos:", error);
        res.status(500).json({ error: 'Erro interno ao buscar veículos.' });
    }
});

/**
 * [READ ONE] GET /api/veiculos/:id
 * Endpoint para buscar um único veículo pelo seu _id.
 */
app.get('/api/veiculos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const veiculo = await Veiculo.findById(id);

        if (!veiculo) {
            return res.status(404).json({ error: 'Veículo não encontrado.' });
        }

        console.log(`[Servidor] Veículo encontrado: ${id}`);
        res.status(200).json(veiculo);

    } catch (error) {
        console.error("[Servidor] Erro ao buscar veículo por ID:", error);
        res.status(500).json({ error: 'Erro interno ao buscar veículo.' });
    }
});

/**
 * [UPDATE] PUT /api/veiculos/:id
 * Endpoint para atualizar um veículo existente pelo seu _id.
 */
app.put('/api/veiculos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const veiculoAtualizadoData = req.body;

        const veiculoAtualizado = await Veiculo.findByIdAndUpdate(
            id, 
            veiculoAtualizadoData, 
            { new: true, runValidators: true } // Opções importantes!
        );

        if (!veiculoAtualizado) {
            return res.status(404).json({ error: 'Veículo não encontrado para atualização.' });
        }

        console.log(`[Servidor] Veículo atualizado: ${id}`);
        res.status(200).json(veiculoAtualizado);

    } catch (error) {
        console.error(`[Servidor] Erro ao atualizar veículo ${req.params.id}:`, error);
        // Reutiliza a mesma lógica de tratamento de erro do POST
        if (error.code === 11000) {
            return res.status(409).json({ error: 'Veículo com esta placa já existe.' });
        }
        if (error.name === 'ValidationError') {
             const messages = Object.values(error.errors).map(val => val.message);
             return res.status(400).json({ error: messages.join(' ') });
        }
        res.status(500).json({ error: 'Erro interno ao atualizar veículo.' });
    }
});

/**
 * [DELETE] DELETE /api/veiculos/:id
 * Endpoint para remover um veículo pelo seu _id.
 */
app.delete('/api/veiculos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const veiculoRemovido = await Veiculo.findByIdAndDelete(id);

        if (!veiculoRemovido) {
            return res.status(404).json({ error: 'Veículo não encontrado para remoção.' });
        }

        console.log(`[Servidor] Veículo removido: ${id}`);
        res.status(200).json({ message: 'Veículo removido com sucesso.' });
        
    } catch (error) {
        console.error(`[Servidor] Erro ao remover veículo ${req.params.id}:`, error);
        res.status(500).json({ error: 'Erro interno ao remover veículo.' });
    }
});


// --- ROTA PROXY PARA API DE CLIMA (sem alterações) ---
app.get('/api/previsao/:cidade', async (req, res) => {
    // ... (código da API de clima permanece o mesmo)
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