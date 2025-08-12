// server.js

// --- 1. Importações ---
import express from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Veiculo from "./models/veiculo.js";
import Manutencao from "./models/manutencao.js"; // <-- NOVO: Importa o modelo Manutencao

// --- 2. Configuração de Variáveis de Ambiente ---
dotenv.config();

// --- 3. Constantes e Configuração Inicial ---
const app = express();
const PORT = process.env.PORT || 3001;
const mongoUrl = process.env.DATABASE_URL;

// --- 4. Middlewares ---
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// --- 5. Conexão com o Banco de Dados (via Mongoose) ---
if (!mongoUrl) {
    console.error("❌ ERRO: A variável de ambiente DATABASE_URL não foi encontrada. Verifique seu arquivo .env.");
    process.exit(1);
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

// --- ENDPOINTS CRUD PARA VEÍCULOS (Sem alterações) ---

/**
 * [CREATE] POST /api/veiculos
 */
app.post('/api/veiculos', async (req, res) => {
    try {
        const novoVeiculoData = req.body;
        const veiculoCriado = await Veiculo.create(novoVeiculoData);
        console.log('[Servidor] Veículo criado com sucesso:', veiculoCriado);
        res.status(201).json(veiculoCriado);
    } catch (error) {
        console.error("[Servidor] Erro ao criar veículo:", error);
        if (error.code === 11000) return res.status(409).json({ error: 'Veículo com esta placa já existe.' });
        if (error.name === 'ValidationError') return res.status(400).json({ error: Object.values(error.errors).map(val => val.message).join(' ') });
        res.status(500).json({ error: 'Erro interno ao criar veículo.' });
    }
});

/**
 * [READ ALL] GET /api/veiculos
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
 * [DELETE] DELETE /api/veiculos/:id 
 */
app.delete('/api/veiculos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const veiculoParaRemover = await Veiculo.findById(id);
        if (!veiculoParaRemover) {
            return res.status(404).json({ error: 'Veículo não encontrado para remoção.' });
        }
        
        // Antes de remover o veículo, remove todas as manutenções associadas a ele.
        await Manutencao.deleteMany({ veiculo: id });
        console.log(`[Servidor] Manutenções do veículo ${id} foram removidas.`);

        // Agora remove o veículo.
        const veiculoRemovido = await Veiculo.findByIdAndDelete(id);
        console.log(`[Servidor] Veículo removido: ${id}`);
        res.status(200).json({ message: 'Veículo e seu histórico de manutenção foram removidos com sucesso.' }); 
        
    } catch (error) {
        console.error(`[Servidor] Erro ao remover veículo e suas manutenções ${req.params.id}:`, error);
        res.status(500).json({ error: 'Erro interno ao remover veículo.' });
    }
});


// --- NOVO: ENDPOINTS CRUD PARA MANUTENÇÕES ---

/**
 * [CREATE] POST /api/manutencoes
 * Endpoint para registrar uma nova manutenção para um veículo.
 * O corpo da requisição deve conter os dados da manutenção e o _id do veículo.
 */
app.post('/api/manutencoes', async (req, res) => {
    try {
        const { descricaoServico, custo, quilometragem, veiculo } = req.body;

        // Verifica se o veículo associado realmente existe
        const veiculoExiste = await Veiculo.findById(veiculo);
        if (!veiculoExiste) {
            return res.status(404).json({ error: 'Veículo não encontrado. Não é possível registrar a manutenção.' });
        }

        const novaManutencao = await Manutencao.create({
            descricaoServico,
            custo,
            quilometragem,
            veiculo // Link para o veículo
        });

        console.log(`[Servidor] Nova manutenção registrada para o veículo ${veiculo}`);
        res.status(201).json(novaManutencao);

    } catch (error) {
        console.error("[Servidor] Erro ao registrar manutenção:", error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ error: Object.values(error.errors).map(val => val.message).join(' ') });
        }
        res.status(500).json({ error: 'Erro interno ao registrar manutenção.' });
    }
});

/**
 * [READ ALL FOR A VEHICLE] GET /api/veiculos/:veiculoId/manutencoes
 * Endpoint para buscar todas as manutenções de um veículo específico.
 * Demonstra o poder do relacionamento.
 */
app.get('/api/veiculos/:veiculoId/manutencoes', async (req, res) => {
    try {
        const { veiculoId } = req.params;

        // Busca todas as manutenções que têm o campo 'veiculo' igual a veiculoId.
        // .sort({ data: -1 }) ordena os resultados da data mais recente para a mais antiga.
        const historico = await Manutencao.find({ veiculo: veiculoId }).sort({ data: -1 });

        console.log(`[Servidor] Encontrado histórico de ${historico.length} manutenções para o veículo ${veiculoId}.`);
        res.status(200).json(historico);

    } catch (error) {
        console.error(`[Servidor] Erro ao buscar histórico do veículo ${req.params.veiculoId}:`, error);
        res.status(500).json({ error: 'Erro interno ao buscar o histórico de manutenções.' });
    }
});


/**
 * [DELETE] DELETE /api/manutencoes/:id
 * Endpoint para remover um registro de manutenção específico.
 */
app.delete('/api/manutencoes/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const manutencaoRemovida = await Manutencao.findByIdAndDelete(id);

        if (!manutencaoRemovida) {
            return res.status(404).json({ error: 'Registro de manutenção não encontrado.' });
        }

        console.log(`[Servidor] Registro de manutenção removido: ${id}`);
        res.status(200).json({ message: 'Registro de manutenção removido com sucesso.' });

    } catch (error) {
        console.error(`[Servidor] Erro ao remover manutenção ${req.params.id}:`, error);
        res.status(500).json({ error: 'Erro interno ao remover manutenção.' });
    }
});


// --- ROTA PROXY PARA API DE CLIMA (Sem alterações) ---
app.get('/api/previsao/:cidade', async (req, res) => {
    //... (código existente sem modificações)
});