// server.js - VERSÃO COMPLETA E CORRIGIDA

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Importação dos modelos
import Veiculo from './models/veiculo.js';
import Manutencao from './models/manutencao.js';
import User from './models/User.js'; // <-- Importa o novo modelo de usuário

// --- 2. Configuração de Variáveis de Ambiente ---
dotenv.config();

// --- 3. Constantes e Configuração Inicial ---
const app = express();
const PORT = process.env.PORT || 3001;
const mongoUrl = process.env.DATABASE_URL;
const JWT_SECRET = process.env.JWT_SECRET || 'seu_segredo_super_secreto_para_desenvolvimento'; // <-- Adicione uma JWT_SECRET no seu .env para produção!

// --- 4. Middlewares ---
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// --- 5. Conexão com o Banco de Dados ---
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

// --- NOVO: MIDDLEWARE DE AUTENTICAÇÃO ---
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Formato esperado: "Bearer TOKEN"

    if (token == null) {
        return res.sendStatus(401); // Unauthorized: Se não há token
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.sendStatus(403); // Forbidden: Se o token for inválido
        }
        req.user = user; // Adiciona os dados do usuário (ex: id, email) ao objeto da requisição
        next(); // Continua para a rota
    });
};

// --- NOVAS: ROTAS DE AUTENTICAÇÃO ---

// [REGISTER] POST /api/auth/register
app.post('/api/auth/register', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });
        }
        const newUser = new User({ email, password });
        await newUser.save();
        res.status(201).json({ message: 'Usuário registrado com sucesso!' });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ error: 'Este e-mail já está em uso.' });
        }
        res.status(500).json({ error: 'Erro ao registrar usuário.', details: error.message });
    }
});

// [LOGIN] POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: 'Credenciais inválidas.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Credenciais inválidas.' });
        }

        const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '8h' });
        res.json({ message: 'Login bem-sucedido!', token });
    } catch (error) {
        res.status(500).json({ error: 'Erro interno no servidor.' });
    }
});

// --- ENDPOINTS CRUD PARA VEÍCULOS (AGORA PROTEGIDOS E ATUALIZADOS) ---

// [CREATE] POST /api/veiculos
app.post('/api/veiculos', authenticateToken, async (req, res) => { // <-- Rota protegida
    try {
        const novoVeiculoData = {
            ...req.body,
            owner: req.user.id // <-- Associa o veículo ao usuário logado
        };
        const veiculoCriado = await Veiculo.create(novoVeiculoData);
        res.status(201).json(veiculoCriado);
    } catch (error) {
        res.status(500).json({ error: 'Erro interno ao criar veículo.' });
    }
});

// [READ ALL] GET /api/veiculos
app.get('/api/veiculos', authenticateToken, async (req, res) => { // <-- Rota protegida
    try {
        // Encontra apenas os veículos cujo 'owner' seja o ID do usuário logado
        const veiculos = await Veiculo.find({ owner: req.user.id });
        res.status(200).json(veiculos);
    } catch (error) {
        res.status(500).json({ error: 'Erro interno ao buscar veículos.' });
    }
});

// Outras rotas (GET ONE, UPDATE, DELETE) também devem ser protegidas com `authenticateToken`
// e devem verificar se o veículo pertence ao usuário logado antes de realizar a ação.

// Exemplo para DELETE:
app.delete('/api/veiculos/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        
        const veiculo = await Veiculo.findOne({ _id: id, owner: req.user.id });
        if (!veiculo) {
            return res.status(404).json({ error: 'Veículo não encontrado ou não pertence a este usuário.' });
        }
        
        await Manutencao.deleteMany({ veiculo: id });
        await Veiculo.findByIdAndDelete(id);

        res.status(200).json({ message: 'Veículo removido com sucesso.' });
    } catch (error) {
        res.status(500).json({ error: 'Erro interno ao remover veículo.' });
    }
});


// --- ENDPOINTS CRUD PARA MANUTENÇÕES ---

/**
 * [CREATE] POST /api/veiculos/:veiculoId/manutencoes
 */
app.post('/api/veiculos/:veiculoId/manutencoes', async (req, res) => {
    try {
        const { veiculoId } = req.params;
        const { descricaoServico, custo, quilometragem } = req.body;

        const veiculoExiste = await Veiculo.findById(veiculoId);
        if (!veiculoExiste) {
            return res.status(404).json({ error: 'Veículo não encontrado. Não é possível registrar a manutenção.' });
        }

        const novaManutencao = await Manutencao.create({
            descricaoServico,
            custo,
            quilometragem,
            veiculo: veiculoId
        });

        console.log(`[Servidor] Nova manutenção registrada para o veículo ${veiculoId}`);
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
 */
app.get('/api/veiculos/:veiculoId/manutencoes', async (req, res) => {
    try {
        const { veiculoId } = req.params;
        const historico = await Manutencao.find({ veiculo: veiculoId }).sort({ data: -1 });

        console.log(`[Servidor] Encontrado histórico de ${historico.length} manutenções para o veículo ${veiculoId}.`);
        res.status(200).json(historico);
    } catch (error) {
        console.error(`[Servidor] Erro ao buscar histórico do veículo ${req.params.veiculoId}:`, error);
        res.status(500).json({ error: 'Erro interno ao buscar o histórico de manutenções.' });
    }
});

mongoose.connect(mongoUrl)
  .then(() => {
    console.log('✅ Conectado com sucesso ao MongoDB Atlas via Mongoose!');

    // >>>>> ESTA É A PARTE CRÍTICA <<<<<
    // O SERVIDOR SÓ COMEÇA A "ESCUTAR" DEPOIS QUE A CONEXÃO COM O BANCO DÁ CERTO.
    app.listen(PORT, () => {
        console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
    });
    // >>>>> FIM DA PARTE CRÍTICA <<<<<

  })
  .catch((error) => {
    console.error('❌ Erro ao conectar com o MongoDB Atlas:', error.message);
    process.exit(1);
  });