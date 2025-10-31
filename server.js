// server.js - VERSÃO CORRIGIDA E LIMPA

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Importação dos modelos
import Veiculo from './models/veiculo.js';
import Manutencao from './models/manutencao.js';
import User from './models/User.js';

// --- Configuração de Variáveis de Ambiente ---
dotenv.config();

// --- Constantes e Configuração Inicial ---
const app = express();
const PORT = process.env.PORT || 3001; // Vai usar a porta 3001 do seu .env
const mongoUrl = process.env.DATABASE_URL;
const JWT_SECRET = process.env.JWT_SECRET || 'seu_segredo_super_secreto_para_desenvolvimento';

// --- Middlewares ---
app.use(cors());
app.use(express.json());
// <<< IMPORTANTE: Serve os arquivos da pasta 'public'
app.use(express.static('public')); 

// --- Conexão com o Banco de Dados e Inicialização do Servidor ---
mongoose.connect(mongoUrl)
  .then(() => {
    console.log('✅ Conectado com sucesso ao MongoDB Atlas via Mongoose!');
    // O SERVIDOR SÓ COMEÇA A "ESCUTAR" DEPOIS QUE A CONEXÃO DÁ CERTO.
    app.listen(PORT, () => {
        console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('❌ Erro ao conectar com o MongoDB Atlas:', error.message);
    process.exit(1);
  });

// --- MIDDLEWARE DE AUTENTICAÇÃO ---
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// --- ROTAS DE AUTENTICAÇÃO ---

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

// --- ENDPOINTS CRUD PARA VEÍCULOS (PROTEGIDOS) ---

// [CREATE] POST /api/veiculos
app.post('/api/veiculos', authenticateToken, async (req, res) => {
    try {
        const novoVeiculoData = { ...req.body, owner: req.user.id };
        const veiculoCriado = await Veiculo.create(novoVeiculoData);
        res.status(201).json(veiculoCriado);
    } catch (error) {
        res.status(500).json({ error: 'Erro interno ao criar veículo.' });
    }
});

// [READ ALL] GET /api/veiculos
app.get('/api/veiculos', authenticateToken, async (req, res) => {
    try {
        const veiculos = await Veiculo.find({ owner: req.user.id });
        res.status(200).json(veiculos);
    } catch (error) {
        res.status(500).json({ error: 'Erro interno ao buscar veículos.' });
    }
});

// [DELETE] DELETE /api/veiculos/:id
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

// [CREATE] POST /api/veiculos/:veiculoId/manutencoes
app.post('/api/veiculos/:veiculoId/manutencoes', authenticateToken, async (req, res) => {
    try {
        const { veiculoId } = req.params;
        // Validação para garantir que o usuário só adicione manutenção a um veículo que lhe pertence
        const veiculo = await Veiculo.findOne({ _id: veiculoId, owner: req.user.id });
        if (!veiculo) {
            return res.status(404).json({ error: 'Veículo não encontrado ou não autorizado.' });
        }

        const novaManutencao = await Manutencao.create({
            ...req.body,
            veiculo: veiculoId
        });
        res.status(201).json(novaManutencao);
    } catch (error) {
        res.status(500).json({ error: 'Erro interno ao registrar manutenção.' });
    }
});

// [READ ALL FOR A VEHICLE] GET /api/veiculos/:veiculoId/manutencoes
app.get('/api/veiculos/:veiculoId/manutencoes', authenticateToken, async (req, res) => {
    try {
        const { veiculoId } = req.params;
        const veiculo = await Veiculo.findOne({ _id: veiculoId, owner: req.user.id });
        if (!veiculo) {
            return res.status(404).json({ error: 'Veículo não encontrado ou não autorizado.' });
        }
        
        const historico = await Manutencao.find({ veiculo: veiculoId }).sort({ data: -1 });
        res.status(200).json(historico);
    } catch (error) {
        res.status(500).json({ error: 'Erro interno ao buscar o histórico.' });
    }
});